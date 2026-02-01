"use client";

import { create } from "zustand";
import type { Note, NoteType } from "./types";
import { generateId, titleFromContent } from "./utils";
import { storage } from "./storage";
import { sampleNotes } from "./sample";

export type NoteFilters = {
  types: NoteType[];
  dateRange: "7" | "30" | "90" | "all";
  pinnedOnly: boolean;
  archived: boolean;
  tags: string[];
};

type AppState = {
  notes: Note[];
  loading: boolean;
  searchQuery: string;
  filters: NoteFilters;
  initialize: () => Promise<void>;
  seedSample: () => Promise<void>;
  setSearch: (value: string) => void;
  setFilters: (filters: Partial<NoteFilters>) => void;
  createNote: (data: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  linkNotes: (sourceId: string, targetId: string) => Promise<void>;
  unlinkNotes: (sourceId: string, targetId: string) => Promise<void>;
};

const defaultFilters: NoteFilters = {
  types: ["Idea", "Quote", "Observation", "Project Note", "Journal"],
  dateRange: "all",
  pinnedOnly: false,
  archived: false,
  tags: [],
};

export const useAppStore = create<AppState>((set, get) => ({
  notes: [],
  loading: true,
  searchQuery: "",
  filters: defaultFilters,
  initialize: async () => {
    set({ loading: true });
    const notes = await storage.getNotes();
    set({ notes, loading: false });
  },
  seedSample: async () => {
    const now = Date.now();
    const notes = sampleNotes.map((note, index) => ({
      ...note,
      createdAt: now - index * 1000 * 60 * 60,
      updatedAt: now - index * 1000 * 60 * 60,
    }));
    await storage.putNotes(notes);
    set({ notes });
  },
  setSearch: (value) => set({ searchQuery: value }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  createNote: async (data) => {
    const now = Date.now();
    const note: Note = {
      id: generateId(),
      title: data.title || titleFromContent(data.content || ""),
      content: data.content || "",
      type: data.type || "Idea",
      tags: data.tags || [],
      mood: data.mood,
      source: data.source,
      createdAt: now,
      updatedAt: now,
      pinned: false,
      archived: false,
      links: data.links || [],
    };
    await storage.putNote(note);
    set((state) => ({ notes: [note, ...state.notes] }));
    return note;
  },
  updateNote: async (id, updates) => {
    const { notes } = get();
    const note = notes.find((item) => item.id === id);
    if (!note) return;
    const nextContent = updates.content ?? note.content;
    const nextTitle =
      updates.title === "" ? titleFromContent(nextContent) : updates.title ?? note.title;
    const updated: Note = {
      ...note,
      ...updates,
      title: nextTitle,
      updatedAt: Date.now(),
    };
    await storage.putNote(updated);
    set({ notes: notes.map((item) => (item.id === id ? updated : item)) });
  },
  deleteNote: async (id) => {
    await storage.deleteNote(id);
    set({ notes: get().notes.filter((note) => note.id !== id) });
  },
  togglePin: async (id) => {
    const note = get().notes.find((item) => item.id === id);
    if (!note) return;
    await get().updateNote(id, { pinned: !note.pinned });
  },
  toggleArchive: async (id) => {
    const note = get().notes.find((item) => item.id === id);
    if (!note) return;
    await get().updateNote(id, { archived: !note.archived });
  },
  linkNotes: async (sourceId, targetId) => {
    const note = get().notes.find((item) => item.id === sourceId);
    if (!note) return;
    if (note.links.includes(targetId)) return;
    await get().updateNote(sourceId, { links: [...note.links, targetId] });
  },
  unlinkNotes: async (sourceId, targetId) => {
    const note = get().notes.find((item) => item.id === sourceId);
    if (!note) return;
    await get().updateNote(sourceId, { links: note.links.filter((id) => id !== targetId) });
  },
}));
