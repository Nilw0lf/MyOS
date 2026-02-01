"use client";

import { Pin, Archive } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import type { Note } from "@/lib/types";
import { formatDate, titleFromContent } from "@/lib/utils";

export const NoteCard = ({
  note,
  onPin,
  onArchive,
}: {
  note: Note;
  onPin?: () => void;
  onArchive?: () => void;
}) => {
  return (
    <div className="card card-hover group flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/note/${note.id}`} className="text-base font-semibold">
            {note.title || titleFromContent(note.content)}
          </Link>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span className="pill">{note.type}</span>
            <span>{formatDate(note.updatedAt)}</span>
          </div>
        </div>
        {note.pinned && <Pin className="h-4 w-4 text-accent" />}
      </div>
      <p className="text-sm text-muted line-clamp-2">{note.content}</p>
      {(onPin || onArchive) && (
        <div className="mt-auto flex items-center gap-2 opacity-0 transition duration-200 group-hover:opacity-100">
          {onPin && (
            <button onClick={onPin} className="btn-ghost text-xs">
              <Pin size={14} />
              {note.pinned ? "Unpin" : "Pin"}
            </button>
          )}
          {onArchive && (
            <button onClick={onArchive} className="btn-ghost text-xs">
              <Archive size={14} />
              {note.archived ? "Restore" : "Archive"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
