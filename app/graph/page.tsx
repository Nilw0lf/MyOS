"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Drawer } from "@/components/Drawer";
import { useAppStore } from "@/lib/store";
import type { NoteType } from "@/lib/types";
import { buildComputed } from "@/lib/utils";
import Link from "next/link";

const TYPES: NoteType[] = ["Idea", "Quote", "Observation", "Project Note", "Journal"];

export default function GraphPage() {
  const { notes } = useAppStore();
  const [connectedOnly, setConnectedOnly] = useState(false);
  const [filterType, setFilterType] = useState<NoteType | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  const computed = useMemo(() => buildComputed(notes), [notes]);

  const filtered = computed.filter((note) => (filterType === "all" ? true : note.type === filterType));
  const connected = connectedOnly ? filtered.filter((note) => note.links.length || note.backlinks.length) : filtered;

  const focusSet = useMemo(() => {
    if (!focusMode || !selectedId) return null;
    const current = computed.find((note) => note.id === selectedId);
    if (!current) return null;
    const neighbors = new Set([current.id, ...current.links, ...current.backlinks]);
    return neighbors;
  }, [focusMode, selectedId, computed]);

  const graphNotes = focusSet ? connected.filter((note) => focusSet.has(note.id)) : connected;

  const radius = 220;
  const center = { x: 260, y: 260 };
  const positions = graphNotes.map((note, index) => {
    const angle = (index / Math.max(graphNotes.length, 1)) * Math.PI * 2;
    return {
      id: note.id,
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
      note,
    };
  });

  const selected = computed.find((note) => note.id === selectedId) ?? null;

  return (
    <AppShell title="Graph View" subtitle="See how your notes connect at a glance.">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <button className="btn-ghost" onClick={() => setConnectedOnly((prev) => !prev)}>
            {connectedOnly ? "Show all" : "Connected only"}
          </button>
          <button className="btn-ghost" onClick={() => setFocusMode((prev) => !prev)}>
            {focusMode ? "Exit focus" : "Focus mode"}
          </button>
          <select
            className="input max-w-[200px]"
            value={filterType}
            onChange={(event) => setFilterType(event.target.value as NoteType | "all")}
          >
            <option value="all">All types</option>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="card p-6">
          <svg viewBox="0 0 520 520" className="w-full">
            <defs>
              <linearGradient id="line" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--accent2)" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {positions.map((node) =>
              node.note.links.map((targetId) => {
                const target = positions.find((item) => item.id === targetId);
                if (!target) return null;
                return (
                  <line
                    key={`${node.id}-${targetId}`}
                    x1={node.x}
                    y1={node.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="url(#line)"
                    strokeWidth={1}
                  />
                );
              })
            )}
            {positions.map((node) => (
              <g key={node.id} onClick={() => setSelectedId(node.id)} className="cursor-pointer">
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={Math.max(6, 6 + node.note.linkScore)}
                  fill="var(--accent)"
                  opacity={selectedId === node.id ? 0.9 : 0.65}
                />
                <text x={node.x + 10} y={node.y + 4} className="text-xs" fill="var(--muted)">
                  {node.note.title?.slice(0, 18)}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <Drawer open={!!selected} title="Preview" onClose={() => setSelectedId(null)}>
        {selected && (
          <>
            <div>
              <h4 className="text-base font-semibold">{selected.title}</h4>
              <span className="pill mt-2 inline-flex">{selected.type}</span>
              <p className="mt-3 text-sm text-muted line-clamp-4">{selected.content}</p>
            </div>
            <Link href={`/note/${selected.id}`} className="btn-primary w-full">
              Open note
            </Link>
          </>
        )}
      </Drawer>
    </AppShell>
  );
}
