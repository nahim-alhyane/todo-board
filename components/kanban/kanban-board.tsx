"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";
import { Todo, TodoStatus, KanbanColumn as KanbanColumnType, AssignedTo, Profile } from "./types";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Users, Plus } from "lucide-react";
import { TodoFormSheet } from "@/components/todo/todo-form-sheet";

const COLUMNS: { id: TodoStatus; title: string }[] = [
  { id: "BACKLOG", title: "Backlog" },
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "BLOCKED", title: "Blocked" },
  { id: "DONE", title: "Done" },
];

export function KanbanBoard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigneeFilter, setAssigneeFilter] = useState<AssignedTo | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [mobileActiveColumn, setMobileActiveColumn] = useState<TodoStatus>("TODO");

  useEffect(() => {
    fetchTodos();
    fetchProfiles();

    const channel = supabase
      .channel("todos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        () => {
          fetchTodos();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          fetchTodos();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stakeholders" },
        () => {
          fetchTodos();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "persons" },
        () => {
          fetchTodos();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attachments" },
        () => {
          fetchTodos();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subtasks" },
        () => {
          fetchTodos();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchProfiles();
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

      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .order("position");

      if (tasksError) throw tasksError;

      const { data: stakeholdersData, error: stakeholdersError } = await supabase
        .from("stakeholders")
        .select(`
          *,
          person:persons(*)
        `);

      if (stakeholdersError) throw stakeholdersError;

      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from("attachments")
        .select("*");

      if (attachmentsError) throw attachmentsError;

      const { data: subtasksData, error: subtasksError } = await supabase
        .from("subtasks")
        .select("*")
        .order("created_at");

      if (subtasksError) throw subtasksError;

      const todosWithRelations: Todo[] = (todosData || []).map((todo: any) => ({
        ...todo,
        tasks: (tasksData || []).filter((t: any) => t.todo_id === todo.id),
        subtasks: (subtasksData || []).filter((s: any) => s.todo_id === todo.id),
        stakeholders: (stakeholdersData || []).filter((s: any) => s.todo_id === todo.id),
        attachments: (attachmentsData || []).filter((a: any) => a.todo_id === todo.id),
      }));

      setTodos(todosWithRelations);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("display_name");

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
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
      : todos.filter((todo) => todo.assigned_to === assigneeFilter);

    return COLUMNS.map((col) => ({
      ...col,
      todos: filteredTodos.filter((todo) => todo.status === col.id),
    }));
  };

  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchTodos();
    setSelectedTodo(null);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setSelectedTodo(null);
    }
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
    <div className="space-y-3 sm:space-y-6">
      {/* Desktop Action bar - hidden on mobile */}
      <div className="hidden sm:flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-semibold text-foreground/80 tracking-wide uppercase">
            Filter:
          </span>
          <div className="flex flex-wrap gap-2">
          <Button
            variant={assigneeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setAssigneeFilter("all")}
            className="rounded-lg sm:rounded-xl font-medium transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            All Tasks
          </Button>
          {profiles.map((profile) => (
            <Button
              key={profile.id}
              variant={assigneeFilter === profile.id ? "default" : "outline"}
              size="sm"
              onClick={() => setAssigneeFilter(profile.id)}
              className="rounded-lg sm:rounded-xl font-medium transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {profile.display_name || profile.email}
            </Button>
          ))}
          </div>
        </div>
        <Button
          onClick={() => {
            setSelectedTodo(null);
            setFormOpen(true);
          }}
          className="rounded-lg sm:rounded-xl font-medium transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Add Todo
        </Button>
      </div>

      {/* Mobile Filters - compact version */}
      <div className="sm:hidden flex gap-2 px-1 overflow-x-auto scrollbar-hide pb-2">
        <Button
          variant={assigneeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setAssigneeFilter("all")}
          className="rounded-lg font-medium transition-all flex-shrink-0 h-8 text-xs"
        >
          <Users className="h-3 w-3 mr-1" />
          All
        </Button>
        {profiles.map((profile) => (
          <Button
            key={profile.id}
            variant={assigneeFilter === profile.id ? "default" : "outline"}
            size="sm"
            onClick={() => setAssigneeFilter(profile.id)}
            className="rounded-lg font-medium transition-all flex-shrink-0 h-8 text-xs"
          >
            <User className="h-3 w-3 mr-1" />
            {profile.display_name || profile.email.split('@')[0]}
          </Button>
        ))}
      </div>

      {/* Mobile Lane Tabs - COMPLETELY NEW DESIGN */}
      <div className="sm:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-sm -mx-4 px-4 pb-3">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {COLUMNS.map((column) => {
            const columnData = columns.find(c => c.id === column.id);
            const todoCount = columnData?.todos.length || 0;
            const isActive = mobileActiveColumn === column.id;

            return (
              <button
                key={column.id}
                onClick={() => setMobileActiveColumn(column.id)}
                className={`flex-shrink-0 px-3 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-card/80 border border-border/50 text-muted-foreground active:scale-95"
                }`}
              >
                <span>{column.title.toUpperCase()}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted/80 text-muted-foreground"
                }`}>
                  {todoCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kanban columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Desktop: All columns */}
        <div className="hidden sm:grid sm:grid-cols-5 gap-4 pb-4 px-1">
          {columns.map((column, index) => (
            <div
              key={column.id}
              className="animate-slide-up min-w-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <KanbanColumn column={column} profiles={profiles} onTodoClick={handleTodoClick} />
            </div>
          ))}
        </div>

        {/* Mobile: Single active column - FULL WIDTH */}
        <div className="sm:hidden pb-20">
          {columns
            .filter((column) => column.id === mobileActiveColumn)
            .map((column) => (
              <div key={column.id} className="animate-slide-up px-1">
                <KanbanColumn
                  column={column}
                  profiles={profiles}
                  onTodoClick={handleTodoClick}
                  isMobile={true}
                />
              </div>
            ))}
        </div>
      </DragDropContext>

      {/* Floating Action Button (Mobile) - IMPROVED */}
      <button
        onClick={() => {
          setSelectedTodo(null);
          setFormOpen(true);
        }}
        className="sm:hidden fixed bottom-8 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center z-50"
        aria-label="Add Todo"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {/* Todo form sheet */}
      <TodoFormSheet
        open={formOpen}
        onOpenChange={handleFormClose}
        todo={selectedTodo}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
