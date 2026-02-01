import type { Note } from "./types";
import { storage } from "./storage";

export const exportNotes = (notes: Note[]) => {
  const blob = new Blob([JSON.stringify({ notes }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `myos-export-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const mergeNotes = (existing: Note[], incoming: Note[]) => {
  const map = new Map(existing.map((note) => [note.id, note]));
  incoming.forEach((note) => {
    const current = map.get(note.id);
    if (!current || note.updatedAt > current.updatedAt) {
      map.set(note.id, note);
    }
  });
  return Array.from(map.values());
};

export const importNotes = async (file: File, existing: Note[]) => {
  const text = await file.text();
  const payload = JSON.parse(text) as { notes: Note[] };
  const merged = mergeNotes(existing, payload.notes ?? []);
  await storage.putNotes(merged);
  return merged;
};
