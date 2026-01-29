# Changelog

## v2.0 - Enhanced Todo Board with Slide-over Form (2026-01-29)

### New Features

#### Enhanced Entity Model
- **Person Table**: Store user information with firstname, lastname, email, and language preference
- **Stakeholder System**: Link people to todos with email notification preferences
- **Enhanced Tasks**: Renamed from subtasks with additional fields (name, title, description)
- **Attachments**: Upload and manage files for each todo using Supabase Storage

#### UI Improvements
- **Slide-over Panel**: Beautiful slide-in form from the right side for creating and editing todos
- **Add Todo Button**: Prominent button in the action bar to create new todos
- **Click to Edit**: Click on any todo card to open the edit form
- **Markdown Editor**: Rich markdown editing for todo and task descriptions
- **File Upload**: Drag and drop or click to upload attachments

#### Form Features
- Title and description fields with markdown support
- Assigned to dropdown (Nahim/Vanessa)
- Stakeholders management with email notification toggle
- Tasks section with name, title, description, and completion status
- File attachments with upload and delete capabilities
- Created/updated timestamps display

### Technical Changes

#### Database Schema Updates
- Renamed `assignee` to `assigned_to` in todos table
- Renamed `subtasks` table to `tasks` with enhanced fields
- Added `persons` table for user information
- Added `stakeholders` table for todo-person relationships
- Added `attachments` table for file metadata
- Created Supabase Storage bucket `todo-attachments`

#### Component Architecture
- New `TodoFormSheet` component for comprehensive todo editing
- Updated `KanbanBoard` to integrate form and handle todo clicks
- Updated `TodoCard` to use new field names (`assigned_to`, `tasks`)
- Added shadcn/ui components: Sheet, Label, Input, Select, Switch, Textarea

#### Dependencies Added
- `@uiw/react-md-editor` - Markdown editor
- `@radix-ui/react-dialog` - Sheet/dialog primitive
- `@radix-ui/react-label` - Label primitive
- `@radix-ui/react-select` - Select primitive
- `@radix-ui/react-switch` - Switch primitive

### Migration Guide

#### Database Migration
1. Run the updated `supabase-schema.sql` in your Supabase SQL Editor
2. Follow instructions in `SUPABASE_SETUP.md` to create the Storage bucket
3. If migrating from the old schema:
   ```sql
   ALTER TABLE todos RENAME COLUMN assignee TO assigned_to;
   ```

#### Breaking Changes
- `assignee` field renamed to `assigned_to`
- `subtasks` renamed to `tasks` with new schema
- TypeScript types updated: `Assignee` → `AssignedTo`, `Subtask` → `Task`

### Files Changed
- `supabase-schema.sql` - Complete schema rewrite
- `components/kanban/types.ts` - Updated type definitions
- `components/kanban/kanban-board.tsx` - Added form integration
- `components/kanban/kanban-column.tsx` - Added todo click handler
- `components/kanban/todo-card.tsx` - Updated field names
- `components/todo/todo-form-sheet.tsx` - New comprehensive form
- Multiple UI components added in `components/ui/`

### New Files
- `SUPABASE_SETUP.md` - Setup instructions
- `CHANGELOG.md` - This file
- `components/todo/todo-form-sheet.tsx`
- `components/ui/sheet.tsx`
- `components/ui/label.tsx`
- `components/ui/input.tsx`
- `components/ui/select.tsx`
- `components/ui/switch.tsx`
- `components/ui/textarea.tsx`
