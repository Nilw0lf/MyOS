"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TagInput } from "@/components/TagInput";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";
import { useAppStore } from "@/lib/store";
import type { Mood, NoteType } from "@/lib/types";
import { buildComputed, formatDateTime, matchQuery } from "@/lib/utils";
import Link from "next/link";
import { Archive, Copy, Pin, Trash2 } from "lucide-react";

const TYPE_OPTIONS: NoteType[] = ["Idea", "Quote", "Observation", "Project Note", "Journal"];
const MOOD_OPTIONS: Mood[] = ["Calm", "Focused", "Stressed", "Excited"];

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notes, updateNote, createNote, deleteNote, toggleArchive, togglePin, linkNotes, unlinkNotes } = useAppStore();
  const { push } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<NoteType>("Idea");
  const [mood, setMood] = useState<Mood | "">("");
  const [source, setSource] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [linkQuery, setLinkQuery] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const note = useMemo(() => notes.find((item) => item.id === params.id), [notes, params.id]);
  const computed = useMemo(() => buildComputed(notes), [notes]);
  const computedNote = computed.find((item) => item.id === params.id);

  useEffect(() => {
    if (!note) return;
    setTitle(note.title ?? "");
    setContent(note.content);
    setType(note.type);
    setMood(note.mood ?? "");
    setSource(note.source ?? "");
    setTags(note.tags ?? []);
  }, [note]);

  useEffect(() => {
    if (!note) return;
    if (!editMode) return;
    setSaveStatus("Saving...");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await updateNote(note.id, { title, content, type, mood: mood || undefined, source, tags });
      setSaveStatus("Saved");
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, content, type, mood, source, tags, editMode, note, updateNote]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!note) return;
        updateNote(note.id, { title, content, type, mood: mood || undefined, source, tags });
        setSaveStatus("Saved");
        push("Saved");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [note, title, content, type, mood, source, tags, updateNote, push]);

  if (!note || !computedNote) {
    return (
      <AppShell title="Note not found">
        <p className="text-sm text-muted">This note does not exist.</p>
      </AppShell>
    );
  }

  const suggested = computed
    .filter((item) => item.id !== note.id)
    .filter((item) => {
      const tagOverlap = (item.tags ?? []).some((tag) => tags.includes(tag));
      const keywordOverlap = matchQuery(item, content.split(" ").slice(0, 6).join(" "));
      return tagOverlap || keywordOverlap || item.type === type;
    })
    .slice(0, 6);

  const linkResults = computed
    .filter((item) => item.id !== note.id)
    .filter((item) => matchQuery(item, linkQuery))
    .slice(0, 6);

  return (
    <AppShell title={note.title || "Untitled"} subtitle="Edit, link, and enrich the note.">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button className="btn-ghost" onClick={() => setEditMode((prev) => !prev)}>
                {editMode ? "View mode" : "Edit mode"}
              </button>
              <span className="text-xs text-muted">{saveStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-ghost" onClick={() => togglePin(note.id)}>
                <Pin size={16} />
                {note.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  toggleArchive(note.id);
                  push(note.archived ? "Restored" : "Archived");
                }}
              >
                <Archive size={16} />
                {note.archived ? "Restore" : "Archive"}
              </button>
              <button
                className="btn-ghost"
                onClick={async () => {
                  await createNote({
                    title: `${note.title ?? "Untitled"} (copy)`,
                    content: note.content,
                    type: note.type,
                    tags: note.tags,
                    mood: note.mood,
                    source: note.source,
                    links: note.links,
                  });
                  push("Duplicated");
                }}
              >
                <Copy size={16} />
                Duplicate
              </button>
              <button className="btn-ghost text-danger" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            {editMode ? (
              <>
                <input
                  className="input text-lg"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Title"
                />
                <textarea
                  className="input min-h-[280px] resize-none"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold">{note.title ?? "Untitled"}</h2>
                <MarkdownRenderer content={note.content} />
              </>
            )}
          </div>
        </div>

        <aside className="w-full max-w-sm space-y-6">
          <div className="card p-4 space-y-4">
            <h3 className="text-sm font-semibold">Metadata</h3>
            <div className="space-y-3 text-sm">
              <label className="block">
                <span className="text-xs text-muted">Type</span>
                <select className="input" value={type} onChange={(event) => setType(event.target.value as NoteType)}>
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-muted">Mood</span>
                <select
                  className="input"
                  value={mood}
                  onChange={(event) => setMood(event.target.value as Mood)}
                >
                  <option value="">None</option>
                  {MOOD_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-muted">Source</span>
                <input
                  className="input"
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  placeholder="Book, person, link"
                />
              </label>
              <div>
                <span className="text-xs text-muted">Tags</span>
                <TagInput tags={tags} onChange={setTags} />
              </div>
              <div className="text-xs text-muted">
                <div>Created: {formatDateTime(note.createdAt)}</div>
                <div>Updated: {formatDateTime(note.updatedAt)}</div>
              </div>
            </div>
          </div>

          <div className="card p-4 space-y-4">
            <h3 className="text-sm font-semibold">Linking</h3>
            <div>
              <p className="text-xs text-muted">Suggested Links</p>
              <div className="mt-2 space-y-2">
                {suggested.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      linkNotes(note.id, item.id);
                      push("Linked");
                    }}
                    className="block w-full text-left text-sm text-accent hover:underline"
                  >
                    {item.title}
                  </button>
                ))}
                {!suggested.length && <span className="text-xs text-muted">No suggestions yet.</span>}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted">Link to note</p>
              <input
                className="input mt-2"
                value={linkQuery}
                onChange={(event) => setLinkQuery(event.target.value)}
                placeholder="Search notes"
              />
              <div className="mt-2 space-y-2">
                {linkResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      linkNotes(note.id, item.id);
                      push("Linked");
                    }}
                    className="block w-full text-left text-sm text-accent hover:underline"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted">Outgoing links</p>
              <div className="mt-2 space-y-2">
                {note.links.map((id) => {
                  const linked = computed.find((item) => item.id === id);
                  if (!linked) return null;
                  return (
                    <div key={id} className="flex items-center justify-between text-sm">
                      <Link href={`/note/${id}`} className="text-accent hover:underline">
                        {linked.title}
                      </Link>
                      <button
                        className="text-xs text-muted hover:text-text"
                        onClick={() => unlinkNotes(note.id, id)}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
                {!note.links.length && <span className="text-xs text-muted">No outgoing links.</span>}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted">Backlinks</p>
              <div className="mt-2 space-y-2">
                {computedNote.backlinks.map((id) => {
                  const linked = computed.find((item) => item.id === id);
                  if (!linked) return null;
                  return (
                    <Link key={id} href={`/note/${id}`} className="block text-sm text-accent hover:underline">
                      {linked.title}
                    </Link>
                  );
                })}
                {!computedNote.backlinks.length && <span className="text-xs text-muted">No backlinks yet.</span>}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Delete note"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          await deleteNote(note.id);
          setConfirmDelete(false);
          router.push("/notes");
        }}
        onClose={() => setConfirmDelete(false)}
      />
    </AppShell>
  );
}
