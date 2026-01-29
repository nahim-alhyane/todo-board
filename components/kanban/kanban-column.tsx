"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { TodoCard } from "./todo-card";
import { KanbanColumn as KanbanColumnType } from "./types";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: KanbanColumnType;
}

const statusColors = {
  BACKLOG: "bg-gray-100 text-gray-700 border-gray-300",
  TODO: "bg-blue-100 text-blue-700 border-blue-300",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 border-yellow-300",
  BLOCKED: "bg-red-100 text-red-700 border-red-300",
  DONE: "bg-green-100 text-green-700 border-green-300",
};

export function KanbanColumn({ column }: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[320px] max-w-[320px]">
      <div
        className={cn(
          "rounded-lg border-2 p-3 mb-3 font-semibold text-sm",
          statusColors[column.id]
        )}
      >
        <div className="flex items-center justify-between">
          <span>{column.title}</span>
          <span className="bg-white rounded-full px-2 py-0.5 text-xs">
            {column.todos.length}
          </span>
        </div>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 rounded-lg border-2 border-dashed p-3 space-y-3 min-h-[200px] transition-colors",
              snapshot.isDraggingOver
                ? "bg-blue-50 border-blue-300"
                : "bg-gray-50 border-gray-200"
            )}
          >
            {column.todos.map((todo, index) => (
              <Draggable key={todo.id} draggableId={todo.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TodoCard todo={todo} isDragging={snapshot.isDragging} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
