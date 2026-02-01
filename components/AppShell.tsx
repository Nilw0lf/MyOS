"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Download, Settings, Upload } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { QuickCaptureModal } from "./QuickCaptureModal";
import { useAppStore } from "@/lib/store";
import { useToast } from "./ToastProvider";
import { exportNotes, importNotes } from "@/lib/transfer";
import { ConfirmModal } from "./ConfirmModal";

const isTypingTarget = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null;
  if (!target) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || target.isContentEditable;
};

export const AppShell = ({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) => {
  const [showCapture, setShowCapture] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notes, seedSample, setSearch, initialize } = useAppStore();
  const { push } = useToast();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const stored = localStorage.getItem("myos_onboarded");
    if (!stored) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event)) return;
      if (event.key.toLowerCase() === "n" && !event.metaKey && !event.ctrlKey) {
        setShowCapture(true);
      }
      if (event.key === "Escape") {
        setShowCapture(false);
        setShowOnboarding(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleExport = () => {
    exportNotes(notes);
    push("Exported");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const merged = await importNotes(file, notes);
    useAppStore.setState({ notes: merged });
    push("Imported");
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div>
            <Link href="/" className="text-lg font-semibold">
              MyOS
            </Link>
            <p className="text-xs text-muted">write, link, resurface</p>
          </div>
          <SearchBar className="flex-1" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="btn-ghost" onClick={handleExport}>
              <Download size={16} />
              Export
            </button>
            <button className="btn-ghost" onClick={handleImportClick}>
              <Upload size={16} />
              Import
            </button>
            <Link href="/settings" className="btn-ghost" aria-label="Settings">
              <Settings size={16} />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>

      <QuickCaptureModal open={showCapture} onClose={() => setShowCapture(false)} />

      <ConfirmModal
        open={showOnboarding}
        title="Welcome to MyOS"
        description="Start with sample notes so you can see linking, graph, and resurfacing in action."
        confirmLabel="Yes, add samples"
        onConfirm={async () => {
          await seedSample();
          localStorage.setItem("myos_onboarded", "true");
          setSearch("");
          setShowOnboarding(false);
        }}
        onClose={() => {
          localStorage.setItem("myos_onboarded", "true");
          setShowOnboarding(false);
        }}
      />

      <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImport} hidden />
    </div>
  );
};
