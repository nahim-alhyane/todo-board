"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { TodoCard } from "./todo-card";
import { KanbanColumn as KanbanColumnType, Todo } from "./types";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: KanbanColumnType;
  onTodoClick: (todo: Todo) => void;
  isMobile?: boolean;
}

const statusConfig = {
  BACKLOG: {
    bg: "hsl(var(--status-backlog))",
    fg: "hsl(var(--status-backlog-fg))",
    gradient: "from-gray-500/10 to-gray-600/10",
    borderColor: "border-gray-400/30",
  },
  TODO: {
    bg: "hsl(var(--status-todo))",
    fg: "hsl(var(--status-todo-fg))",
    gradient: "from-blue-500/10 to-blue-600/10",
    borderColor: "border-blue-400/30",
  },
  IN_PROGRESS: {
    bg: "hsl(var(--status-progress))",
    fg: "hsl(var(--status-progress-fg))",
    gradient: "from-amber-500/10 to-orange-600/10",
    borderColor: "border-amber-400/30",
  },
  BLOCKED: {
    bg: "hsl(var(--status-blocked))",
    fg: "hsl(var(--status-blocked-fg))",
    gradient: "from-red-500/10 to-red-600/10",
    borderColor: "border-red-400/30",
  },
  DONE: {
    bg: "hsl(var(--status-done))",
    fg: "hsl(var(--status-done-fg))",
    gradient: "from-green-500/10 to-green-600/10",
    borderColor: "border-green-400/30",
  },
};

export function KanbanColumn({ column, onTodoClick, isMobile = false }: KanbanColumnProps) {
  const config = statusConfig[column.id];

  return (
    <div className="flex flex-col w-full min-w-0">
      {/* Column header - simplified on mobile */}
      <div className={cn("relative mb-3 sm:mb-4 group", isMobile && "mb-3")}>
        <div
          className={cn(
            "absolute inset-0 rounded-xl blur-md opacity-50 transition-opacity duration-300 group-hover:opacity-75",
            !isMobile && "sm:rounded-2xl"
          )}
          style={{ background: config.bg }}
        />
        <div
          className={cn(
            "relative rounded-xl border-2 p-3 font-bold text-sm tracking-wide transition-all duration-300",
            !isMobile && "sm:rounded-2xl sm:p-4 hover:scale-[1.02]",
            config.borderColor
          )}
          style={{
            background: config.bg,
            color: config.fg,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="uppercase">{column.title}</span>
            <div
              className="px-3 py-1 rounded-full font-mono text-xs font-semibold shadow-sm"
              style={{
                background: config.fg,
                color: config.bg,
              }}
            >
              {column.todos.length}
            </div>
          </div>
        </div>
      </div>

      {/* Droppable area - full width on mobile */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 rounded-xl border-2 p-3 space-y-3 transition-all duration-300",
              !isMobile && "sm:rounded-2xl sm:min-h-[400px]",
              isMobile ? "min-h-[calc(100vh-280px)]" : "min-h-[300px]",
              snapshot.isDraggingOver
                ? cn(
                    "border-dashed scale-[1.02] shadow-lg",
                    config.borderColor,
                    `bg-gradient-to-br ${config.gradient}`
                  )
                : "border-border/40 bg-card/30 backdrop-blur-sm"
            )}
          >
            {column.todos.map((todo, index) => (
              <Draggable key={todo.id} draggableId={todo.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onTodoClick(todo)}
                  >
                    <TodoCard todo={todo} isDragging={snapshot.isDragging} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Empty state */}
            {column.todos.length === 0 && !snapshot.isDraggingOver && (
              <div className={cn(
                "flex items-center justify-center text-muted-foreground/50 text-sm font-medium",
                isMobile ? "h-32" : "h-24 sm:h-32"
              )}>
                No tasks
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
