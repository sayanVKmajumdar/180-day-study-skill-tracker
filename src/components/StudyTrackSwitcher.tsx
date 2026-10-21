import React from 'react';
import { BarChart3, BookOpenCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { STUDY_TRACKS, StudyTrack } from '../data/trackerGenerator';
import { TelemetryStats } from '../utils/storage';

interface StudyTrackSwitcherProps {
  selectedTrack: StudyTrack;
  onSelectTrack: (track: StudyTrack) => void;
  cglTelemetry: TelemetryStats;
  dataAnalysisTelemetry: TelemetryStats;
}

const TRACK_CARDS = [
  {
    id: 'cgl' as const,
    icon: BookOpenCheck,
    iconTone: 'bg-blue-100 text-blue-700',
    activeTone: 'border-blue-400 ring-2 ring-blue-500/10',
    barTone: 'bg-blue-600',
  },
  {
    id: 'dataAnalysis' as const,
    icon: BarChart3,
    iconTone: 'bg-sky-100 text-sky-700',
    activeTone: 'border-sky-400 ring-2 ring-sky-500/10',
    barTone: 'bg-sky-500',
  },
];

export const StudyTrackSwitcher: React.FC<StudyTrackSwitcherProps> = ({
  selectedTrack,
  onSelectTrack,
  cglTelemetry,
  dataAnalysisTelemetry,
}) => {
  const telemetryByTrack = {
    cgl: cglTelemetry,
    dataAnalysis: dataAnalysisTelemetry,
  };

  return (
    <section aria-label="Choose a study track" className="space-y-2">
      <div className="flex items-end justify-between gap-2 px-1">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
            Separate study plans
          </p>
          <h2 className="mt-0.5 font-display text-sm font-extrabold text-slate-900">
            Choose what you&apos;re studying
          </h2>
        </div>
        <span className="hidden text-[10px] font-medium text-slate-500 sm:inline">
          Progress is tracked independently for each plan
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {TRACK_CARDS.map((card) => {
          const config = STUDY_TRACKS[card.id];
          const telemetry = telemetryByTrack[card.id];
          const active = selectedTrack === card.id;
          const Icon = card.icon;

          return (
            <button
              key={card.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectTrack(card.id)}
              className={`group surface flex w-full flex-col gap-3 border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md cursor-pointer ${
                active ? card.activeTone : 'border-slate-200/90'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${card.iconTone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="font-display text-sm font-extrabold text-slate-900">
                        {config.label}
                      </span>
                      {active && (
                        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                          Selected
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[10.5px] font-medium text-slate-500">
                      {config.description}
                    </span>
                  </span>
                </div>
                <ChevronRight className={`mt-1 h-4 w-4 shrink-0 transition ${active ? 'text-slate-700' : 'text-slate-300 group-hover:text-slate-500'}`} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="num text-[10px] font-bold text-slate-600">
                  {config.dailyHours}h/day <span className="text-slate-300">·</span> {config.dailyTasks} {config.dailyTasks === 1 ? 'block' : 'blocks'}/day
                </span>
                <span className="num inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {telemetry.daysCompleted}/180 days cleared
                </span>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-slate-500">Track progress</span>
                  <span className="num font-extrabold text-slate-800">
                    {telemetry.overallPercent}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${card.barTone}`}
                    style={{ width: `${telemetry.overallPercent}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
