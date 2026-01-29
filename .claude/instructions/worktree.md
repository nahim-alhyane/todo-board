# Worktree Instructions

## Directory Structure

```text
~/dev/
├── careconnect-agentic-workflow/              # Main worktree (coordination only)
├── careconnect-agentic-workflow-feature/      # Feature worktree
├── careconnect-agentic-workflow-fix-42/       # Bug fix worktree
└── careconnect-agentic-workflow-docs/         # Documentation worktree
```

## Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `careconnect-agentic-workflow-{desc}` | `careconnect-agentic-workflow-explorer` |
| Bug fix | `careconnect-agentic-workflow-fix-{id}` | `careconnect-agentic-workflow-fix-42` |
| Docs | `careconnect-agentic-workflow-docs-{desc}` | `careconnect-agentic-workflow-docs-api` |
| Spike | `careconnect-agentic-workflow-spike-{desc}` | `careconnect-agentic-workflow-spike-research` |

## Commands

### Create Worktree

```bash
cd /Users/koen/dev/careconnect-agentic-workflow
git fetch origin
git worktree add ../careconnect-agentic-workflow-{id} -b feature/{branch-name} origin/main
cd ../careconnect-agentic-workflow-{id}
```

### Verify Worktree

```bash
pwd           # Should be /Users/koen/dev/careconnect-agentic-workflow-{id}
git branch    # Should show feature/{branch-name}
```

### List Worktrees

```bash
git worktree list
```

### Remove Worktree (After Merge)

```bash
cd /Users/koen/dev/careconnect-agentic-workflow
git worktree remove ../careconnect-agentic-workflow-{id}
git branch -d feature/{branch-name}
```

## Rules

1. **Main worktree stays on `main`** - Used for coordination, not feature work
2. **One branch per worktree** - Never checkout different branch in worktree
3. **Clean up after merge** - Remove worktree when PR merged
4. **Push frequently** - Keep remote updated for visibility
5. **End session after cleanup** - See warning below

## Supervisor Worktree Discipline

**The supervisor NEVER enters a worktree.** This prevents session corruption.

| Role | Creates Worktree | Enters Worktree | Cleans Up |
|------|------------------|-----------------|-----------|
| Supervisor | Yes (from main) | **NEVER** | No |
| Subagent | No | Yes (works there) | Yes |

**Correct flow:**

```text
Supervisor (main repo)
    │
    ├── git worktree add ../project-feature
    │
    └── Task(subagent, cwd=worktree)
            │
            ├── Implement feature
            ├── Create PR
            ├── git worktree remove (from main)
            └── Agent terminates
```

**Why**: Subagent contexts are disposable. If worktree is deleted, only that subagent breaks - supervisor continues in valid main repo.

## Recovery (If Session Already Broken)

If Bash commands fail with exit code 1 (no output):

- Read/Write/Glob/Grep still work with absolute paths
- Must restart session to restore Bash functionality
- Start new session from `/Users/koen/dev/careconnect-agentic-workflow`
