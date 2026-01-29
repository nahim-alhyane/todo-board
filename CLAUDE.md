# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Todo Board is a Kanban-style task dashboard for Nahim & Vanessa.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (Postgres + Realtime)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## Build and Run Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Architecture

This project uses the Next.js 14 App Router pattern:

```
app/
├── layout.tsx          # Root layout with providers
├── page.tsx            # Home page
├── api/                # API routes (Route Handlers)
└── [feature]/          # Feature-specific pages

components/
├── ui/                 # shadcn/ui components
└── [feature]/          # Feature-specific components

lib/
├── supabase/           # Supabase client configuration
└── utils/              # Utility functions
```

### Key Patterns

- **Server Components**: Default for pages; use `'use client'` only when needed for interactivity
- **Route Handlers**: API endpoints in `app/api/` using Next.js Route Handlers
- **Supabase Realtime**: Subscribe to database changes for live updates
- **shadcn/ui**: Copy-paste component library built on Radix UI primitives

## Required Tools and Agents

### UI Design
**Always use the `/frontend-design` skill** for any screen designs, UI components, pages, or visual work. This ensures distinctive, production-grade interfaces with high design quality.

### Complex Task Planning
**Always use the Sequential Thinking MCP server** (`mcp__sequential-thinking`) for complex tasks that require multi-step reasoning, architectural decisions, or breaking down problems into steps.

### Specialized Agents
Use the appropriate agent for each task type:

| Task | Agent |
|------|-------|
| Domain validation, DDD patterns | `domain-expert` |
| Documentation, CLAUDE.md updates | `documentation-engineer` |
| Code review before PRs | `code-critic` |
| Feature planning, design patterns | `agentic-expert` |
| MCP server issues | `mcp-troubleshooter` |
| Feature implementation | `product-engineer` |
| CI/CD, npm, GitHub Actions | `platform-engineer` |
| Writing tests, test coverage | `qa-engineer` |
| Issue creation, backlog management | `product-owner` |
| Orchestrating multiple agents | `supervisor` |
