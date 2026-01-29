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
        <div className="mb-8 sm:mb-12 flex items-start justify-between gap-4 animate-slide-down">
          <div className="flex-1">
            <div className="inline-flex items-baseline gap-3 mb-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground animate-in">
                Todo Board
              </h1>
              <span className="text-base sm:text-lg font-mono text-muted-foreground animate-in stagger-1">
                v2.0
              </span>
            </div>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed animate-in stagger-2">
              Kanban-style task dashboard for{" "}
              <span className="font-semibold text-foreground">Nahim</span> &{" "}
              <span className="font-semibold text-foreground">Vanessa</span>
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 animate-in stagger-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Realtime sync enabled
              </span>
            </div>
          </div>

          {/* Theme toggle */}
          <div className="animate-in stagger-2">
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
