# MCP Tools Available

## Sequential Thinking MCP

**Use for:** Complex planning, architectural decisions, multi-step reasoning.

```typescript
mcp__sequential-thinking__sequentialthinking({
  thought: "Current reasoning step",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
})
```

**When to use:**

- Breaking down complex problems
- Planning implementation steps
- Analyzing trade-offs between approaches
- Multi-step decision making
- Generating and verifying hypotheses

---

## Context7 MCP

**Use for:** Looking up current library documentation.

### Step 1: Resolve Library ID

```typescript
mcp__context7__resolve-library-id({
  libraryName: "marked"
})
```

### Step 2: Get Documentation

```typescript
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/org/project",
  topic: "specific topic"
})
```

**When to use:**

- Looking up API documentation for libraries
- Finding code examples for specific features
- Checking latest library capabilities
- Researching implementation patterns

**Libraries commonly used in this project:**

- marked (markdown parsing)
- commander (CLI arguments)
- glob (file pattern matching)
- fs-extra (file system utilities)

---

## Playwright MCP

**Use for:** Browser automation, E2E testing, UI verification.

```typescript
mcp__playwright__browser_navigate({ url: "..." })
mcp__playwright__browser_snapshot()
mcp__playwright__browser_click({ element: "...", ref: "..." })
```

**When to use:**

- Testing generated HTML output
- Verifying UI interactions
- Browser-based testing

---

## Usage Notes

### When to Use Which MCP

| Task | MCP Tool |
|------|----------|
| Planning complex features | Sequential Thinking |
| Looking up library docs | Context7 |
| Testing web output | Playwright |

### Best Practices

1. **Sequential Thinking**: Use for any task requiring multi-step reasoning
2. **Context7**: Always check docs before implementing unfamiliar APIs
3. **Playwright**: Test generated HTML in browser to verify rendering
