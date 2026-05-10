import { KanbanBoard } from "@/components/kanban/kanban-board";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10" />

      {/* Decorative elements */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="fixed bottom-20 left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="max-w-[1800px] mx-auto relative">
        {/* Header section with theme toggle */}
        <div className="mb-6 sm:mb-8 lg:mb-12 flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 sm:gap-6 animate-slide-down">
          <div className="flex-1 w-full sm:w-auto">
            <div className="flex flex-col sm:inline-flex sm:items-baseline gap-2 sm:gap-3 mb-2 sm:mb-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground animate-in">
                Todo Board
              </h1>
              <span className="text-sm sm:text-base lg:text-lg font-mono text-muted-foreground animate-in stagger-1">
                v2.0
              </span>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed animate-in stagger-2">
              Kanban-style task dashboard for{" "}
              <span className="font-semibold text-foreground">Nahim</span> &{" "}
              <span className="font-semibold text-foreground">Vanessa</span>
            </p>
          </div>

          {/* Theme toggle + Realtime status */}
          <div className="flex items-center gap-2 sm:gap-3 animate-in stagger-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-border/50 flex items-center justify-center" title="Realtime sync enabled">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary animate-pulse" />
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Kanban board */}
        <div className="animate-slide-up">
          <KanbanBoard />
        </div>
      </div>
    </main>
  );
}
