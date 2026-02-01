"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppStore } from "@/lib/store";
import { buildComputed, extractKeywords, keywordScore } from "@/lib/utils";

export default function DigestPage() {
  const { notes } = useAppStore();
  const [generated, setGenerated] = useState(false);

  const lastWeek = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return notes.filter((note) => note.createdAt >= cutoff);
  }, [notes]);

  const computed = useMemo(() => buildComputed(notes), [notes]);
  const keywords = extractKeywords(lastWeek);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    lastWeek.forEach((note) => {
      map[note.type] = (map[note.type] ?? 0) + 1;
    });
    return map;
  }, [lastWeek]);

  const topConnected = useMemo(() => {
    return [...computed].sort((a, b) => b.linkScore - a.linkScore).slice(0, 5);
  }, [computed]);

  const resurfacing = useMemo(() => {
    return [...notes]
      .filter((note) => !lastWeek.find((item) => item.id === note.id))
      .sort((a, b) => keywordScore(b, keywords) - keywordScore(a, keywords))
      .slice(0, 4);
  }, [notes, lastWeek, keywords]);

  return (
    <AppShell title="Weekly Digest" subtitle="Review patterns and surface what to revisit.">
      <div className="space-y-6">
        <button className="btn-primary" onClick={() => setGenerated(true)}>
          Generate Digest
        </button>

        {generated && (
          <div className="card p-6 space-y-6">
            <section>
              <h3 className="text-lg font-semibold">This week by type</h3>
              <div className="mt-3 flex flex-wrap gap-3">
                {Object.entries(counts).map(([type, count]) => (
                  <span key={type} className="chip">
                    {type}: {count}
                  </span>
                ))}
                {!Object.keys(counts).length && <span className="text-sm text-muted">No notes yet.</span>}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Themes & keywords</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <span key={keyword} className="chip">
                    {keyword}
                  </span>
                ))}
                {!keywords.length && <span className="text-sm text-muted">No keywords yet.</span>}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Most connected notes</h3>
              <div className="mt-3 space-y-2 text-sm">
                {topConnected.map((note) => (
                  <div key={note.id} className="flex items-center justify-between">
                    <span>{note.title}</span>
                    <span className="text-xs text-muted">{note.linkScore} links</span>
                  </div>
                ))}
                {!topConnected.length && <span className="text-sm text-muted">No links yet.</span>}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Resurfacing candidates</h3>
              <div className="mt-3 space-y-2 text-sm">
                {resurfacing.map((note) => (
                  <div key={note.id} className="flex items-center justify-between">
                    <span>{note.title}</span>
                    <span className="text-xs text-muted">{note.type}</span>
                  </div>
                ))}
                {!resurfacing.length && <span className="text-sm text-muted">No resurfacing yet.</span>}
              </div>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}
