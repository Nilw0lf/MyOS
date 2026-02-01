"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <div className="markdown space-y-4 text-sm leading-7">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};
