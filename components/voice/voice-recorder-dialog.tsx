"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, AlertCircle, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/components/kanban/types";

interface VoiceRecorderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: Profile[];
  defaultCreatedBy?: string | null;
}

type Status = "idle" | "recording" | "saving";

export function VoiceRecorderDialog({
  open,
  onOpenChange,
  profiles,
  defaultCreatedBy,
}: VoiceRecorderDialogProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [createdBy, setCreatedBy] = useState<string | null>(defaultCreatedBy ?? null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // Text in the textarea before the current recording session started.
  // We rebuild the full transcript from scratch on every onresult event, so we
  // need a stable base to prepend the session's words onto.
  const baseTranscriptRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setTranscript("");
      setInterim("");
      setError(null);
      setStatus("idle");
      setCreatedBy(defaultCreatedBy ?? profiles[0]?.id ?? null);
    } else {
      stopRecognition();
    }
  }, [open, defaultCreatedBy, profiles]);

  const stopRecognition = () => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        // already stopped
      }
      recognitionRef.current = null;
    }
  };

  const startRecording = () => {
    const Ctor =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    if (!Ctor) {
      setSupported(false);
      return;
    }

    setError(null);
    setInterim("");
    baseTranscriptRef.current = transcript.trim();
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Rebuild the session text from ALL results every event. Some browsers
      // (notably Chrome under certain network conditions) keep finalized
      // entries in event.results and reset resultIndex, which would cause
      // duplicated words if we appended incrementally.
      let interimText = "";
      let finalText = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }
      const base = baseTranscriptRef.current;
      const combinedFinal = [base, finalText.trim()].filter(Boolean).join(" ");
      setTranscript(combinedFinal);
      setInterim(interimText.trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const message =
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "Microphone permission was denied. Allow access in your browser settings to record."
          : event.error === "no-speech"
          ? "I didn't catch anything — try again and speak a bit louder."
          : `Recognition error: ${event.error}`;
      setError(message);
      setStatus("idle");
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setInterim("");
      // If user hasn't manually stopped, browser ended the session — flip back to idle
      setStatus((prev) => (prev === "recording" ? "idle" : prev));
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setStatus("recording");
    } catch (err) {
      setError("Couldn't start recording. Try refreshing the page.");
      setStatus("idle");
      recognitionRef.current = null;
    }
  };

  const stopRecording = () => {
    stopRecognition();
    setStatus("idle");
  };

  const handleSave = async () => {
    const text = transcript.trim();
    if (!text) {
      setError("Nothing to save — record something first.");
      return;
    }
    setStatus("saving");
    setError(null);
    try {
      const { error: insertError } = await supabase.from("voice_drafts").insert({
        transcript: text,
        created_by: createdBy,
      });
      if (insertError) throw insertError;
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to save voice draft:", err);
      setError("Couldn't save the draft. Check the console and try again.");
      setStatus("idle");
    }
  };

  const isRecording = status === "recording";
  const isSaving = status === "saving";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Record a voice draft</SheetTitle>
          <SheetDescription>
            Speak your idea. The transcript is saved as-is — another tool will turn it into a real todo later.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 mt-6 flex-1 min-h-0">
          {!supported && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Speech recognition isn&apos;t supported in this browser. Try Chrome, Edge, or Safari.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="recorded-by">Recording as</Label>
            <Select
              value={createdBy ?? undefined}
              onValueChange={(v) => setCreatedBy(v)}
              disabled={isRecording || isSaving}
            >
              <SelectTrigger id="recorded-by">
                <SelectValue placeholder="Select a person" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.display_name || p.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!supported || isSaving}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              className={`relative h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? "bg-destructive text-destructive-foreground hover:scale-105"
                  : "bg-primary text-primary-foreground hover:scale-105"
              }`}
            >
              {isRecording ? <Square className="h-7 w-7" /> : <Mic className="h-8 w-8" />}
              {isRecording && (
                <span className="absolute inset-0 rounded-full border-4 border-destructive/40 animate-ping" />
              )}
            </button>
            <p className="mt-3 text-sm text-muted-foreground">
              {isRecording ? "Listening… tap to stop" : "Tap to start recording"}
            </p>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-h-0">
            <Label htmlFor="transcript">Transcript</Label>
            <Textarea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your words will appear here as you speak. You can also edit this manually."
              className="flex-1 min-h-[120px] resize-none"
              disabled={isSaving}
            />
            {isRecording && interim && (
              <p className="text-xs italic text-muted-foreground truncate">
                Listening: {interim}…
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <SheetFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isRecording || !transcript.trim()}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save draft"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
