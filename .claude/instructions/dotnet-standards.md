# .NET Code Standards

## Target Framework

- .NET 10.0
- C# 13
- Nullable reference types enabled

## Naming Conventions

```csharp
// Types - PascalCase
public class OrderProcessor { }
public interface IOrderProcessor { }
public record Money(decimal Amount, string Currency);

// Methods - PascalCase
public void ProcessOrder() { }
public async Task<Order> LoadAsync() { }  // Async suffix for async methods

// Properties - PascalCase
public string CustomerName { get; set; }
public decimal Amount { get; init; }

// Private fields - _camelCase
private readonly ILogger _logger;
private readonly IEmailService _emailService;

// Parameters and locals - camelCase
public void Process(UserData userData)
{
    var validationResult = ValidateUser(userData);
}

// Constants - PascalCase
public const int MaxRetryAttempts = 3;
private const string CachePrefix = "user:";
```

## Async Patterns

```csharp
// Always use Async suffix
public async Task<User> GetUserAsync(UserId userId)
{
    return await _repository.FindByIdAsync(userId);
}

// Use ConfigureAwait(false) in libraries
await SomeOperationAsync().ConfigureAwait(false);

// Prefer ValueTask for hot paths that often complete synchronously
public ValueTask<byte[]?> TryGetCachedAsync(string key);
```

## Nullability

```csharp
// Explicit nullable reference types
public string? OptionalValue { get; }
public string RequiredValue { get; }

// Guard clauses
public void Process(Image image)
{
    ArgumentNullException.ThrowIfNull(image);
}

// Null-conditional and coalescing
var name = user?.Name ?? "Unknown";
```

## Dependency Injection

```csharp
// Constructor injection
public class UserService
{
    private readonly IUserRepository _repository;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository repository, ILogger<UserService> logger)
    {
        _repository = repository;
        _logger = logger;
    }
}

// Registration in Program.cs
builder.Services.AddScoped<IUserRepository, PostgresUserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
```

## Error Handling

```csharp
// Domain exceptions for business rules
public class OrderNotFoundException : DomainException
{
    public Guid OrderId { get; }

    public OrderNotFoundException(Guid id)
        : base($"Order {id} not found")
    {
        OrderId = id;
    }
}

// Result pattern for expected failures
public record Result<T>(T? Value, string? Error, bool IsSuccess)
{
    public static Result<T> Success(T value) => new(value, null, true);
    public static Result<T> Failure(string error) => new(default, error, false);
}
```

## Logging

```csharp
// Structured logging with templates
_logger.LogInformation("User {UserId} created successfully in {ElapsedMs}ms",
    userId, stopwatch.ElapsedMilliseconds);

// Never use string interpolation in log messages
// BAD: _logger.LogInformation($"Processing {userId}");
// GOOD: _logger.LogInformation("Processing {UserId}", userId);
```

## File Organization

```
src/{PROJECTNAME_PASCAL}.{Layer}/
├── {Feature}/
│   ├── {Type}s/
│   │   └── {Name}.cs
```

One type per file. File name matches type name.

## Port Configuration (MANDATORY)

**All port numbers MUST be defined in `ports.env` at the repository root.**

```env
# ports.env - Single Source of Truth for all ports
PORT_POSTGRES=5432
PORT_ELASTICSEARCH=9200
PORT_KIBANA=5601
PORT_API_HTTP=5000
PORT_API_HTTPS=5001
PORT_SUPABASE_API=54321
PORT_SUPABASE_DB=54322
PORT_SUPABASE_STUDIO=54323
```

### Rules

1. **NEVER hardcode port numbers** in code, configs, or docker files
2. **Always use environment variables** from `ports.env`
3. **When adding a new service**, first add its port to `ports.env`
4. **In docker-compose**, use `${PORT_*:-default}` syntax
5. **In documentation**, reference `ports.env` instead of hardcoding

### Examples

```yaml
# docker-compose.yml - CORRECT
ports:
  - "${PORT_POSTGRES:-5432}:5432"

# docker-compose.yml - WRONG
ports:
  - "5432:5432"
```

```csharp
// appsettings.json - Use configuration, not hardcoded ports
"Elasticsearch": {
  "Url": "http://localhost:${PORT_ELASTICSEARCH}"
}
```

### Rationale

- Single source of truth prevents port conflicts
- Easy to change ports across entire stack
- Self-documenting which ports are in use
- Consistent across all environments
