"use client";

import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";
import { Profile, VoiceDraft } from "@/components/kanban/types";

interface VoiceInboxDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: Profile[];
}

const formatRelativeTime = (iso: string): string => {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString();
};

export function VoiceInboxDrawer({ open, onOpenChange, profiles }: VoiceInboxDrawerProps) {
  const [drafts, setDrafts] = useState<VoiceDraft[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchDrafts();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const channel = supabase
      .channel("voice-drafts-inbox")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "voice_drafts" },
        () => {
          fetchDrafts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open]);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("voice_drafts")
        .select("*")
        .eq("processed", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setDrafts((data || []) as VoiceDraft[]);
    } catch (err) {
      console.error("Failed to fetch voice drafts:", err);
    } finally {
      setLoading(false);
    }
  };

  const profileLabel = (id: string | null): string => {
    if (!id) return "Unknown";
    const p = profiles.find((x) => x.id === id);
    return p?.display_name || p?.email || "Unknown";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Voice inbox
          </SheetTitle>
          <SheetDescription>
            Pending voice drafts. They&apos;ll be processed into todos by another tool.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-6 -mx-6 px-6">
          {loading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">Loading…</div>
          ) : drafts.length === 0 ? (
            <div className="text-sm text-muted-foreground py-12 text-center flex flex-col items-center gap-2">
              <Inbox className="h-8 w-8 opacity-40" />
              <span>No pending voice drafts.</span>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {drafts.map((draft) => (
                <li
                  key={draft.id}
                  className="rounded-lg border border-border/60 bg-card p-3 shadow-sm"
                >
                  <p className="text-sm whitespace-pre-wrap">{draft.transcript}</p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="font-normal">
                      {profileLabel(draft.created_by)}
                    </Badge>
                    <span>{formatRelativeTime(draft.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
