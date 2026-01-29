# Todo Board v2.0

A modern Kanban-style task dashboard for Nahim & Vanessa, built with Next.js and Supabase.

## Features

- **Kanban Board**: Standard 5-lane workflow (Backlog, To Do, In Progress, Blocked, Done)
- **Drag & Drop**: Move tasks between lanes with smooth animations
- **Slide-over Form**: Beautiful slide-in panel for creating and editing todos
- **Rich Task Management**:
  - Markdown descriptions for todos and tasks
  - Task checklists with name, title, and description
  - File attachments with Supabase Storage
  - Stakeholder management with email notifications
- **Assignees**: Assign tasks to Nahim or Vanessa
- **Projects**: Organize tasks into projects/groups with custom colors
- **Realtime Updates**: See changes instantly with Supabase Realtime
- **Filtering**: Filter tasks by assignee
- **Click to Edit**: Click any todo card to edit in slide-over panel

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (Postgres + Realtime + Storage)
- **Styling**: Tailwind CSS + shadcn/ui
- **Drag & Drop**: @hello-pangea/dnd
- **Markdown Editor**: @uiw/react-md-editor
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd todo-board
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - Follow instructions in `SUPABASE_SETUP.md` to create the Storage bucket
   - Copy your project URL and anon key

4. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses six main tables:

- **projects**: Organize todos into groups with custom colors
- **todos**: Task items with status, assigned_to, and position
- **tasks**: Enhanced checklist items with name, title, description
- **persons**: User information (firstname, lastname, email, language)
- **stakeholders**: Links persons to todos with notification preferences
- **attachments**: File metadata for uploaded attachments

See `supabase-schema.sql` for the complete schema definition and `CHANGELOG.md` for migration details.

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment

The easiest way to deploy is with [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables
4. Deploy!

## License

MIT