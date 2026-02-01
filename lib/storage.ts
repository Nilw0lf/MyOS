import Dexie, { Table } from "dexie";
import type { Note } from "./types";

class MyOSDatabase extends Dexie {
  notes!: Table<Note, string>;

  constructor() {
    super("myos-db");
    this.version(1).stores({
      notes: "id, createdAt, updatedAt, pinned, archived, type",
    });
  }
}

const db = typeof window !== "undefined" ? new MyOSDatabase() : null;

const localKey = "myos_notes";

const localAdapter = {
  getAll: (): Note[] => {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(localKey);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  },
  setAll: (notes: Note[]) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(localKey, JSON.stringify(notes));
  },
};

const canUseIndexedDb = () => {
  if (typeof window === "undefined") return false;
  try {
    return !!window.indexedDB;
  } catch {
    return false;
  }
};

export const storage = {
  async getNotes(): Promise<Note[]> {
    if (db && canUseIndexedDb()) {
      return db.notes.toArray();
    }
    return localAdapter.getAll();
  },
  async putNotes(notes: Note[]) {
    if (db && canUseIndexedDb()) {
      await db.notes.bulkPut(notes);
      return;
    }
    localAdapter.setAll(notes);
  },
  async deleteNote(id: string) {
    if (db && canUseIndexedDb()) {
      await db.notes.delete(id);
      return;
    }
    const notes = localAdapter.getAll().filter((note) => note.id !== id);
    localAdapter.setAll(notes);
  },
  async putNote(note: Note) {
    if (db && canUseIndexedDb()) {
      await db.notes.put(note);
      return;
    }
    const notes = localAdapter.getAll();
    const index = notes.findIndex((item) => item.id === note.id);
    if (index >= 0) {
      notes[index] = note;
    } else {
      notes.push(note);
    }
    localAdapter.setAll(notes);
  },
};
