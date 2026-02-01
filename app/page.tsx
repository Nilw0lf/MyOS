"use client";

import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { QuickCapture } from "@/components/QuickCapture";
import { NoteCard } from "@/components/NoteCard";
import { Skeleton } from "@/components/Skeleton";
import { useAppStore } from "@/lib/store";
import { buildComputed, extractKeywords, getTodayRange, keywordScore } from "@/lib/utils";

export default function DashboardPage() {
  const { notes, loading, togglePin } = useAppStore();

  const computed = useMemo(() => buildComputed(notes), [notes]);
  const { start, end } = getTodayRange();

  const todayNotes = computed.filter((note) => note.createdAt >= start && note.createdAt <= end);
  const recentNotes = [...computed].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10);

  const resurfaced = useMemo(() => {
    const recent = recentNotes.slice(0, 5);
    const keywords = extractKeywords(recent);
    return [...computed]
      .filter((note) => !recent.some((item) => item.id === note.id))
      .map((note) => {
        const score =
          keywordScore(note, keywords) +
          (recent.some((item) => item.type === note.type) ? 2 : 0) +
          (note.tags ?? []).filter((tag) => recent.some((item) => (item.tags ?? []).includes(tag))).length;
        return { note, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.note);
  }, [computed, recentNotes]);

  return (
    <AppShell title="Dashboard" subtitle="Capture the moment. Resurface what matters.">
      <div className="space-y-10">
        <QuickCapture />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Today</h2>
            <span className="text-xs text-muted">{todayNotes.length} notes</span>
          </div>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(2)].map((_, index) => (
                <Skeleton key={index} className="h-32" />
              ))}
            </div>
          ) : todayNotes.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {todayNotes.map((note) => (
                <NoteCard key={note.id} note={note} onPin={() => togglePin(note.id)} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No notes yet today.</p>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} onPin={() => togglePin(note.id)} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Resurfaced</h2>
            <span className="text-xs text-muted">based on overlaps</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {resurfaced.map((note) => (
              <NoteCard key={note.id} note={note} onPin={() => togglePin(note.id)} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
