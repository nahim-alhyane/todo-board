export type TodoStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
export type Assignee = "nahim" | "vanessa" | null;

export interface Subtask {
  id: string;
  todo_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: TodoStatus;
  assignee: Assignee;
  position: number;
  created_at: string;
  updated_at: string;
  subtasks?: Subtask[];
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
