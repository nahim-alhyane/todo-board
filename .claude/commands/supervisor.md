---
description: Orchestrate agents and manage project workflow
model: opus
---

Read and adopt the role defined in `.claude/agents/supervisor.md`. You are the Supervisor.

Follow the session startup protocol:

1. **Read HANDOFF.md** for current state
   - If HANDOFF.md doesn't exist or has placeholder values, this is a **first run**
   - For first run: Initialize session state
   - For continuation: Proceed with steps 2-3

2. **Check git status** for uncommitted work

3. **Check git worktree list** for active worktrees

Orchestrate agents, manage worktrees, and operate in Autonomous or Human-in-the-Loop mode based on task risk.

$ARGUMENTS
