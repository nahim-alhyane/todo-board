"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Todo } from "./types";
import { User, CheckCircle2, Circle, Sparkles, Paperclip, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodoCardProps {
  todo: Todo;
  isDragging?: boolean;
}

export function TodoCard({ todo, isDragging }: TodoCardProps) {
  const completedTasks = todo.tasks?.filter((t) => t.completed).length || 0;
  const totalTasks = todo.tasks?.length || 0;
  const hasTasks = totalTasks > 0;
  const allTasksComplete = hasTasks && completedTasks === totalTasks;
  const progress = hasTasks ? (completedTasks / totalTasks) * 100 : 0;
  const stakeholderCount = todo.stakeholders?.length || 0;
  const attachmentCount = todo.attachments?.length || 0;

  const getAssigneeConfig = (assignee: string | null) => {
    if (assignee === "nahim") {
      return {
        bg: "bg-gradient-to-br from-blue-500 to-blue-600",
        glow: "shadow-blue-500/50",
      };
    }
    if (assignee === "vanessa") {
      return {
        bg: "bg-gradient-to-br from-purple-500 to-purple-600",
        glow: "shadow-purple-500/50",
      };
    }
    return {
      bg: "bg-gradient-to-br from-gray-500 to-gray-600",
      glow: "shadow-gray-500/50",
    };
  };

  const assigneeConfig = getAssigneeConfig(todo.assigned_to);

  return (
    <Card
      className={cn(
        "group cursor-grab active:cursor-grabbing transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 overflow-hidden border-2",
        isDragging && "opacity-50 rotate-3 scale-95 shadow-2xl shadow-primary/20",
        !isDragging && "hover:border-primary/30"
      )}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-semibold leading-tight flex-1 group-hover:text-primary transition-colors duration-300">
            {todo.title}
          </CardTitle>
          {todo.assigned_to && (
            <Badge
              variant="secondary"
              className={cn(
                "flex items-center gap-1.5 text-white font-medium shadow-lg transition-all duration-300 hover:scale-105",
                assigneeConfig.bg,
                assigneeConfig.glow
              )}
            >
              <User className="h-3.5 w-3.5" />
              <span className="capitalize">{todo.assigned_to}</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      {(todo.description || hasTasks || stakeholderCount > 0 || attachmentCount > 0) && (
        <CardContent className="space-y-3 relative">
          {todo.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {todo.description}
            </p>
          )}

          {hasTasks && (
            <div className="space-y-2">
              {/* Task progress bar */}
              <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out",
                    allTasksComplete
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-primary to-accent"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Task counter */}
              <div className="flex items-center gap-2 text-sm">
                {allTasksComplete ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                    <span className="font-medium text-green-600 dark:text-green-500">
                      All tasks complete
                    </span>
                    <Sparkles className="h-3.5 w-3.5 text-green-600 dark:text-green-500 animate-pulse" />
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium">
                      {completedTasks}/{totalTasks} tasks
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Metadata row: Stakeholders & Attachments */}
          {(stakeholderCount > 0 || attachmentCount > 0) && (
            <div className="flex items-center gap-3 pt-1">
              {stakeholderCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-medium">{stakeholderCount}</span>
                </div>
              )}
              {attachmentCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span className="font-medium">{attachmentCount}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}

      {/* Bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
