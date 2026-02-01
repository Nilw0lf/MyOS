import type { Note, NoteWithComputed } from "./types";

export const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `note_${Math.random().toString(36).slice(2)}`;
};

export const titleFromContent = (content: string) => {
  const firstLine = content.split("\n")[0]?.trim();
  return firstLine?.slice(0, 80) || "Untitled";
};

export const buildComputed = (notes: Note[]): NoteWithComputed[] => {
  const backlinksMap = new Map<string, string[]>();
  notes.forEach((note) => {
    note.links.forEach((targetId) => {
      const list = backlinksMap.get(targetId) ?? [];
      list.push(note.id);
      backlinksMap.set(targetId, list);
    });
  });

  return notes.map((note) => {
    const backlinks = backlinksMap.get(note.id) ?? [];
    const linkScore = backlinks.length + note.links.length;
    return { ...note, backlinks, linkScore };
  });
};

export const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start: start.getTime(), end: end.getTime() };
};

const fuzzyMatch = (text: string, query: string) => {
  if (!query) return true;
  let tIndex = 0;
  let qIndex = 0;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  while (tIndex < lowerText.length && qIndex < lowerQuery.length) {
    if (lowerText[tIndex] === lowerQuery[qIndex]) {
      qIndex += 1;
    }
    tIndex += 1;
  }
  return qIndex === lowerQuery.length;
};

export const matchQuery = (note: Note, query: string) => {
  if (!query.trim()) return true;
  const tokens = query.toLowerCase().split(/\s+/);
  const haystack = [note.title ?? "", note.content, ...(note.tags ?? [])].join(" ").toLowerCase();
  return tokens.every((token) => fuzzyMatch(haystack, token));
};

export const keywordScore = (note: Note, keywords: string[]) => {
  if (!keywords.length) return 0;
  const haystack = [note.title, note.content, ...(note.tags ?? [])].join(" ").toLowerCase();
  return keywords.reduce((acc, keyword) => (haystack.includes(keyword) ? acc + 1 : acc), 0);
};

export const extractKeywords = (notes: Note[]) => {
  const counts = new Map<string, number>();
  notes.forEach((note) => {
    const words = note.content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3);
    words.forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));
    (note.tags ?? []).forEach((tag) => counts.set(tag.toLowerCase(), (counts.get(tag.toLowerCase()) ?? 0) + 2));
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
};

export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
