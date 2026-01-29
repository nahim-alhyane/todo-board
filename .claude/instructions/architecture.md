# Clean Architecture

## Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                          API                                 │
│                  (Controllers, Middleware)                   │
├─────────────────────────────────────────────────────────────┤
│                     Infrastructure                           │
│            (EF Core, Storage, External APIs)                 │
├─────────────────────────────────────────────────────────────┤
│                      Application                             │
│              (Use Cases, Interfaces, DTOs)                   │
├─────────────────────────────────────────────────────────────┤
│                        Domain                                │
│            (Entities, Value Objects, Enums)                  │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Rule

**Dependencies flow inward only.**

| Layer | Can Reference | Cannot Reference |
|-------|---------------|------------------|
| Domain | Nothing | Application, Infrastructure, API |
| Application | Domain | Infrastructure, API |
| Infrastructure | Domain, Application | API |
| API | Domain, Application, Infrastructure | - |

## Project Structure

```
src/
├── {PROJECTNAME_PASCAL}.Domain/
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Enums/
│   └── Exceptions/
│
├── {PROJECTNAME_PASCAL}.Application/
│   ├── Interfaces/           # Contracts for Infrastructure
│   ├── Services/             # Use cases / business logic
│   ├── DTOs/                 # Data transfer objects
│   └── Validators/           # Input validation
│
├── {PROJECTNAME_PASCAL}.Infrastructure/
│   ├── Persistence/          # EF Core, DbContext
│   ├── Storage/              # File/blob storage
│   ├── Services/             # External service implementations
│   └── External/             # External API clients
│
└── {PROJECTNAME_PASCAL}.Api/
    ├── Controllers/
    ├── Middleware/
    └── Program.cs
```

## Layer Guidelines

### Domain Layer
- Zero external dependencies (no NuGet packages except primitives)
- Contains business logic and rules
- Entities have identity (Id)
- Value Objects are immutable, compared by value
- Rich domain model over anemic

### Application Layer
- Defines interfaces that Infrastructure implements
- Contains use cases (application services)
- Orchestrates domain objects
- No knowledge of HTTP, databases, or external systems

### Infrastructure Layer
- Implements interfaces from Application
- Contains all external concerns
- Database access (EF Core)
- File system, blob storage
- Third-party integrations

### API Layer
- Entry point for HTTP requests
- Controllers are thin (delegate to Application)
- Request/response mapping
- Authentication/authorization
- Global error handling

## Interface Segregation

Define interfaces in Application, implement in Infrastructure:

```csharp
// Application/Interfaces/IEmailService.cs
public interface IEmailService
{
    Task SendAsync(EmailAddress to, string subject, string body);
    Task<bool> ValidateAsync(EmailAddress email);
}

// Infrastructure/Services/SmtpEmailService.cs
public class SmtpEmailService : IEmailService
{
    // Implementation
}
```
