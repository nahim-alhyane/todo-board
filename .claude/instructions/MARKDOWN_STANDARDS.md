# Markdown Standards

**Purpose**: Common markdown linting rules for all agents (supervisor and subagents)

**Applies to**: All markdown files (.md) in the repository

---

## Critical Rules (Always Follow)

### 1. Blank Lines Around Lists

**Rule**: Lists MUST be surrounded by blank lines (before and after)

**Linter**: MD032/blanks-around-lists

---

### 2. Blank Lines Around Code Blocks

**Rule**: Fenced code blocks MUST be surrounded by blank lines (before and after)

**Linter**: MD031/blanks-around-fences

---

### 3. Code Block Language

**Rule**: Fenced code blocks MUST have a language specified

**Common languages**:

- `bash` - Shell commands
- `json` - JSON data
- `yaml` - YAML config
- `text` - Plain text (when no other language fits)
- `markdown` - Markdown examples
- `typescript` - TypeScript/MCP examples
- `javascript` - JavaScript code

**Linter**: MD040/fenced-code-language

---

### 4. Single Trailing Newline

**Rule**: Files MUST end with exactly one newline character

**Linter**: MD047/single-trailing-newline

---

### 5. Consistent List Markers

**Rule**: Use consistent list markers (dash `-` preferred)

**Linter**: MD004/ul-style

---

### 6. No Trailing Spaces

**Rule**: Lines MUST NOT end with trailing spaces

**Exception**: Two trailing spaces can be used for markdown line breaks, but prefer explicit `<br>` tags for clarity.

**Linter**: MD009/no-trailing-spaces

---

## Quick Checklist

When creating or editing markdown files:

- [ ] Blank line before every list
- [ ] Blank line after every list
- [ ] Blank line before every code block
- [ ] Blank line after every code block
- [ ] Language specified for every code block
- [ ] File ends with single newline
- [ ] No trailing spaces on lines
- [ ] Consistent list markers (use `-`)
- [ ] Headings increment by one level only
- [ ] Links have descriptive text

---

## Agent Responsibility

**ALL agents** (supervisor and subagents) MUST:

- Follow these standards when creating markdown files
- Fix linting issues when editing existing markdown files
- Run markdownlint mentally before completing markdown work

**No exceptions** - markdown quality is non-negotiable.

---

**Status**: Active
**Applies To**: All agents
