# Pull Request Workflow (GitHub)

**Purpose**: GitHub PR creation and review workflow using `gh` CLI.

---

## Creating a PR

### From Worktree

```bash
cd {REPODIRECTORYNAME}-{id}
git add -A
git commit -m "feat(scope): description"
git push -u origin feature/{branch-name}
gh pr create --base main --head feature/{branch-name}
```

### PR Title Format

```text
[{issue-id}] {type}: {description}
```

Examples:

- `[#123] feat: add user authentication`
- `[#124] fix: resolve validation error`
- `[#125] docs: update API reference`

### Types

| Type | Use |
|------|-----|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance |

---

## PR Description Template

```markdown
## Summary
[1-2 sentences describing what this PR does]

## Changes
- [Bullet list of key changes]

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] Integration tests (if applicable)

## Checklist
- [ ] Code follows project conventions
- [ ] No compiler warnings
- [ ] Self-reviewed the diff
- [ ] Documentation updated (if needed)

Closes #[issue-number]
```

---

## Quality Gates

All must pass before merge:

| Gate | Requirement |
|------|-------------|
| CI Status | All checks green |
| Review | At least 1 approval |
| Conflicts | None |
| Tests | Coverage maintained |
| Branch | Up to date with main |

---

## GitHub CLI Commands

### Create PR

```bash
gh pr create \
  --base main \
  --head feature/{branch} \
  --title "[#123] feat: description" \
  --body "## Summary\n\nDescription..."
```

### List PRs

```bash
gh pr list
gh pr list --state open --author @me
```

### View PR

```bash
gh pr view 123
gh pr view 123 --web  # Open in browser
```

### Merge PR

```bash
gh pr merge 123 --squash --delete-branch
```

### Check PR Status

```bash
gh pr checks 123
```

---

## After Merge

```bash
# Fetch latest
git fetch origin main
git pull origin main

# Clean up worktree
git worktree remove ../{REPODIRECTORYNAME}-{id}
git branch -d feature/{branch-name}
```

---

## Issue Linking

Use `Closes #N` in PR description to auto-close issues:

```markdown
Closes #123
```

For multiple issues:

```markdown
Closes #123, #124
```

---

**Status**: Active
**Platform**: GitHub
