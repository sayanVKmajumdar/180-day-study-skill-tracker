import React from 'react';
import {
  CalendarDays,
  Clock4,
  Flame,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  HOURS_PER_DAY,
  PHASE_BLOCKS,
  SUBJECT_ORDER,
  SUBJECT_STYLES,
  TOTAL_DAYS,
  TOTAL_HOURS,
  TOTAL_TASKS,
} from '../data/trackerGenerator';
import { TelemetryStats } from '../utils/storage';

interface OverviewHeroProps {
  telemetry: TelemetryStats;
  startDate: string;
  onChangeStartDate: (value: string) => void;
  onJumpToTarget: () => void;
}

const RING_RADIUS = 58;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const OverviewHero: React.FC<OverviewHeroProps> = ({
  telemetry,
  startDate,
  onChangeStartDate,
  onJumpToTarget,
}) => {
  const ringOffset = RING_CIRCUMFERENCE * (1 - telemetry.overallPercent / 100);
  const activePhase =
    PHASE_BLOCKS.find((p) => p.id === Math.ceil(telemetry.currentTargetDay / 30)) ??
    PHASE_BLOCKS[0];

  const tiles = [
    {
      icon: <Target className="h-4 w-4" />,
      label: 'Days Conquered',
      value: `${telemetry.daysCompleted}`,
      sub: `of ${TOTAL_DAYS} days`,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      extra: `${telemetry.daysInProgress} in progress · ${telemetry.daysUntouched} left`,
    },
    {
      icon: <Clock4 className="h-4 w-4" />,
      label: 'Hours Logged',
      value: telemetry.loggedHours.toFixed(1),
      sub: `of ${TOTAL_HOURS}h total`,
      accent: 'text-sky-600 bg-sky-50 border-sky-100',
      extra: `${telemetry.remainingHours.toFixed(1)}h remaining`,
    },
    {
      icon: <Flame className="h-4 w-4" />,
      label: 'Study Streak',
      value: `${telemetry.activeStreak}d`,
      sub: `best ${telemetry.bestStreak}d`,
      accent: 'text-amber-600 bg-amber-50 border-amber-100',
      extra: `${HOURS_PER_DAY}h committed / day`,
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: 'Projected Finish',
      value: telemetry.etaDateLabel.split(' (')[0],
      sub: telemetry.etaDateLabel.includes('(')
        ? telemetry.etaDateLabel.match(/\(([^)]+)\)/)?.[1] ?? ''
        : '',
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      extra: `${telemetry.remainingTasks} tasks to go`,
    },
  ];

  return (
    <section
      aria-label="Progress overview"
      className="surface-raised overflow-hidden"
    >
      {/* Gradient top band */}
      <div className="grad-brand relative px-5 py-4 sm:px-7">
        <div className="pointer-events-none absolute inset-0 shimmer opacity-40" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="num rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white ring-1 ring-inset ring-white/30">
                {activePhase.code}
              </span>
              <h2 className="font-display text-base font-extrabold text-white sm:text-lg">
                {activePhase.subtitle}
              </h2>
            </div>
            <p className="mt-1 text-[11px] font-medium text-blue-50/90 sm:text-xs">
              {activePhase.label} · Math 1h · English 1h · GK New 1h · GK Rev 30m ·
              Data Science 2h
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-1.5 ring-1 ring-inset ring-white/25">
              <CalendarDays className="h-3.5 w-3.5 text-white/85" />
              <span className="text-[11px] font-semibold text-white/90">
                Day 1 date
              </span>
              <input
                type="date"
                aria-label="Start date for Day 1"
                value={startDate}
                onChange={(e) => onChangeStartDate(e.target.value)}
                className="num rounded-md border border-white/25 bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={onJumpToTarget}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-[11px] font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 active:scale-[0.98] cursor-pointer"
            >
              <Target className="h-3.5 w-3.5" />
              Jump to Day {telemetry.currentTargetDay}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-12">
        {/* Progress ring */}
        <div className="flex items-center gap-5 lg:col-span-4">
          <div className="relative h-[148px] w-[148px] shrink-0">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="55%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
              </defs>
              <circle
                cx="70"
                cy="70"
                r={RING_RADIUS}
                fill="none"
                stroke="#E8EEF6"
                strokeWidth="12"
              />
              <circle
                cx="70"
                cy="70"
                r={RING_RADIUS}
                fill="none"
                stroke="url(#ringGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
                style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.22,1,0.36,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="num text-[26px] font-extrabold leading-none text-slate-900">
                {telemetry.overallPercent}
                <span className="text-base">%</span>
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Complete
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="font-display text-sm font-bold text-slate-900">
              Overall Progress
            </h3>
            <p className="num mt-1 text-xs text-slate-500">
              <span className="font-bold text-slate-900">
                {telemetry.completedTasks}
              </span>{' '}
              / {TOTAL_TASKS} tasks logged
            </p>
            <p className="num mt-0.5 text-xs text-slate-500">
              <span className="font-bold text-slate-900">
                {telemetry.loggedHours.toFixed(0)}h
              </span>{' '}
              / {TOTAL_HOURS}h studied
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              {PHASE_BLOCKS.map((p) => {
                const pct = telemetry.phaseProgress[p.id]?.percent ?? 0;
                return (
                  <div
                    key={p.id}
                    className="group relative h-8 w-8"
                    title={`${p.code} ${p.label}: ${pct}%`}
                  >
                    <div className="absolute inset-x-0 bottom-0 h-full overflow-hidden rounded-md bg-slate-100">
                      <div
                        className="grad-brand absolute bottom-0 w-full transition-all duration-500"
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span
                      className={`num absolute inset-0 flex items-center justify-center text-[9px] font-bold ${
                        pct > 55 ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      {p.code}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] font-medium text-slate-400">
              Phase fill = % of that 30-day block logged
            </p>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-3 lg:col-span-8 xl:grid-cols-4">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="lift flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white/85 p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {tile.label}
                </span>
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${tile.accent}`}
                >
                  {tile.icon}
                </span>
              </div>
              <div className="mt-2">
                <div className="num truncate text-xl font-extrabold text-slate-900">
                  {tile.value}
                </div>
                <div className="num text-[11px] font-medium text-slate-500">
                  {tile.sub}
                </div>
              </div>
              <p className="mt-2 border-t border-slate-100 pt-1.5 text-[10px] font-medium text-slate-400">
                {tile.extra}
              </p>
            </div>
          ))}
        </div>

        {/* Subject load meters */}
        <div className="lg:col-span-12">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Subject Load &amp; Coverage
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                <Zap className="h-3 w-3 text-amber-500" />
                <span>⚡Rev = already-read topic, compressed to rapid revision</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
              {SUBJECT_ORDER.map((key) => {
                const style = SUBJECT_STYLES[key];
                const stat = telemetry.subjectStats[key];
                return (
                  <div
                    key={key}
                    className="rounded-lg border border-slate-200/80 bg-white p-3"
                    title={`${style.name}: ${stat.logged.toFixed(1)}h of ${stat.total}h`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${style.solidBg}`} />
                        <span className="truncate text-[11px] font-bold text-slate-700">
                          {style.shortName}
                        </span>
                      </div>
                      <span className="num text-[11px] font-bold text-slate-900">
                        {stat.percent}%
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${style.barColor} transition-all duration-500`}
                        style={{ width: `${Math.max(stat.percent, 1)}%` }}
                      />
                    </div>

                    <div className="num mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{stat.logged.toFixed(1)}h logged</span>
                      <span>{stat.completedCount}/{stat.totalCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
