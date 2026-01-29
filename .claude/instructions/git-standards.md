# Git Standards

**Purpose**: Complete git workflow standards for all agents.

---

## Branch Naming

```text
feature/{issue-id}-{short-description}
fix/{issue-id}-{short-description}
infra/{description}
docs/{description}
spike/{description}
```

Examples:

- `feature/123-explorer-ui`
- `feature/124-layer-merging`
- `fix/125-setup-script-bug`
- `infra/ci-pipeline`
- `docs/api-reference`

---

## Commit Message Format

```text
<action> <brief description> #<issue-id>

<detailed description>
- Bullet point 1
- Bullet point 2

Agent: <AgentName>
Session: <YYYY-MM-DD>
```

### Format Rules

1. **Subject Line** (first line):
   - Start with action verb: `Add`, `Update`, `Fix`, `Refactor`, `Remove`, `Test`
   - Keep under 72 characters
   - Reference issue: `#123`
   - NO emojis, NO special characters

2. **Body** (detailed description):
   - Blank line after subject
   - Explain WHAT changed and WHY
   - Use bullet points for multiple changes

3. **Footer** (agent attribution):
   - Blank line before footer
   - `Agent: <AgentName>` - REQUIRED
   - `Session: <YYYY-MM-DD>` - REQUIRED
   - NO "Generated with Claude Code"
   - NO "Co-Authored-By: Claude"

### Action Verbs

| Verb | Use For |
|------|---------|
| `Add` | New feature, file, or capability |
| `Update` | Modify existing code/feature |
| `Fix` | Bug fix |
| `Refactor` | Code restructuring |
| `Test` | Adding tests |
| `Remove` | Delete feature or file |
| `Configure` | Setup infrastructure, tools, CI/CD |

---

## Agent Email Addresses

**MANDATORY**: Every agent MUST use their designated Git author field when committing.

```bash
git -c user.name="<Agent Name>" \
    -c user.email="<agent-email>@agentic-workflow.agent" \
    commit -m "..."
```

| Agent | user.name | user.email |
|-------|-----------|------------|
| Supervisor | `Supervisor` | `supervisor@agentic-workflow.agent` |
| Product Engineer | `Product Engineer` | `product-engineer@agentic-workflow.agent` |
| QA Engineer | `QA Engineer` | `qa-engineer@agentic-workflow.agent` |
| Platform Engineer | `Platform Engineer` | `platform-engineer@agentic-workflow.agent` |
| Agentic Patterns Expert | `Agentic Patterns Expert` | `agentic-patterns@agentic-workflow.agent` |
| Documentation Engineer | `Documentation Engineer` | `documentation-engineer@agentic-workflow.agent` |

### Verification

```bash
git log --oneline --format="%h %an: %s" -5
git log --author="@agentic-workflow.agent"  # All agent commits
```

---

## Commit Examples

### Product Engineer

```text
Add explorer UI component #123

Implemented explorer with:
- Category tabs for agents, commands, instructions
- Card grid with search/filter
- Detail viewer with markdown rendering

Agent: Product Engineer
Session: 2025-01-21
```

### QA Engineer

```text
Add tests for setup.js #124

Implemented test cases covering:
- Fresh install scenarios
- Layer merging logic
- Placeholder replacement

Agent: QA Engineer
Session: 2025-01-21
```

---

## What NOT to Include

```text
# BAD - promotional footer
Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>

# BAD - vague description
Update files #123
Changed some stuff

# BAD - missing issue reference
Add user authentication

# BAD - missing agent footer
Add user authentication #123
Implemented authentication.
```

---

## Protected Actions

**Never do without approval:**

- Push directly to main/master
- Force push to any branch
- Rewrite public history
- Delete remote branches without cleanup

---

**Status**: Active
**Applies To**: All agents
