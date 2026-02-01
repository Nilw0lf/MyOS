# MyOS — Personal Knowledge OS

A local-first, writing-forward knowledge system built with Next.js, Tailwind, Zustand, and Dexie. Capture instantly, link effortlessly, and resurface what matters.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Keyboard shortcuts

- `/` — Focus global search
- `N` — Open Quick Capture modal
- `Cmd/Ctrl + Enter` — Save Quick Capture
- `Cmd/Ctrl + S` — Force-save in note editor
- `Esc` — Close modal/panels

## Export / Import format

Exports download a JSON file in this structure:

```json
{
  "notes": [
    {
      "id": "uuid",
      "title": "Optional title",
      "content": "Markdown content",
      "type": "Idea",
      "tags": ["tag"],
      "mood": "Calm",
      "source": "Book",
      "createdAt": 1710000000000,
      "updatedAt": 1710000000000,
      "pinned": false,
      "archived": false,
      "links": ["other-id"]
    }
  ]
}
```

Imports merge by `id` and keep the newest `updatedAt` version.

## Storage

- Primary: IndexedDB via Dexie (`myos-db`)
- Fallback: localStorage (`myos_notes`) when IndexedDB is unavailable

## Tech stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Zustand state management
- Dexie for local-first storage
- Lucide icons

---

**MyOS** is local-first, offline-capable, and keeps your data on your machine.
