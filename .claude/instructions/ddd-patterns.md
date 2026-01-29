# Domain-Driven Design Patterns

## Why DDD for Agentic Development?

DDD patterns add **semantic meaning** to your codebase. This benefits both the compiler and LLMs:

| Benefit | Primitive Types | DDD Types |
|---------|-----------------|-----------|
| **Compile-time safety** | `void Process(string id, string email)` - easy to swap arguments | `void Process(CustomerId id, EmailAddress email)` - compiler catches mistakes |
| **LLM understanding** | Claude sees "a string" | Claude sees "a validated customer identifier" |
| **Error messages** | "string was null" | "CustomerId.Create failed: ID cannot be empty" |
| **Code navigation** | Search for string usages (thousands) | Search for CustomerId usages (precise) |
| **Refactoring** | Rename string variable (risky) | Rename CustomerId type (safe, IDE-assisted) |

**For LLM-assisted development:**

- Value Objects like `CustomerId`, `Money`, `EmailAddress` give Claude context about what data represents
- Factory methods with `Result<T, Error>` let Claude understand validation rules from type signatures
- Domain Events document what state changes matter in your system
- Rich domain models make business logic discoverable through entity methods

```csharp
// ❌ Claude sees: "a method that takes two strings and returns a string"
string ProcessOrder(string customerId, string amount);

// ✅ Claude sees: "a method that creates an Order for a Customer with validated Money,
//                  returning either the Order or a domain-specific error"
Result<Order, Error> CreateOrder(CustomerId customerId, Money amount);
```

---

## Core Principles

1. **Aggregates** - Consistency boundaries with a single root entity
2. **Rich Domain Models** - Entities encapsulate behavior, not just data
3. **Value Objects** - Self-validating immutable domain primitives
4. **Result<T, Error>** - Railway-oriented programming, no exceptions for business logic
5. **Domain Events** - Capture important state changes
6. **Factory Methods** - Controlled entity creation with validation
7. **Repositories** - Collection-like interface for aggregate persistence
8. **Domain Services** - Business logic that spans multiple aggregates

---

## Aggregates

**An Aggregate is a cluster of domain objects treated as a single unit for data changes.**

### Aggregate Root

The root entity is the only entry point to the aggregate. External code cannot hold references to internal entities.

```csharp
// Order is the Aggregate Root
// OrderLine is an internal entity - only accessible through Order
public sealed class Order : AggregateRoot
{
    public CustomerId CustomerId { get; private set; }
    public OrderStatus Status { get; private set; }

    private readonly List<OrderLine> _lines = new();
    public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();

    // ✅ All modifications go through the aggregate root
    public Result<OrderLine, Error> AddLine(ProductId productId, int quantity, Money price)
    {
        if (Status != OrderStatus.Draft)
            return OrderErrors.NotEditable;

        var line = new OrderLine(Id, productId, quantity, price);
        _lines.Add(line);
        RecalculateTotal();
        return line;
    }

    public Result<Unit, Error> RemoveLine(Guid lineId)
    {
        var line = _lines.FirstOrDefault(l => l.Id == lineId);
        if (line is null)
            return OrderErrors.LineNotFound(lineId);

        _lines.Remove(line);
        RecalculateTotal();
        return Unit.Value;
    }
}

// ❌ WRONG: External code directly modifies OrderLine
// order.Lines[0].Quantity = 10;

// ✅ CORRECT: Go through the aggregate root
// order.UpdateLineQuantity(lineId, 10);
```

### Aggregate Base Class

```csharp
public abstract class AggregateRoot : Entity
{
    public int Version { get; protected set; }

    // For optimistic concurrency
    public void IncrementVersion() => Version++;
}
```

### Aggregate Boundaries

**Rule: One aggregate = one transaction. Never modify multiple aggregates in a single transaction.**

```csharp
// ❌ WRONG: Modifying two aggregates in one transaction
public async Task TransferOrder(Order fromOrder, Order toOrder, OrderLine line)
{
    fromOrder.RemoveLine(line.Id);
    toOrder.AddLine(line.ProductId, line.Quantity, line.Price);
    await _unitOfWork.SaveChangesAsync();  // Two aggregates, one transaction!
}

// ✅ CORRECT: Use domain events for eventual consistency
public async Task TransferOrder(Order fromOrder, Guid toOrderId, Guid lineId)
{
    var result = fromOrder.RemoveLine(lineId);
    if (result.IsSuccess)
    {
        fromOrder.RaiseDomainEvent(new LineTransferredEvent(
            fromOrder.Id, toOrderId, lineId));
    }
    await _unitOfWork.SaveChangesAsync();  // Single aggregate
}

// Event handler adds to target order in separate transaction
public class LineTransferredEventHandler : INotificationHandler<LineTransferredEvent>
{
    public async Task Handle(LineTransferredEvent notification, CancellationToken ct)
    {
        var toOrder = await _orderRepository.GetByIdAsync(notification.ToOrderId, ct);
        toOrder.AddTransferredLine(notification.LineId, ...);
        await _unitOfWork.SaveChangesAsync(ct);
    }
}
```

### Reference by Identity

**Aggregates reference other aggregates only by ID, never by direct object reference.**

```csharp
public sealed class Order : AggregateRoot
{
    // ✅ Reference by ID
    public CustomerId CustomerId { get; private set; }
    public ProductId ProductId { get; private set; }

    // ❌ Never hold object references to other aggregates
    // public Customer Customer { get; private set; }
    // public Product Product { get; private set; }
}
```

### Aggregate Design Guidelines

| Guideline | Reason |
|-----------|--------|
| Keep aggregates small | Smaller = fewer concurrency conflicts |
| Reference by ID only | Prevents accidental cross-aggregate modifications |
| One aggregate per transaction | Ensures consistency boundaries |
| Protect invariants in the root | The root guards all business rules |
| Make internal entities inaccessible | Only expose IReadOnlyList, not List |

---

## Rich Domain Models

**Always favor rich domain models that encapsulate business logic**:

```csharp
// ❌ ANEMIC MODEL (Avoid)
public class Order
{
    public string CustomerId { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; }
}

// ✅ RICH MODEL (Preferred)
public sealed class Order : Entity
{
    public CustomerId CustomerId { get; private set; }
    public Money Total { get; private set; }
    public OrderStatus Status { get; private set; }

    private readonly List<OrderLine> _lines = new();
    public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();

    // Private constructor - force factory method
    private Order() { }

    // Factory method with validation
    public static Result<Order, Error> Create(string customerId, string currency)
    {
        var customerIdResult = CustomerId.Create(customerId);
        if (customerIdResult.IsFailure)
            return customerIdResult.Error;

        var moneyResult = Money.Create(0, currency);
        if (moneyResult.IsFailure)
            return moneyResult.Error;

        var order = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = customerIdResult.Value,
            Total = moneyResult.Value,
            Status = OrderStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };

        order.RaiseDomainEvent(new OrderCreatedEvent(order.Id));
        return order;
    }

    // Business behavior in entity
    public Result<OrderLine, Error> AddLine(ProductId productId, int quantity, Money price)
    {
        if (Status != OrderStatus.Draft)
            return OrderErrors.NotEditable;

        if (_lines.Any(l => l.ProductId == productId))
            return OrderErrors.ProductAlreadyInOrder(productId);

        var line = OrderLine.Create(Id, productId, quantity, price);
        _lines.Add(line.Value);
        RecalculateTotal();

        return line;
    }
}
```

---

## Value Objects

**Use value objects for domain primitives with validation. This eliminates "primitive obsession" - the anti-pattern of using raw strings, ints, and decimals for domain concepts.**

### Why Value Objects?

```csharp
// ❌ PRIMITIVE OBSESSION - raw types leak invalid state
public class Order
{
    public string CustomerId { get; set; }     // Empty string? Null? "abc"?
    public string Email { get; set; }          // "not-an-email"?
    public decimal Total { get; set; }         // Negative? What currency?
    public string Currency { get; set; }       // "USD" or "usd" or "US Dollar"?
}

// ✅ VALUE OBJECTS - invalid state is unrepresentable
public class Order
{
    public CustomerId CustomerId { get; private set; }  // Validated on creation
    public EmailAddress Email { get; private set; }     // Always valid format
    public Money Total { get; private set; }            // Amount + Currency together
}
```

### Value Object Examples

```csharp
public sealed class EmailAddress : ValueObject
{
    public string Value { get; }

    private EmailAddress(string value)
    {
        Value = value;
    }

    public static Result<EmailAddress, Error> Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return UserErrors.EmailRequired;

        if (!email.Contains('@'))
            return UserErrors.InvalidEmailFormat;

        return new EmailAddress(email.ToLowerInvariant());
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}

public sealed class Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }

    private Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public static Result<Money, Error> Create(decimal amount, string currency)
    {
        if (amount < 0)
            return OrderErrors.NegativeAmount;

        if (string.IsNullOrWhiteSpace(currency))
            return OrderErrors.CurrencyRequired;

        return new Money(amount, currency.ToUpperInvariant());
    }

    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException("Cannot add different currencies");
        return new Money(Amount + other.Amount, Currency);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }
}
```

---

## Error Handling with Result<T, Error>

### Error Type

```csharp
public sealed record Error
{
    public string Code { get; }
    public string Message { get; }
    public ErrorType Type { get; }

    private Error(string code, string message, ErrorType type)
    {
        Code = code;
        Message = message;
        Type = type;
    }

    public static Error Validation(string code, string message) =>
        new(code, message, ErrorType.Validation);

    public static Error NotFound(string code, string message) =>
        new(code, message, ErrorType.NotFound);

    public static Error Conflict(string code, string message) =>
        new(code, message, ErrorType.Conflict);
}

public enum ErrorType
{
    None = 0,
    Validation = 1,
    NotFound = 2,
    Conflict = 3,
    Failure = 4
}
```

### Static Errors Classes

**Centralize error creation in static classes per bounded context**:

```csharp
// Domain/Errors/OrderErrors.cs
public static class OrderErrors
{
    public static Error NegativeAmount => Error.Validation(
        "Order.NegativeAmount",
        "Order amount must be non-negative");

    public static Error NotEditable => Error.Validation(
        "Order.NotEditable",
        "Order can only be modified when in Draft status");

    public static Error NotFound(Guid orderId) => Error.NotFound(
        "Order.NotFound",
        $"Order with ID '{orderId}' was not found");

    public static Error ProductAlreadyInOrder(ProductId productId) => Error.Conflict(
        "Order.ProductAlreadyInOrder",
        $"Product {productId} is already in this order");

    public static Error CurrencyRequired => Error.Validation(
        "Order.CurrencyRequired",
        "Currency is required");
}

// Domain/Errors/UserErrors.cs
public static class UserErrors
{
    public static Error EmailRequired => Error.Validation(
        "User.EmailRequired",
        "Email address is required");

    public static Error InvalidEmailFormat => Error.Validation(
        "User.InvalidEmailFormat",
        "Email address format is invalid");
}
```

### Implicit Conversion

**Leverage implicit conversion - return T or Error directly**:

```csharp
public static Result<Order, Error> Create(string customerId, string currency)
{
    if (string.IsNullOrEmpty(customerId))
        return OrderErrors.CustomerRequired;  // Implicit Error → Result

    var moneyResult = Money.Create(0, currency);
    if (moneyResult.IsFailure)
        return moneyResult.Error;  // Propagate error

    var order = new Order { ... };
    return order;  // Implicit Order → Result<Order, Error>
}
```

---

## Domain Events

```csharp
// Base interface
public interface IDomainEvent
{
    Guid Id { get; }
    DateTime OccurredOn { get; }
}

// Base record
public abstract record DomainEvent(Guid Id, DateTime OccurredOn) : IDomainEvent
{
    protected DomainEvent() : this(Guid.NewGuid(), DateTime.UtcNow) { }
}
```

**Entity base class with event support**:

```csharp
public abstract class Entity : CSharpFunctionalExtensions.Entity<Guid>
{
    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void RaiseDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}
```

### Event Categories

Domain events serve two key purposes:

#### Business Process Events

Decouple workflows and enable async operations:

```csharp
// Triggered when order is created
public sealed record OrderCreatedEvent(Guid OrderId, Guid CustomerId) : DomainEvent;

// Triggered when order is submitted for processing
public sealed record OrderSubmittedEvent(Guid OrderId, Money Total) : DomainEvent;

// Triggered on processing failure
public sealed record OrderProcessingFailedEvent(Guid OrderId, string Reason) : DomainEvent;

// Triggered when payment is confirmed
public sealed record PaymentConfirmedEvent(Guid OrderId, string TransactionId) : DomainEvent;
```

#### Audit/Compliance Events

Track access and modification for compliance:

```csharp
// Triggered when user views sensitive data
public sealed record DataAccessedEvent(Guid EntityId, string UserId, DateTime AccessedAt) : DomainEvent;

// Triggered on any entity modification
public sealed record EntityModifiedEvent(Guid EntityId, string UserId, string ChangeType) : DomainEvent;

// Triggered on entity deletion (soft or hard)
public sealed record EntityDeletedEvent(Guid EntityId, string UserId, string Reason) : DomainEvent;
```

#### Raising Events in Entities

```csharp
public sealed class Order : Entity
{
    public Result<Unit, Error> Submit()
    {
        Status = OrderStatus.Submitted;
        RaiseDomainEvent(new OrderSubmittedEvent(Id, Total));
        return Unit.Value;
    }

    public void RecordAccess(string userId)
    {
        RaiseDomainEvent(new DataAccessedEvent(Id, userId, DateTime.UtcNow));
    }
}
```

---

## Selective Event Sourcing

Use **Selective Event Sourcing** for audit aggregates only. This provides full audit flexibility for compliance while keeping operational entities simple.

| Aggregate | Pattern | Reason |
|-----------|---------|--------|
| `Order` | Traditional CRUD | Operational, simple lifecycle |
| `AuditLog` | Event Sourced | Compliance, immutable, replayable |

```csharp
// Event-sourced audit aggregate
public sealed class AuditLog : AggregateRoot
{
    private readonly List<AuditEvent> _events = new();
    public IReadOnlyList<AuditEvent> Events => _events.AsReadOnly();

    public void Apply(DataAccessedEvent e)
    {
        _events.Add(new AuditEvent(e.EntityId, e.UserId, e.AccessedAt, nameof(DataAccessedEvent)));
    }

    // Reconstruct state at any point in time
    public static AuditLog ReplayTo(IEnumerable<AuditEvent> events, DateTime targetDate)
    {
        var log = new AuditLog();
        foreach (var e in events.Where(e => e.Timestamp <= targetDate))
            log.Apply(e);
        return log;
    }
}

// Projections can be added without changing events
public class AccessByUserProjection : IProjection<DataAccessedEvent>
{
    public async Task ProjectAsync(DataAccessedEvent e)
    {
        // New view of existing events - no data migration needed
    }
}
```

**Benefits:**

- Reconstruct audit state at any point in time
- Add new projections without changing events
- Prove compliance for past dates
- Immutable, append-only event stream

---

## CQRS with Supabase Auto-APIs

Separate read and write concerns using Supabase PostgREST for automatic read APIs.

```text
┌─────────────────────────────────────────────────────────────┐
│  WRITE SIDE (.NET API)              READ SIDE (Supabase)    │
├─────────────────────────────────────────────────────────────┤
│  Commands → .NET Controllers        Views → Auto REST API   │
│  ├── CreateOrder                    ├── /v_order_list       │
│  ├── SubmitOrder                    ├── /v_customer_orders  │
│  ├── UpdateOrder                    ├── /v_dashboard_stats  │
│  └── CancelOrder                    └── /v_audit_log        │
│                                                             │
│  Domain logic, validation,          Zero code, instant:     │
│  event sourcing, business rules     ├── Filtering           │
│                                     ├── Pagination          │
│                                     ├── Sorting             │
│                                     └── RLS enforced        │
└─────────────────────────────────────────────────────────────┘
```

### Write Side (.NET)

```csharp
// Commands go through .NET API with full domain logic
[HttpPost]
public async Task<IActionResult> Create(CreateOrderCommand command)
{
    var result = await _mediator.Send(command);
    return result.IsSuccess ? Ok() : BadRequest(result.Error);
}
```

### Read Side (Supabase Views)

```sql
-- Optimized read view - becomes instant API endpoint
CREATE VIEW v_order_list AS
SELECT
    o.id,
    o.order_number,
    o.total,
    o.status,
    o.created_at,
    c.customer_name,
    c.email
FROM orders o
JOIN customers c ON o.customer_id = c.id;
```

```typescript
// Blazor/JS reads directly from Supabase - no .NET hop
const { data } = await supabase
  .from('v_order_list')
  .select('*')
  .eq('status', 'submitted')
  .order('created_at', { ascending: false })
  .limit(20);
```

### CQRS Benefits

| Benefit | Impact |
|---------|--------|
| No read controllers | Less .NET code to maintain |
| Instant filtering/pagination | PostgREST query syntax |
| RLS on reads | Security at database level |
| Real-time subscriptions | Live UI updates |
| OpenAPI generated | Client SDKs for free |

### Infrastructure Split

| Component | Technology | Purpose |
|-----------|------------|---------|
| Write API | .NET 10 | Commands, domain logic, validation |
| Read API | Supabase PostgREST | Auto-generated from views |
| Database | Supabase PostgreSQL | Tables, views, RLS |
| File Storage | Azure Blob | Large files, CDN |
| Real-time | Supabase Realtime | Status updates, live feeds |
| Auth | Supabase Auth | JWT, RLS integration |

---

## Domain Validation Ownership

Validation logic lives in the domain, not in application/presentation layers. This ensures consistent validation across API, Blazor UI, and domain operations.

```csharp
public sealed class Order : Entity
{
    // Validation as property - reusable across layers
    public static ValidationResult ValidateQuantity(int quantity)
    {
        if (quantity <= 0)
            return ValidationResult.Failure("Quantity must be positive");
        if (quantity > 1000)
            return ValidationResult.Failure("Maximum quantity is 1000");
        return ValidationResult.Success();
    }

    // Factory method uses domain validation
    public static Result<Order, Error> Create(string customerId, string currency)
    {
        var customerValidation = ValidateCustomerId(customerId);
        if (!customerValidation.IsValid)
            return OrderErrors.InvalidCustomer(customerValidation.Message);

        var currencyValidation = ValidateCurrency(currency);
        if (!currencyValidation.IsValid)
            return OrderErrors.InvalidCurrency(currencyValidation.Message);

        return new Order { ... };
    }

    // Property updates also validate
    public Result<Unit, Error> UpdateQuantity(OrderLineId lineId, int newQuantity)
    {
        var validation = ValidateQuantity(newQuantity);
        if (!validation.IsValid)
            return OrderErrors.InvalidQuantity(validation.Message);

        var line = _lines.First(l => l.Id == lineId);
        line.UpdateQuantity(newQuantity);
        return Unit.Value;
    }
}
```

**Reuse in Blazor/API:**

```csharp
// In Blazor component or API controller
var validation = Order.ValidateQuantity(userInput);
if (!validation.IsValid)
    ShowError(validation.Message);  // Same rules, same messages
```

---

## Async Patterns

### Async-First for I/O

```csharp
// ✅ Repository methods - always async
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Order order, CancellationToken cancellationToken = default);
}

// ✅ Application handlers - always async
public sealed class CreateOrderCommandHandler
    : IRequestHandler<CreateOrderCommand, Result<Guid, Error>>
{
    public async Task<Result<Guid, Error>> Handle(
        CreateOrderCommand command,
        CancellationToken cancellationToken)
    {
        // Domain logic (synchronous) - pure validation
        var orderResult = Order.Create(command.CustomerId, command.Currency);
        if (orderResult.IsFailure)
            return orderResult.Error;

        // Save - async I/O
        await _repository.AddAsync(orderResult.Value, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return orderResult.Value.Id;
    }
}

// ❌ Domain model factory methods - synchronous (pure logic, no I/O)
public static Result<Order, Error> Create(...) { }  // No async here
```

### CancellationToken Required

```csharp
// ✅ Good
Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

// ❌ Bad
Task<Order?> GetByIdAsync(Guid id);  // Missing CancellationToken
```

---

## EF Core Value Object Mapping

```csharp
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders", "sales");
        builder.HasKey(o => o.Id);

        // Value object - owned type
        builder.OwnsOne(o => o.Total, m =>
        {
            m.Property(x => x.Amount).HasColumnName("TotalAmount");
            m.Property(x => x.Currency).HasColumnName("Currency");
        });

        // Value object - conversion
        builder.Property(o => o.CustomerId)
            .HasConversion(
                id => id.Value,
                value => CustomerId.Create(value).Value)
            .HasColumnName("CustomerId")
            .HasMaxLength(100);

        builder.HasMany(o => o.Lines)
            .WithOne()
            .HasForeignKey("OrderId");
    }
}
```

---

## Repositories

**Repositories provide a collection-like interface for accessing aggregates.**

### Repository Interface

Define repository interfaces in the Domain layer. Implementations live in Infrastructure.

```csharp
// Domain/Repositories/IOrderRepository.cs
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Order>> GetByCustomerIdAsync(CustomerId customerId, CancellationToken cancellationToken = default);
    Task AddAsync(Order order, CancellationToken cancellationToken = default);
    Task UpdateAsync(Order order, CancellationToken cancellationToken = default);
    Task DeleteAsync(Order order, CancellationToken cancellationToken = default);
}
```

### Repository Rules

| Rule | Reason |
|------|--------|
| One repository per aggregate | Aggregates are the unit of persistence |
| Return aggregate roots only | Never expose internal entities |
| No business logic | Repositories are for data access only |
| Use specifications for queries | Keep complex queries reusable |

### EF Core Implementation

```csharp
// Infrastructure/Repositories/OrderRepository.cs
public sealed class OrderRepository : IOrderRepository
{
    private readonly ApplicationDbContext _context;

    public OrderRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(o => o.Lines)  // Load the entire aggregate
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task AddAsync(Order order, CancellationToken cancellationToken = default)
    {
        await _context.Orders.AddAsync(order, cancellationToken);
    }

    public Task UpdateAsync(Order order, CancellationToken cancellationToken = default)
    {
        _context.Orders.Update(order);
        return Task.CompletedTask;
    }
}
```

### Unit of Work

Coordinate multiple repository operations in a single transaction:

```csharp
// Domain/IUnitOfWork.cs
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

// Application/Commands/CreateOrderCommandHandler.cs
public sealed class CreateOrderCommandHandler
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public async Task<Result<Guid, Error>> Handle(CreateOrderCommand command, CancellationToken ct)
    {
        var orderResult = Order.Create(command.CustomerId, command.Currency);
        if (orderResult.IsFailure)
            return orderResult.Error;

        await _orderRepository.AddAsync(orderResult.Value, ct);
        await _unitOfWork.SaveChangesAsync(ct);  // Single transaction

        return orderResult.Value.Id;
    }
}
```

---

## Domain Services

**Domain Services contain business logic that doesn't naturally belong to a single entity or value object.**

### When to Use Domain Services

| Use Case | Example |
|----------|---------|
| Cross-aggregate operations | Transfer items between orders |
| External service integration | Payment processing, notifications |
| Complex calculations | Pricing rules across multiple entities |
| Policy enforcement | Discount eligibility across customer history |

### Domain Service Example

```csharp
// Domain/Services/IOrderPricingService.cs
public interface IOrderPricingService
{
    Task<Money> CalculateTotalWithDiscountsAsync(
        Order order,
        CustomerId customerId,
        CancellationToken cancellationToken = default);
}

// Domain/Services/OrderPricingService.cs
public sealed class OrderPricingService : IOrderPricingService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly IDiscountPolicy _discountPolicy;

    public OrderPricingService(
        ICustomerRepository customerRepository,
        IDiscountPolicy discountPolicy)
    {
        _customerRepository = customerRepository;
        _discountPolicy = discountPolicy;
    }

    public async Task<Money> CalculateTotalWithDiscountsAsync(
        Order order,
        CustomerId customerId,
        CancellationToken cancellationToken = default)
    {
        var customer = await _customerRepository.GetByIdAsync(customerId, cancellationToken);
        if (customer is null)
            return order.Total;

        // Business logic spanning multiple aggregates
        var discount = _discountPolicy.Calculate(customer.Tier, order.Total);
        return order.Total.Subtract(discount);
    }
}
```

### Domain Service vs Application Service

| Aspect | Domain Service | Application Service |
|--------|----------------|---------------------|
| Location | Domain layer | Application layer |
| Contains | Business logic | Orchestration/workflow |
| Dependencies | Other domain objects | Repositories, domain services |
| Example | Calculate discount | Create order command handler |

```csharp
// ❌ Don't put business logic in application services
public class CreateOrderHandler
{
    public async Task Handle(CreateOrderCommand cmd)
    {
        // ❌ Business logic in handler
        var discount = customer.Tier == "Gold" ? 0.1m : 0m;
    }
}

// ✅ Put business logic in domain services
public class CreateOrderHandler
{
    private readonly IOrderPricingService _pricingService;

    public async Task Handle(CreateOrderCommand cmd)
    {
        // ✅ Delegate to domain service
        var total = await _pricingService.CalculateTotalWithDiscountsAsync(order, customerId);
    }
}
```

---

## Required NuGet Package

```xml
<PackageReference Include="CSharpFunctionalExtensions" Version="2.42.0" />
```

---

## Anti-Patterns to Avoid

| ❌ Don't | ✅ Do Instead |
|---------|--------------|
| Anemic domain models | Rich models with behavior |
| Exceptions for business logic | Result<T, Error> |
| Primitive obsession | Value objects |
| Missing validation | Factory methods |
| Sync over async | async/await all I/O |
| Missing CancellationToken | Always include it |
