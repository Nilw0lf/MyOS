"use client";

import { useEffect, useRef, useState } from "react";
import { TypeSelector } from "./TypeSelector";
import type { NoteType } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { useToast } from "./ToastProvider";

export const QuickCapture = ({ onSaved }: { onSaved?: () => void }) => {
  const { createNote } = useAppStore();
  const { push } = useToast();
  const [type, setType] = useState<NoteType>("Idea");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  useEffect(() => {
    resize();
  }, [content]);

  const save = async () => {
    if (!content.trim() && !title.trim()) return;
    await createNote({ title, content, type });
    setTitle("");
    setContent("");
    push("Saved");
    onSaved?.();
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quick Capture</h3>
        <TypeSelector value={type} onChange={setType} />
      </div>
      <input
        className="input text-base"
        placeholder="Title (optional)"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <textarea
        ref={textareaRef}
        className="input min-h-[120px] resize-none text-sm"
        placeholder="Start typing..."
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            save();
          }
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">Cmd/Ctrl + Enter to save</span>
        <button className="btn-primary" onClick={save}>
          Save
        </button>
      </div>
    </div>
  );
};
