"use client";

import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";
import { useAppStore } from "@/lib/store";
import { exportNotes, importNotes } from "@/lib/transfer";

export default function SettingsPage() {
  const { notes } = useAppStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetText, setResetText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { push } = useToast();

  const handleExport = () => {
    exportNotes(notes);
    push("Exported");
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const merged = await importNotes(file, notes);
    useAppStore.setState({ notes: merged });
    push("Imported");
  };

  const resetData = () => {
    if (resetText !== "RESET") return;
    localStorage.removeItem("myos_notes");
    indexedDB.deleteDatabase("myos-db");
    useAppStore.setState({ notes: [] });
    setResetText("");
    setConfirmReset(false);
    push("Local data reset");
  };

  return (
    <AppShell title="Settings" subtitle="Manage your local data and preferences.">
      <div className="space-y-6">
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Data</h3>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" onClick={handleExport}>
              Export JSON
            </button>
            <button className="btn-ghost" onClick={() => fileInputRef.current?.click()}>
              Import JSON
            </button>
          </div>
          <p className="text-sm text-muted">Exports include all notes with metadata, tags, and links.</p>
        </div>

        <div className="card p-6 space-y-3">
          <h3 className="text-lg font-semibold text-danger">Danger zone</h3>
          <p className="text-sm text-muted">Reset local data after typing RESET. This cannot be undone.</p>
          <input
            className="input max-w-xs"
            placeholder="Type RESET"
            value={resetText}
            onChange={(event) => setResetText(event.target.value)}
          />
          <button className="btn-ghost text-danger" onClick={() => setConfirmReset(true)}>
            Reset local data
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirmReset}
        title="Reset local data"
        description="This deletes all local notes. Type RESET in the input to continue."
        confirmLabel="Reset"
        onConfirm={resetData}
        onClose={() => setConfirmReset(false)}
      />

      <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImport} hidden />
    </AppShell>
  );
}
