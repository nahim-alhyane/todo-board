-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Person table (new)
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  language_code TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Todos table (updated with assigned_to field)
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT, -- markdown text
  assigned_to TEXT CHECK (assigned_to IN ('nahim', 'vanessa')),
  status TEXT NOT NULL DEFAULT 'BACKLOG' CHECK (status IN ('BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE')),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stakeholder table (new - links persons to todos)
CREATE TABLE stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  notify_by_email BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(todo_id, person_id) -- prevent duplicate stakeholders for the same todo
);

-- Tasks table (renamed from subtasks, with enhanced fields)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT, -- markdown text
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attachment table (new - for file uploads)
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage_path TEXT NOT NULL, -- path in Supabase Storage
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Voice drafts table (raw transcripts captured by mic; processed asynchronously into todos by a separate tool)
CREATE TABLE voice_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transcript TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_voice_drafts_unprocessed
  ON voice_drafts(created_at DESC)
  WHERE processed = FALSE;

-- Indexes for better query performance
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_assigned_to ON todos(assigned_to);
CREATE INDEX idx_todos_project_id ON todos(project_id);
CREATE INDEX idx_todos_position ON todos(position);
CREATE INDEX idx_tasks_todo_id ON tasks(todo_id);
CREATE INDEX idx_tasks_position ON tasks(position);
CREATE INDEX idx_stakeholders_todo_id ON stakeholders(todo_id);
CREATE INDEX idx_stakeholders_person_id ON stakeholders(person_id);
CREATE INDEX idx_attachments_todo_id ON attachments(todo_id);
CREATE INDEX idx_persons_email ON persons(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_drafts ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - adjust based on auth requirements)
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations on todos" ON todos FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on persons" ON persons FOR ALL USING (true);
CREATE POLICY "Allow all operations on stakeholders" ON stakeholders FOR ALL USING (true);
CREATE POLICY "Allow all operations on attachments" ON attachments FOR ALL USING (true);
CREATE POLICY "Allow all operations on voice_drafts" ON voice_drafts FOR ALL USING (true);

-- Insert sample project
INSERT INTO projects (name, description, color) VALUES
  ('Personal', 'Personal tasks and goals', '#10b981'),
  ('Work', 'Work-related tasks', '#3b82f6'),
  ('Home', 'Home improvement and chores', '#f59e0b');

-- Insert sample persons
INSERT INTO persons (firstname, lastname, email, language_code) VALUES
  ('Nahim', 'Alhyane', 'nahim@example.com', 'en'),
  ('Vanessa', 'Smith', 'vanessa@example.com', 'en');

-- Insert sample todo
INSERT INTO todos (project_id, title, description, status, assigned_to, position)
SELECT
  p.id,
  'Welcome to Todo Board',
  'This is your first todo item. Edit or delete it to get started!',
  'TODO',
  'nahim',
  0
FROM projects p WHERE p.name = 'Personal' LIMIT 1;
