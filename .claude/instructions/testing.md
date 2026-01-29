# Testing Standards

## Framework

- **xUnit** - Test framework (NCrunch compatible)
- **NSubstitute** - Mocking
- **FluentAssertions** - Assertions
- **Testcontainers** - Integration tests

## Test Project Structure

```
tests/{PROJECTNAME_PASCAL}.Tests/
├── Unit/
│   ├── Domain/
│   │   ├── Entities/
│   │   └── ValueObjects/
│   └── Application/
│       └── Services/
├── Integration/
│   ├── Storage/
│   └── Repositories/
├── Fixtures/
│   └── TestData/
└── Utilities/
```

## Naming Convention

```csharp
// Pattern: MethodName_Scenario_ExpectedBehavior
[Fact]
public void GetUser_ValidId_ReturnsUser()

[Fact]
public void GetUser_InvalidId_ThrowsArgumentException()

[Fact]
public async Task CreateUserAsync_ValidData_PersistsAndReturnsUser()
```

## Test Attributes

```csharp
// Single test case
[Fact]
public void Should_ReturnTrue_When_ConditionMet()

// Parameterized tests
[Theory]
[InlineData(0, 0, 0, true)]
[InlineData(-1, 0, 0, false)]
public void Validate_Coordinates_ReturnsExpected(int level, int x, int y, bool valid)
```

## Arrange-Act-Assert Pattern

```csharp
[Fact]
public void Money_Equality_SameValuesAreEqual()
{
    // Arrange
    var money1 = new Money(Amount: 99.99m, Currency: "USD");
    var money2 = new Money(Amount: 99.99m, Currency: "USD");

    // Act
    var result = money1.Equals(money2);

    // Assert
    result.Should().BeTrue();
    money1.GetHashCode().Should().Be(money2.GetHashCode());
}
```

## Mocking with NSubstitute

```csharp
[Fact]
public async Task CreateUser_CallsRepositoryToSave()
{
    // Arrange
    var repository = Substitute.For<IUserRepository>();
    var service = new UserService(repository);

    // Act
    await service.CreateUserAsync(userData);

    // Assert
    await repository.Received(1)
        .AddAsync(Arg.Any<User>());
}
```

## Required Packages

```xml
<PackageReference Include="xunit" Version="2.6.6" />
<PackageReference Include="xunit.runner.visualstudio" Version="2.5.6" />
<PackageReference Include="NSubstitute" Version="5.1.0" />
<PackageReference Include="FluentAssertions" Version="6.12.0" />
<PackageReference Include="Testcontainers.PostgreSql" Version="3.7.0" />
<PackageReference Include="coverlet.collector" Version="6.0.0" />
```

## Coverage Targets

| Layer | Target |
|-------|--------|
| Domain | 90%+ |
| Application | 80%+ |
| Infrastructure | 70%+ |
| API | 60%+ |

## Test Rules

1. **Tests must be independent** - No shared mutable state
2. **Tests must be deterministic** - Same result every run
3. **Fast unit tests** - < 100ms each
4. **No test interdependencies** - Run in any order
5. **Test behavior, not implementation** - Focus on outcomes
