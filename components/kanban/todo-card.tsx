"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Todo } from "./types";
import { User, CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodoCardProps {
  todo: Todo;
  isDragging?: boolean;
}

export function TodoCard({ todo, isDragging }: TodoCardProps) {
  const completedSubtasks = todo.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;
  const hasSubtasks = totalSubtasks > 0;

  const getAssigneeColor = (assignee: string | null) => {
    if (assignee === "nahim") return "bg-blue-500";
    if (assignee === "vanessa") return "bg-purple-500";
    return "bg-gray-500";
  };

  return (
    <Card
      className={cn(
        "cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
        isDragging && "opacity-50 rotate-2"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-medium leading-tight">
            {todo.title}
          </CardTitle>
          {todo.assignee && (
            <Badge
              variant="secondary"
              className={cn(
                "flex items-center gap-1 text-white",
                getAssigneeColor(todo.assignee)
              )}
            >
              <User className="h-3 w-3" />
              {todo.assignee}
            </Badge>
          )}
        </div>
      </CardHeader>
      {(todo.description || hasSubtasks) && (
        <CardContent className="space-y-2">
          {todo.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {todo.description}
            </p>
          )}
          {hasSubtasks && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {completedSubtasks === totalSubtasks ? (
                <CheckSquare className="h-4 w-4 text-green-600" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span>
                {completedSubtasks}/{totalSubtasks} subtasks
              </span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
