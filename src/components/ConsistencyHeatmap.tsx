import React from 'react';
import {
  DayTrackerItem,
  DS_ROADMAP,
  getGkSubjectForDay,
  GK_SEQUENCE,
  PHASE_BLOCKS,
  STUDY_TRACKS,
  StudyTrack,
} from '../data/trackerGenerator';
import { getProjectedDateLabel } from '../utils/storage';

interface ConsistencyHeatmapProps {
  studyTrack: StudyTrack;
  days: DayTrackerItem[];
  focusedDay: number;
  currentTargetDay: number;
  startDate: string;
  bookmarks: Record<number, boolean>;
  onSelectDay: (day: number) => void;
}

const LEVEL_STYLES = [
  'bg-slate-100 border-slate-200 text-slate-400',
  'bg-sky-100 border-sky-200 text-sky-800',
  'bg-sky-200 border-sky-300 text-sky-900',
  'bg-blue-400 border-blue-500 text-white',
  'bg-blue-600 border-blue-700 text-white',
  'bg-emerald-500 border-emerald-600 text-white',
];

const LEVEL_LABELS = ['0%', '20%', '40%', '60%', '80%', '100%'];

export const ConsistencyHeatmap: React.FC<ConsistencyHeatmapProps> = ({
  studyTrack,
  days,
  focusedDay,
  currentTargetDay,
  startDate,
  bookmarks,
  onSelectDay,
}) => {
  const phaseTotals = PHASE_BLOCKS.map((p) => {
    const slice = days.slice(p.startDay - 1, p.endDay);
    const done = slice.filter((d) => d.tasks.every((t) => t.completed)).length;
    return { phase: p, done, total: slice.length };
  });

  return (
    <section aria-label="180-day consistency matrix" className="surface p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-display text-sm font-extrabold text-slate-900">
            180-Day Consistency Matrix · {STUDY_TRACKS[studyTrack].label}
          </h2>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">
            Six 30-day phases · each cell shows completion within this study track
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400">Less</span>
          <div className="flex gap-1">
            {LEVEL_STYLES.map((cls, i) => (
              <span
                key={i}
                className={`h-4 w-4 rounded border ${cls}`}
                title={`${LEVEL_LABELS[i]} of this track's daily tasks completed`}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-slate-400">More</span>
        </div>
      </div>

      {/* Study module legend rail */}
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {studyTrack === 'cgl'
          ? GK_SEQUENCE.map((g) => (
              <div
                key={g.subject}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1"
                title={`${g.subject} — ${g.status}`}
              >
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                <span className="text-[10px] font-bold text-slate-700">{g.subject}</span>
                <span className="num text-[9.5px] font-semibold text-slate-400">{g.range}</span>
              </div>
            ))
          : DS_ROADMAP.map((module) => (
              <div
                key={module.skill}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50/70 px-2.5 py-1"
                title={`${module.skill} — ${module.detail}`}
              >
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <span className="text-[10px] font-bold text-slate-700">{module.skill}</span>
                <span className="num text-[9.5px] font-semibold text-slate-400">{module.range}</span>
              </div>
            ))}
      </div>

      <div className="mt-4 space-y-2.5 overflow-x-auto pb-1">
        {phaseTotals.map(({ phase, done, total }) => {
          const phaseDays = days.slice(phase.startDay - 1, phase.endDay);

          return (
            <div key={phase.id} className="flex min-w-[680px] items-center gap-3">
              <div className="w-[92px] shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="num rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                    {phase.code}
                  </span>
                  <span className="num text-[10px] font-extrabold text-slate-600">
                    D{phase.startDay}–{phase.endDay}
                  </span>
                </div>
                <div className="num mt-0.5 text-[9.5px] font-semibold text-emerald-600">
                  {done}/{total} days clear
                </div>
              </div>

              <div
                className="grid flex-1 gap-[3px]"
                style={{ gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}
              >
                {phaseDays.map((d) => {
                  const doneCount = d.tasks.filter((t) => t.completed).length;
                  const level = Math.round((doneCount / Math.max(d.tasks.length, 1)) * 5);
                  const isFocused = d.day === focusedDay;
                  const isTarget = d.day === currentTargetDay;
                  const flagged = Boolean(bookmarks[d.day]);
                  const dateStr = getProjectedDateLabel(d.day, startDate);

                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => onSelectDay(d.day)}
                      title={`Day ${d.day}${dateStr ? ` · ${dateStr}` : ''}${studyTrack === 'cgl' ? ` · GK: ${getGkSubjectForDay(d.day)}` : ''} · ${doneCount}/${d.tasks.length} ${STUDY_TRACKS[studyTrack].label} tasks`}
                      className={`num relative flex h-[22px] w-full items-center justify-center rounded border text-[8.5px] font-extrabold transition hover:scale-110 hover:z-20 cursor-pointer ${
                        LEVEL_STYLES[level]
                      } ${
                        isFocused
                          ? 'ring-2 ring-slate-900 ring-offset-1 z-10'
                          : isTarget
                          ? 'ring-2 ring-blue-500 ring-offset-1'
                          : ''
                      }`}
                    >
                      {d.day}
                      {flagged && (
                        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 ring-1 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
