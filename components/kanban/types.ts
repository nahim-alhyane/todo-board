export type TodoStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
export type AssignedTo = "nahim" | "vanessa" | null;

// Person entity
export interface Person {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  language_code: string;
  created_at: string;
}

// Stakeholder entity
export interface Stakeholder {
  id: string;
  todo_id: string;
  person_id: string;
  notify_by_email: boolean;
  created_at: string;
  person?: Person; // populated via join
}

// Task entity (renamed from Subtask)
export interface Task {
  id: string;
  todo_id: string;
  name: string;
  title: string;
  description: string | null;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

// Attachment entity
export interface Attachment {
  id: string;
  todo_id: string;
  filename: string;
  content_type: string;
  size: number;
  storage_path: string;
  created_at: string;
}

// Subtask entity (simple checklist items)
export interface Subtask {
  id: string;
  todo_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

// Todo entity (updated)
export interface Todo {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null; // markdown text
  assigned_to: AssignedTo;
  status: TodoStatus;
  position: number;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
  subtasks?: Subtask[];
  stakeholders?: Stakeholder[];
  attachments?: Attachment[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface KanbanColumn {
  id: TodoStatus;
  title: string;
  todos: Todo[];
}

// Backward compatibility
export type Assignee = AssignedTo;
