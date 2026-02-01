"use client";

import { X } from "lucide-react";
import { QuickCapture } from "./QuickCapture";

export const QuickCaptureModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-surface p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Quick Capture</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="mt-4">
          <QuickCapture onSaved={onClose} />
        </div>
      </div>
    </div>
  );
};
