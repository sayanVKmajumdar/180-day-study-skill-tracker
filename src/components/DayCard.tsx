import React from 'react';
import {
  Bookmark,
  Check,
  CheckCheck,
  ClipboardList,
  Crosshair,
  Zap,
} from 'lucide-react';
import {
  DayTrackerItem,
  getGkSubjectForDay,
  parseTaskMeta,
  SUBJECT_STYLES,
} from '../data/trackerGenerator';
import { getProjectedDateLabel, getProjectedWeekday } from '../utils/storage';

interface DayCardProps {
  dayItem: DayTrackerItem;
  isCurrentTarget: boolean;
  isFocused: boolean;
  startDate: string;
  hasNote: boolean;
  isBookmarked: boolean;
  onToggleTask: (day: number, taskId: string) => void;
  onToggleAllDayTasks: (day: number, markComplete: boolean) => void;
  onFocusDay: (day: number) => void;
  onToggleBookmark: (day: number) => void;
}

export const DayCard: React.FC<DayCardProps> = React.memo(
  ({
    dayItem,
    isCurrentTarget,
    isFocused,
    startDate,
    hasNote,
    isBookmarked,
    onToggleTask,
    onToggleAllDayTasks,
    onFocusDay,
    onToggleBookmark,
  }) => {
    const completedCount = dayItem.tasks.filter((t) => t.completed).length;
    const isAllDone = completedCount === dayItem.tasks.length;
    const isInProgress = completedCount > 0 && !isAllDone;
    const dateLabel = getProjectedDateLabel(dayItem.day, startDate);
    const weekday = getProjectedWeekday(dayItem.day, startDate);
    const hasGkFocus = dayItem.tasks.some((task) => {
      const { subjectKey } = parseTaskMeta(task);
      return subjectKey === 'gkNew' || subjectKey === 'gkRev';
    });
    const gkSubject = hasGkFocus ? getGkSubjectForDay(dayItem.day) : null;

    const headerTone = isAllDone
      ? 'bg-emerald-50/70 border-emerald-100'
      : isCurrentTarget
      ? 'bg-blue-50/70 border-blue-100'
      : 'bg-slate-50/60 border-slate-100';

    return (
      <article
        id={`day-card-${dayItem.day}`}
        className={`surface lift group relative flex flex-col overflow-hidden ${
          isAllDone
            ? '!border-emerald-300'
            : isCurrentTarget
            ? '!border-blue-400 ring-2 ring-blue-500/10'
            : isFocused
            ? '!border-slate-400'
            : isInProgress
            ? '!border-blue-200'
            : ''
        }`}
      >
        {/* One progress segment per task in this study track */}
        <div className="flex gap-[3px] bg-slate-100 p-[3px]">
          {dayItem.tasks.map((t) => {
            const meta = parseTaskMeta(t);
            return (
              <div
                key={t.id}
                className={`h-[4px] flex-1 rounded-full transition-all duration-500 ${
                  t.completed ? SUBJECT_STYLES[meta.subjectKey].barColor : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>

        {/* Header */}
        <div className={`flex items-start justify-between gap-2 border-b px-3.5 py-2.5 ${headerTone}`}>
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`num rounded-lg px-2 py-1 text-[11px] font-extrabold text-white ${
                isAllDone
                  ? 'bg-emerald-600'
                  : isCurrentTarget
                  ? 'grad-brand'
                  : 'bg-slate-900'
              }`}
            >
              D{String(dayItem.day).padStart(3, '0')}
            </span>
            <div className="min-w-0">
              {dateLabel && (
                <div className="num text-[10px] font-bold text-slate-500">
                  {weekday}, {dateLabel}
                </div>
              )}
              {gkSubject && (
                <div className="truncate text-[10px] font-semibold text-slate-400">
                  GK: {gkSubject}
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {isCurrentTarget && !isAllDone && (
              <span className="mr-0.5 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                TARGET
              </span>
            )}
            {hasNote && (
              <button
                type="button"
                onClick={() => onFocusDay(dayItem.day)}
                className="rounded-md p-1 text-teal-600 transition hover:bg-teal-50 cursor-pointer"
                title="Has notes — open in mission deck"
              >
                <ClipboardList className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onToggleBookmark(dayItem.day)}
              className={`rounded-md p-1 transition cursor-pointer ${
                isBookmarked
                  ? 'text-amber-500 hover:bg-amber-50'
                  : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'
              }`}
              title={isBookmarked ? 'Flagged for revision' : 'Flag this day'}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => onFocusDay(dayItem.day)}
              className={`rounded-md p-1 transition cursor-pointer ${
                isFocused
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              }`}
              title="Open in mission deck"
            >
              <Crosshair className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onToggleAllDayTasks(dayItem.day, !isAllDone)}
              className={`num ml-0.5 inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold transition cursor-pointer ${
                isAllDone
                  ? 'border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : isInProgress
                  ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
              }`}
              title={isAllDone ? 'Uncheck all' : `Mark all ${dayItem.tasks.length} tasks complete`}
            >
              <CheckCheck className="h-3 w-3" />
              {completedCount}/{dayItem.tasks.length}
            </button>
          </div>
        </div>

        {/* Tasks */}
        <div className="divide-y divide-slate-100 px-2.5 py-1">
          {dayItem.tasks.map((task) => {
            const meta = parseTaskMeta(task);
            const style = SUBJECT_STYLES[meta.subjectKey];

            return (
              <div
                key={task.id}
                onClick={() => onToggleTask(dayItem.day, task.id)}
                role="checkbox"
                aria-checked={task.completed}
                aria-label={task.title}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onToggleTask(dayItem.day, task.id);
                  }
                }}
                className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-2 transition select-none hover:bg-slate-50"
              >
                <div
                  className={`mt-0.5 flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-all ${
                    task.completed
                      ? 'animate-check border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white group-hover:border-blue-500'
                  }`}
                >
                  {task.completed && <Check className="h-2.5 w-2.5 stroke-[3.5]" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1">
                    <span
                      className={`rounded border px-1 py-px text-[9px] font-extrabold ${style.chip} ${style.chipText}`}
                    >
                      {style.shortName}
                    </span>
                    <span className="num rounded bg-slate-100 px-1 py-px text-[9px] font-bold text-slate-500">
                      {meta.durationLabel}
                    </span>
                    {meta.isRapidRevision && (
                      <span className="inline-flex items-center gap-0.5 rounded border border-amber-200 bg-amber-50 px-1 py-px text-[8px] font-extrabold text-amber-700">
                        <Zap className="h-2 w-2 fill-amber-500 text-amber-500" />
                        REV
                      </span>
                    )}
                    {meta.isMockBlock && (
                      <span className="rounded border border-fuchsia-200 bg-fuchsia-50 px-1 py-px text-[8px] font-extrabold text-fuchsia-700">
                        MOCK
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-0.5 text-[11.5px] font-medium leading-snug transition ${
                      task.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                    }`}
                  >
                    {meta.topic}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    );
  }
);

DayCard.displayName = 'DayCard';
