"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";
import { Todo, TodoStatus, KanbanColumn as KanbanColumnType, Assignee } from "./types";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Users } from "lucide-react";

const COLUMNS: { id: TodoStatus; title: string }[] = [
  { id: "BACKLOG", title: "Backlog" },
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "BLOCKED", title: "Blocked" },
  { id: "DONE", title: "Done" },
];

export function KanbanBoard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigneeFilter, setAssigneeFilter] = useState<Assignee | "all">("all");

  useEffect(() => {
    fetchTodos();

    const channel = supabase
      .channel("todos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        () => {
          fetchTodos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTodos = async () => {
    try {
      const { data: todosData, error: todosError } = await supabase
        .from("todos")
        .select("*")
        .order("position");

      if (todosError) throw todosError;

      const { data: subtasksData, error: subtasksError } = await supabase
        .from("subtasks")
        .select("*")
        .order("position");

      if (subtasksError) throw subtasksError;

      const todosWithSubtasks: Todo[] = (todosData || []).map((todo: any) => ({
        ...todo,
        subtasks: (subtasksData || []).filter((st: any) => st.todo_id === todo.id),
      }));

      setTodos(todosWithSubtasks);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TodoStatus;

    setTodos((prevTodos) => {
      const newTodos = [...prevTodos];
      const todoIndex = newTodos.findIndex((t) => t.id === draggableId);

      if (todoIndex === -1) return prevTodos;

      const todo = newTodos[todoIndex];
      todo.status = newStatus;

      return newTodos;
    });

    try {
      const { error } = await supabase
        .from("todos")
        .update({ status: newStatus } as any)
        .eq("id", draggableId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating todo:", error);
      fetchTodos();
    }
  };

  const getColumns = (): KanbanColumnType[] => {
    const filteredTodos = assigneeFilter === "all"
      ? todos
      : todos.filter((todo) => todo.assignee === assigneeFilter);

    return COLUMNS.map((col) => ({
      ...col,
      todos: filteredTodos.filter((todo) => todo.status === col.id),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const columns = getColumns();

  return (
    <div className="space-y-6">
      {/* Filter section */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
        <span className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">
          Filter:
        </span>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={assigneeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setAssigneeFilter("all")}
            className="rounded-xl font-medium transition-all duration-300 hover:scale-105"
          >
            <Users className="h-4 w-4 mr-2" />
            All Tasks
          </Button>
          <Button
            variant={assigneeFilter === "nahim" ? "default" : "outline"}
            size="sm"
            onClick={() => setAssigneeFilter("nahim")}
            className="rounded-xl font-medium transition-all duration-300 hover:scale-105"
          >
            <User className="h-4 w-4 mr-2" />
            Nahim
          </Button>
          <Button
            variant={assigneeFilter === "vanessa" ? "default" : "outline"}
            size="sm"
            onClick={() => setAssigneeFilter("vanessa")}
            className="rounded-xl font-medium transition-all duration-300 hover:scale-105"
          >
            <User className="h-4 w-4 mr-2" />
            Vanessa
          </Button>
        </div>
      </div>

      {/* Kanban columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 px-1">
          {columns.map((column, index) => (
            <div
              key={column.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <KanbanColumn column={column} />
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
