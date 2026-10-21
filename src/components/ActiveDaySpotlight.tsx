import React, { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Flag,
  Pause,
  Play,
  RotateCcw,
  Timer as TimerIcon,
  Zap,
} from 'lucide-react';
import {
  DayTrackerItem,
  getGkSubjectForDay,
  parseTaskMeta,
  PHASE_BLOCKS,
  SUBJECT_STYLES,
  StudyTrack,
} from '../data/trackerGenerator';
import { getProjectedDateLabel, getProjectedWeekday } from '../utils/storage';

interface ActiveDaySpotlightProps {
  studyTrack: StudyTrack;
  dayItem: DayTrackerItem;
  isCurrentTarget: boolean;
  startDate: string;
  note: string;
  isBookmarked: boolean;
  onToggleTask: (day: number, taskId: string) => void;
  onToggleAllDayTasks: (day: number, markComplete: boolean) => void;
  onChangeNote: (day: number, noteText: string) => void;
  onToggleBookmark: (day: number) => void;
  onNavigateDay: (newDay: number) => void;
}

const PRESETS = {
  cgl: [
    { minutes: 25, label: '25m Pomodoro' },
    { minutes: 30, label: '30m GK Rev' },
    { minutes: 60, label: '1h CGL block' },
  ],
  dataAnalysis: [
    { minutes: 25, label: '25m Pomodoro' },
    { minutes: 60, label: '1h focus' },
    { minutes: 120, label: '2h Data Analysis' },
  ],
};

export const ActiveDaySpotlight: React.FC<ActiveDaySpotlightProps> = ({
  studyTrack,
  dayItem,
  isCurrentTarget,
  startDate,
  note,
  isBookmarked,
  onToggleTask,
  onToggleAllDayTasks,
  onChangeNote,
  onToggleBookmark,
  onNavigateDay,
}) => {
  const completedCount = dayItem.tasks.filter((t) => t.completed).length;
  const allCompleted = completedCount === dayItem.tasks.length;
  const phase = PHASE_BLOCKS.find((p) => p.id === Math.ceil(dayItem.day / 30)) ?? PHASE_BLOCKS[0];
  const phaseSubtitle = studyTrack === 'cgl' ? phase.cglSubtitle : phase.dataAnalysisSubtitle;
  const dateLabel = getProjectedDateLabel(dayItem.day, startDate);
  const weekday = getProjectedWeekday(dayItem.day, startDate);
  const hasGkFocus = dayItem.tasks.some((task) => {
    const { subjectKey } = parseTaskMeta(task);
    return subjectKey === 'gkNew' || subjectKey === 'gkRev';
  });
  const gkSubject = hasGkFocus ? getGkSubjectForDay(dayItem.day) : null;

  const dailyHours = useMemo(
    () => dayItem.tasks.reduce((sum, task) => sum + parseTaskMeta(task).durationHours, 0),
    [dayItem]
  );

  const loggedHours = useMemo(
    () =>
      dayItem.tasks.reduce(
        (sum, t) => (t.completed ? sum + parseTaskMeta(t).durationHours : sum),
        0
      ),
    [dayItem]
  );

  /* ---------------- Focus timer ---------------- */
  const [timerTaskId, setTimerTaskId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [modeLabel, setModeLabel] = useState('25m Pomodoro');

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const startTaskTimer = (taskId: string, hours: number, label: string) => {
    const secs = Math.max(60, Math.round(hours * 3600));
    setTimerTaskId(taskId);
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setModeLabel(label);
    setRunning(true);
  };

  const applyPreset = (minutes: number, label: string) => {
    setTimerTaskId(null);
    setTotalSeconds(minutes * 60);
    setSecondsLeft(minutes * 60);
    setModeLabel(label);
    setRunning(false);
  };

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const timerPct = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  return (
    <section
      aria-label={`Mission deck for day ${dayItem.day}`}
      className={`surface-raised overflow-hidden transition-colors ${
        allCompleted ? '!border-emerald-300' : isCurrentTarget ? '!border-blue-400' : ''
      }`}
    >
      {/* Header band */}
      <div className="mission-header relative px-5 py-4 sm:px-6">
        <div className="pointer-events-none absolute inset-0 shimmer opacity-25" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Day stepper */}
            <div className="flex items-center gap-1 rounded-xl bg-white/12 p-1 ring-1 ring-inset ring-white/20">
              <button
                type="button"
                disabled={dayItem.day <= 1}
                onClick={() => onNavigateDay(dayItem.day - 1)}
                className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Previous day"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="px-1 text-center">
                <div className="num text-lg font-extrabold leading-none text-white">
                  {String(dayItem.day).padStart(3, '0')}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/60">
                  Day
                </div>
              </div>
              <button
                type="button"
                disabled={dayItem.day >= 180}
                onClick={() => onNavigateDay(dayItem.day + 1)}
                className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Next day"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-sm font-extrabold text-white sm:text-base">
                  {phase.code} · {phaseSubtitle}
                </h2>
                {isCurrentTarget && !allCompleted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                    <Flag className="h-2.5 w-2.5" />
                    ACTIVE TARGET
                  </span>
                )}
                {allCompleted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                    DAY CLEARED
                  </span>
                )}
              </div>
              <p className="num mt-0.5 text-[11px] font-medium text-white/70">
                {weekday && dateLabel ? `${weekday}, ${dateLabel}` : 'Schedule date'}
                {gkSubject ? ` · GK focus: ${gkSubject}` : ' · Data Analysis daily block'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleBookmark(dayItem.day)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                  : 'bg-white/12 text-white/85 ring-1 ring-inset ring-white/20 hover:bg-white/20'
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-950' : ''}`} />
              <span className="hidden sm:inline">
                {isBookmarked ? 'Flagged' : 'Flag day'}
              </span>
            </button>

            <div className="num flex items-center gap-2 rounded-xl bg-white/12 px-3 py-2 text-[11px] font-bold text-white ring-1 ring-inset ring-white/20">
              <span>
                {completedCount}/{dayItem.tasks.length} · {loggedHours.toFixed(1)}h/{dailyHours.toFixed(1)}h
              </span>
            </div>

            <button
              type="button"
              onClick={() => onToggleAllDayTasks(dayItem.day, !allCompleted)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition cursor-pointer ${
                allCompleted
                  ? 'bg-white text-emerald-700 hover:bg-emerald-50'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {allCompleted ? 'Undo all' : `Complete all ${dayItem.tasks.length}`}
            </button>
          </div>
        </div>

        {/* Day progress bar */}
        <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white/90 transition-all duration-500"
            style={{ width: `${(completedCount / dayItem.tasks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-5 p-5 sm:px-6 lg:grid-cols-12">
        {/* Tasks */}
        <div className="lg:col-span-7">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Day {dayItem.day} checklist
            </h3>
            <span className="text-[10px] font-medium text-slate-400">
              Click a row to toggle · Focus starts a timer
            </span>
          </div>

          <div className="space-y-2">
            {dayItem.tasks.map((task) => {
              const meta = parseTaskMeta(task);
              const style = SUBJECT_STYLES[meta.subjectKey];
              const isTimerTask = timerTaskId === task.id;

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
                  className={`group flex items-center gap-3 rounded-xl border p-3 transition-all select-none cursor-pointer ${
                    task.completed
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : isTimerTask
                      ? 'border-blue-400 bg-blue-50/40 ring-1 ring-blue-400/50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <span className={`h-8 w-1 shrink-0 rounded-full ${style.rail}`} />

                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                      task.completed
                        ? 'animate-check border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 bg-white group-hover:border-blue-500'
                    }`}
                  >
                    {task.completed && <Check className="h-3 w-3 stroke-[3.5]" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold ${style.chip} ${style.chipText}`}
                      >
                        {meta.subjectLabel}
                      </span>
                      <span
                        className={`num rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600`}
                      >
                        {meta.durationLabel}
                      </span>
                      {meta.isRapidRevision && (
                        <span className="inline-flex items-center gap-0.5 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-700">
                          <Zap className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                          RAPID REV
                        </span>
                      )}
                      {meta.isMockBlock && (
                        <span className="rounded-md border border-fuchsia-200 bg-fuchsia-50 px-1.5 py-0.5 text-[9px] font-extrabold text-fuchsia-700">
                          MOCK / PYQ
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1 text-[13px] font-semibold leading-snug transition ${
                        task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                      }`}
                    >
                      {meta.topic}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startTaskTimer(
                        task.id,
                        meta.durationHours,
                        `${meta.subjectLabel} (${meta.durationLabel})`
                      );
                    }}
                    className="hidden shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 opacity-0 transition group-hover:opacity-100 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 sm:inline-flex cursor-pointer"
                    title={`Start a ${meta.durationLabel} focus timer`}
                  >
                    <TimerIcon className="h-3 w-3" />
                    Focus
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timer + notes */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TimerIcon className="h-4 w-4 text-blue-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Focus timer
                </span>
              </div>
              <span className="num rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-800">
                {modeLabel}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-4">
              <div className="relative h-[74px] w-[74px] shrink-0">
                <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
                  <circle cx="40" cy="40" r="33" fill="none" stroke="#DDE5EE" strokeWidth="7" />
                  <circle
                    cx="40"
                    cy="40"
                    r="33"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 33}
                    strokeDashoffset={2 * Math.PI * 33 * (1 - timerPct / 100)}
                    style={{ transition: 'stroke-dashoffset 400ms linear' }}
                  />
                </svg>
                <span className="num absolute inset-0 flex items-center justify-center text-[13px] font-extrabold text-slate-900">
                  {fmt(secondsLeft)}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRunning((r) => !r)}
                    className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold text-white transition cursor-pointer ${
                      running ? 'bg-amber-600 hover:bg-amber-700' : 'grad-brand hover:brightness-110'
                    }`}
                  >
                    {running ? (
                      <>
                        <Pause className="h-3.5 w-3.5" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" /> Start
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRunning(false);
                      setSecondsLeft(totalSeconds);
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                    title="Reset timer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {PRESETS[studyTrack].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p.minutes, p.label)}
                      className={`num rounded-md border px-1.5 py-0.5 text-[9px] font-bold transition cursor-pointer ${
                        modeLabel === p.label
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <label
              htmlFor={`day-note-${dayItem.day}`}
              className="mb-2 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                <ClipboardList className="h-3.5 w-3.5 text-teal-600" />
                Day {dayItem.day} log &amp; error analysis
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {note ? 'Saved' : 'Auto-saves'}
              </span>
            </label>
            <textarea
              id={`day-note-${dayItem.day}`}
              rows={5}
              value={note || ''}
              onChange={(e) => onChangeNote(dayItem.day, e.target.value)}
              placeholder={studyTrack === 'cgl'
                ? 'Mock score, accuracy %, mistakes, formulas to revisit, Polity articles, current affairs dates…'
                : 'Dataset, SQL queries, cleaning decisions, insights, charts, bugs, and next steps…'}
              className="w-full flex-1 resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
