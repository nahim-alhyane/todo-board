import { KanbanBoard } from "@/components/kanban/kanban-board";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Todo Board
          </h1>
          <p className="text-muted-foreground mt-2">
            Kanban-style task dashboard for Nahim & Vanessa
          </p>
        </div>
        <KanbanBoard />
      </div>
    </main>
  );
}
