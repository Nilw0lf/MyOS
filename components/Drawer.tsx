"use client";

import { X } from "lucide-react";

export const Drawer = ({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return (
    <div
      className={`fixed right-0 top-0 z-40 h-full w-full max-w-md transform border-l border-border bg-surface p-6 shadow-soft transition duration-200 ease-smooth ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button onClick={onClose} className="btn-ghost" aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
};
