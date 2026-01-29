export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      todos: {
        Row: {
          id: string
          project_id: string | null
          title: string
          description: string | null
          status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE"
          assignee: "nahim" | "vanessa" | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          title: string
          description?: string | null
          status?: "BACKLOG" | "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE"
          assignee?: "nahim" | "vanessa" | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          title?: string
          description?: string | null
          status?: "BACKLOG" | "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE"
          assignee?: "nahim" | "vanessa" | null
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      subtasks: {
        Row: {
          id: string
          todo_id: string
          title: string
          completed: boolean
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          todo_id: string
          title: string
          completed?: boolean
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          todo_id?: string
          title?: string
          completed?: boolean
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
