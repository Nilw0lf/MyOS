"use client";

import { X } from "lucide-react";
import { useState } from "react";

export const TagInput = ({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) => {
  const [value, setValue] = useState("");

  const addTag = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setValue("");
      return;
    }
    onChange([...tags, trimmed]);
    setValue("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="chip">
            {tag}
            <button
              onClick={() => onChange(tags.filter((item) => item !== tag))}
              className="ml-1 text-muted hover:text-text"
              aria-label={`Remove ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Add tag"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag();
            }
          }}
        />
        <button onClick={addTag} className="btn-ghost">
          Add
        </button>
      </div>
    </div>
  );
};
