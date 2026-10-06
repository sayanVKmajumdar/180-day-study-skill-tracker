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
import { getProjectedDateLabel } from '../utils/storage';

interface CompactDayRowProps {
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

export const CompactDayRow: React.FC<CompactDayRowProps> = React.memo(
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
    const dateLabel = getProjectedDateLabel(dayItem.day, startDate);
    const gkSubject = getGkSubjectForDay(dayItem.day);

    return (
      <div
        id={`day-card-${dayItem.day}`}
        className={`surface flex flex-col gap-2.5 p-3 lg:flex-row lg:items-center ${
          isAllDone
            ? '!border-emerald-300 bg-emerald-50/30'
            : isCurrentTarget
            ? '!border-blue-400 bg-blue-50/25'
            : isFocused
            ? '!border-slate-400'
            : ''
        }`}
      >
        {/* Day badge */}
        <div className="flex items-center justify-between gap-2 lg:w-[132px] lg:shrink-0 lg:justify-start">
          <div className="flex items-center gap-2">
            <span
              className={`num rounded-lg px-2 py-1 text-[11px] font-extrabold text-white ${
                isAllDone ? 'bg-emerald-600' : isCurrentTarget ? 'grad-brand' : 'bg-slate-900'
              }`}
            >
              D{String(dayItem.day).padStart(3, '0')}
            </span>
            <div className="min-w-0">
              {dateLabel && (
                <div className="num text-[10px] font-bold text-slate-500">{dateLabel}</div>
              )}
              <div className="truncate text-[9px] font-semibold text-slate-400">
                {gkSubject}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleAllDayTasks(dayItem.day, !isAllDone)}
            className={`num inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold lg:hidden cursor-pointer ${
              isAllDone
                ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <CheckCheck className="h-3 w-3" />
            {completedCount}/5
          </button>
        </div>

        {/* Task pills */}
        <div className="grid flex-1 grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-5">
          {dayItem.tasks.map((task) => {
            const meta = parseTaskMeta(task);
            const style = SUBJECT_STYLES[meta.subjectKey];
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onToggleTask(dayItem.day, task.id)}
                title={task.title}
                className={`flex items-start gap-1.5 rounded-lg border px-2 py-1.5 text-left transition cursor-pointer ${
                  task.completed
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border-2 ${
                    task.completed
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {task.completed && <Check className="h-2 w-2 stroke-[4]" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1">
                    <span
                      className={`rounded border px-1 py-px text-[8px] font-extrabold ${style.chip} ${style.chipText}`}
                    >
                      {style.shortName}
                    </span>
                    {meta.isRapidRevision && (
                      <Zap className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                    )}
                  </span>
                  <span
                    className={`mt-0.5 block text-[10.5px] font-medium leading-snug ${
                      task.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                    }`}
                  >
                    {meta.topic}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="hidden items-center gap-1 lg:flex lg:shrink-0">
          {hasNote && (
            <button
              type="button"
              onClick={() => onFocusDay(dayItem.day)}
              className="rounded-md p-1.5 text-teal-600 transition hover:bg-teal-50 cursor-pointer"
              title="Open notes"
            >
              <ClipboardList className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onToggleBookmark(dayItem.day)}
            className={`rounded-md p-1.5 transition cursor-pointer ${
              isBookmarked ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-300 hover:text-slate-500'
            }`}
            title="Flag this day"
          >
            <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => onFocusDay(dayItem.day)}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            title="Open in mission deck"
          >
            <Crosshair className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onToggleAllDayTasks(dayItem.day, !isAllDone)}
            className={`num inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-extrabold transition cursor-pointer ${
              isAllDone
                ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCheck className="h-3 w-3" />
            {completedCount}/5
          </button>
        </div>
      </div>
    );
  }
);

CompactDayRow.displayName = 'CompactDayRow';
