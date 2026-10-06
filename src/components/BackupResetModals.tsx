import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Database,
  Download,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { DayTrackerItem } from '../data/trackerGenerator';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: DayTrackerItem[];
  notes: Record<number, string>;
  bookmarks: Record<number, boolean>;
  startDate: string;
  onImportState: (payload: {
    completedMap?: Record<string, boolean>;
    notes?: Record<number, string>;
    bookmarks?: Record<number, boolean>;
    startDate?: string;
  }) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  days,
  notes,
  bookmarks,
  startDate,
  onImportState,
}) => {
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  if (!isOpen) return null;

  const buildPayload = () => {
    const completedMap: Record<string, boolean> = {};
    days.forEach((d) =>
      d.tasks.forEach((t) => {
        if (t.completed) completedMap[t.id] = true;
      })
    );
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      startDate,
      completedMap,
      notes,
      bookmarks,
    };
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(buildPayload(), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `180-day-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildPayload(), null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus({ kind: 'err', msg: 'Clipboard blocked — use the download button instead.' });
    }
  };

  const handleRestore = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) {
        setStatus({ kind: 'err', msg: 'That does not look like a valid backup file.' });
        return;
      }
      onImportState({
        completedMap: parsed.completedMap ?? {},
        notes: parsed.notes ?? {},
        bookmarks: parsed.bookmarks ?? {},
        startDate: parsed.startDate,
      });
      setStatus({ kind: 'ok', msg: 'Progress restored successfully.' });
      window.setTimeout(() => {
        setStatus(null);
        onClose();
      }, 900);
    } catch {
      setStatus({ kind: 'err', msg: 'Could not parse that JSON — please check the file.' });
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === 'string') handleRestore(content);
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="surface-raised w-full max-w-lg overflow-hidden">
        <div className="grad-brand relative flex items-start justify-between px-5 py-4">
          <div className="pointer-events-none absolute inset-0 shimmer opacity-30" />
          <div className="relative flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-sm font-extrabold text-white">
                Backup &amp; restore progress
              </h2>
              <p className="text-[10.5px] font-medium text-blue-50/90">
                Portable JSON sync for GitHub Pages &amp; multiple devices
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="relative rounded-xl bg-white/15 p-1.5 text-white/85 transition hover:bg-white/25 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              1 · Export
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
              Save every tick, daily log and flagged day into a single portable file.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="grad-brand inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold text-white transition hover:brightness-110 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Download .json
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy JSON
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              2 · Restore
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
              Upload a backup file or paste its contents below. This overwrites current ticks.
            </p>

            <label className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50">
              <Upload className="h-3.5 w-3.5 text-blue-600" />
              Upload backup file
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleUpload}
                className="hidden"
              />
            </label>

            <textarea
              rows={3}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='…or paste backup JSON here, e.g. {"completedMap":{"d1_t1":true}}'
              className="num mt-3 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-[10.5px] text-slate-800 focus:border-blue-500 focus:outline-none"
            />

            {importText.trim() && (
              <button
                type="button"
                onClick={() => handleRestore(importText)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-[11px] font-bold text-white transition hover:bg-slate-800 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore from pasted JSON
              </button>
            )}

            {status && (
              <p
                className={`mt-2 text-[11px] font-bold ${
                  status.kind === 'ok' ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {status.msg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
  completedTasksCount: number;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
  completedTasksCount,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="surface-raised w-full max-w-md p-6">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-extrabold text-slate-900">
              Reset all 180-day progress?
            </h2>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-600">
              This clears{' '}
              <strong className="num text-slate-900">{completedTasksCount}</strong> completed
              tasks plus every daily log and flag stored in this browser&apos;s{' '}
              <code className="num rounded bg-slate-100 px-1 py-0.5 text-[10.5px]">localStorage</code>
              . Download a JSON backup first if you want to keep it.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
            className="rounded-xl bg-rose-600 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-rose-700 cursor-pointer"
          >
            Yes, reset everything
          </button>
        </div>
      </div>
    </div>
  );
};
