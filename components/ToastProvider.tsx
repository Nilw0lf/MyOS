"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

export type Toast = {
  id: string;
  message: string;
};

type ToastContextValue = {
  push: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("ToastProvider missing");
  }
  return ctx;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = (message: string) => {
    const toast = { id: `${Date.now()}-${Math.random()}`, message };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== toast.id));
    }, 3200);
  };

  const value = useMemo(() => ({ push }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-6 top-20 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              "flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm shadow-soft",
              "transition duration-200 ease-smooth"
            )}
          >
            <span>{toast.message}</span>
            <button
              className="rounded-full p-1 text-muted hover:text-text"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
