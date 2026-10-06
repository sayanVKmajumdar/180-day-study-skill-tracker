import React from 'react';
import {
  BookOpenCheck,
  CalendarCheck,
  Database,
  Grid3x3,
  RotateCcw,
  Sigma,
} from 'lucide-react';
import { PHASE_BLOCKS } from '../data/trackerGenerator';
import { TelemetryStats } from '../utils/storage';

interface TopCommandHeaderProps {
  selectedPhase: number | 'all';
  onSelectPhase: (phase: number | 'all') => void;
  telemetry: TelemetryStats;
  onJumpToDay: (day: number) => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  onOpenCurriculum: () => void;
  onOpenBackup: () => void;
  onOpenResetConfirm: () => void;
}

export const TopCommandHeader: React.FC<TopCommandHeaderProps> = ({
  selectedPhase,
  onSelectPhase,
  telemetry,
  onJumpToDay,
  showHeatmap,
  onToggleHeatmap,
  onOpenCurriculum,
  onOpenBackup,
  onOpenResetConfirm,
}) => {
  const utilityBtn =
    'inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900 cursor-pointer';

  return (
    <header className="surface-glass sticky top-0 z-40">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        {/* Row 1 — Brand + utilities */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <div className="grad-brand flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg shadow-blue-600/20">
              <Sigma className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-[17px] font-extrabold leading-tight text-slate-900 sm:text-xl">
                180-Day Study &amp; Skill Tracker
              </h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-medium text-slate-500">
                <span className="hidden sm:inline">
                  Math · English · GK · Data Science
                </span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="num font-semibold text-slate-600">
                  5.5h/day · 990h
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                  Auto-saved
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onJumpToDay(telemetry.currentTargetDay)}
              className="grad-brand num inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold text-white shadow-md shadow-blue-600/20 transition hover:brightness-110 active:scale-[0.98] cursor-pointer"
              title="Jump to the next incomplete day"
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              Target Day {String(telemetry.currentTargetDay).padStart(3, '0')}
            </button>

            <button
              type="button"
              onClick={onToggleHeatmap}
              className={`${utilityBtn} ${
                showHeatmap
                  ? '!border-blue-300 !bg-blue-50 !text-blue-700'
                  : ''
              }`}
              title="Toggle the 180-day consistency matrix"
            >
              <Grid3x3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Matrix</span>
            </button>

            <button
              type="button"
              onClick={onOpenCurriculum}
              className={utilityBtn}
              title="Full syllabus blueprint"
            >
              <BookOpenCheck className="h-3.5 w-3.5 text-teal-600" />
              <span className="hidden md:inline">Syllabus</span>
            </button>

            <button
              type="button"
              onClick={onOpenBackup}
              className={utilityBtn}
              title="Export or restore progress"
            >
              <Database className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden md:inline">Backup</span>
            </button>

            <button
              type="button"
              onClick={onOpenResetConfirm}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/80 px-2.5 py-2 text-[11px] font-semibold text-slate-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
              title="Reset all progress"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="sr-only">Reset progress</span>
            </button>
          </div>
        </div>

        {/* Row 2 — Phase rail */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-3">
          <button
            type="button"
            onClick={() => onSelectPhase('all')}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold transition cursor-pointer ${
              selectedPhase === 'all'
                ? 'border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/15'
                : 'border-slate-200/90 bg-white/70 text-slate-600 hover:bg-white'
            }`}
          >
            All 180 Days
            <span
              className={`num rounded-md px-1.5 py-0.5 text-[10px] ${
                selectedPhase === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {telemetry.overallPercent}%
            </span>
          </button>

          <div className="h-5 w-px shrink-0 bg-slate-200" />

          {PHASE_BLOCKS.map((phase) => {
            const stat = telemetry.phaseProgress[phase.id] ?? {
              percent: 0,
              completedDays: 0,
            };
            const isSelected = selectedPhase === phase.id;
            const isDone = stat.percent === 100;

            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => onSelectPhase(phase.id)}
                title={`${phase.code} — ${phase.subtitle} · ${stat.percent}% complete`}
                className={`group flex shrink-0 flex-col gap-1.5 rounded-xl border px-3 py-1.5 text-left transition cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/80 shadow-md shadow-blue-600/10'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                    : 'border-slate-200/90 bg-white/70 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`num text-[10px] font-extrabold ${
                      isSelected
                        ? 'text-blue-700'
                        : isDone
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {phase.code}
                  </span>
                  <span
                    className={`text-[11px] font-bold ${
                      isSelected ? 'text-blue-900' : 'text-slate-700'
                    }`}
                  >
                    {phase.label}
                  </span>
                  <span
                    className={`num text-[10px] font-bold ${
                      isSelected
                        ? 'text-blue-700'
                        : isDone
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {stat.percent}%
                  </span>
                </div>

                <div className="hidden max-w-[190px] truncate text-[10px] font-medium text-slate-500 sm:block">
                  {phase.subtitle}
                </div>

                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone ? 'bg-emerald-500' : isSelected ? 'bg-blue-600' : 'bg-teal-500'
                    }`}
                    style={{ width: `${stat.percent}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
