import React, { useState } from 'react';
import {
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  Languages,
  Sigma,
  X,
  Zap,
} from 'lucide-react';
import {
  CURRICULUM_ROADMAP,
  DayTrackerItem,
  DS_ROADMAP,
  GK_SEQUENCE,
  SUBJECT_STYLES,
} from '../data/trackerGenerator';

interface CurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: DayTrackerItem[];
  onJumpToDay: (day: number) => void;
}

type TabId = 'overview' | 'gk' | 'ds' | 'mathEnglish';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <BookOpenCheck className="h-3.5 w-3.5" /> },
  { id: 'gk', label: 'GK Sequence', icon: <BrainCircuit className="h-3.5 w-3.5" /> },
  { id: 'ds', label: 'Data Science', icon: <Sigma className="h-3.5 w-3.5" /> },
  { id: 'mathEnglish', label: 'Math + English', icon: <Languages className="h-3.5 w-3.5" /> },
];

export const CurriculumModal: React.FC<CurriculumModalProps> = ({
  isOpen,
  onClose,
  days,
  onJumpToDay,
}) => {
  const [tab, setTab] = useState<TabId>('overview');

  if (!isOpen) return null;

  /** Counts completed tasks for a 0-based task index inside a day range. */
  const rangeStat = (startDay: number, endDay: number, taskIndex: number) => {
    const slice = days.slice(startDay - 1, endDay);
    const done = slice.filter((d) => d.tasks[taskIndex]?.completed).length;
    return { done, total: slice.length, pct: slice.length ? Math.round((done / slice.length) * 100) : 0 };
  };

  const ModuleRow = ({
    startDay,
    endDay,
    range,
    title,
    subtitle,
    accent,
    taskIndex,
    badge,
  }: {
    startDay: number;
    endDay: number;
    range: string;
    title: string;
    subtitle?: string;
    accent: string;
    taskIndex: number;
    badge?: React.ReactNode;
  }) => {
    const stat = rangeStat(startDay, endDay, taskIndex);
    return (
      <button
        type="button"
        onClick={() => {
          onJumpToDay(startDay);
          onClose();
        }}
        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
      >
        <div className="flex items-center justify-between gap-2">
          <span className={`num text-[10px] font-extrabold ${accent}`}>{range}</span>
          <span className="num text-[10px] font-bold text-slate-400">
            {stat.done}/{stat.total}d · {stat.pct}%
          </span>
        </div>
        <div className="mt-1 flex items-start gap-1.5">
          <p className="flex-1 text-[11.5px] font-semibold leading-snug text-slate-800">
            {title}
          </p>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-[10.5px] leading-snug text-slate-500">{subtitle}</p>
        )}
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full ${accent.replace('text-', 'bg-')}`} style={{ width: `${stat.pct}%` }} />
        </div>
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="surface-raised flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden">
        {/* Header */}
        <div className="grad-brand relative px-5 py-4 sm:px-6">
          <div className="pointer-events-none absolute inset-0 shimmer opacity-30" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-extrabold text-white sm:text-lg">
                180-Day Syllabus Blueprint
              </h2>
              <p className="mt-0.5 text-[11px] font-medium text-blue-50/90">
                5.5h/day · 990 total hours · 900 tasks · compressed for topics you have
                already covered
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white/15 p-2 text-white/85 transition hover:bg-white/25 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50/70 px-4 py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition cursor-pointer ${
                tab === t.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'overview' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800">
                  Why the load dropped from 7h to 5.5h per day
                </h3>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-700">
                  You have already read <strong>Polity</strong>, <strong>Modern History</strong>,{' '}
                  <strong>Physics</strong> and <strong>Chemistry</strong>, and covered the{' '}
                  <strong>entire Math syllabus</strong>. Those tracks are now compressed into
                  rapid-revision and timed-mock blocks instead of fresh learning, so{' '}
                  <strong className="num">Math 2h → 1h</strong>,{' '}
                  <strong className="num">English 1.5h → 1h</strong>, and GK gets a
                  re-sequenced 7-subject ladder. The freed hours stay with{' '}
                  <strong>Data Science (2h)</strong>, which is fully fresh.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {CURRICULUM_ROADMAP.summary.map((s) => {
                  const style = SUBJECT_STYLES[s.key];
                  const stat = rangeStat(1, 180, ['math', 'english', 'gkNew', 'gkRev', 'dataScience'].indexOf(s.key));
                  return (
                    <div key={s.key} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${style.solidBg}`} />
                          <span className="truncate text-[11px] font-extrabold text-slate-800">
                            {s.title}
                          </span>
                        </span>
                        <span className="num shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {s.daily}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-slate-600">{s.note}</p>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="num text-[10px] font-bold text-slate-500">
                          {stat.done}/180 days · {stat.pct}%
                        </span>
                        <span className="num text-[10px] font-extrabold text-slate-700">
                          {s.totalHours}h total
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full ${style.barColor} transition-all duration-500`}
                          style={{ width: `${Math.max(stat.pct, 1)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <h3 className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  Daily task template
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                  {[
                    { label: 'Math', time: '1h', note: 'Sprint / Mock' },
                    { label: 'English', time: '1h', note: 'Specified module' },
                    { label: 'GK New', time: '1h', note: '7-subject ladder' },
                    { label: 'GK Rev', time: '30m', note: 'Spaced repetition' },
                    { label: 'Data Science', time: '2h', note: '15 skill blocks' },
                  ].map((x) => (
                    <div key={x.label} className="rounded-lg border border-slate-200 bg-white p-2.5 text-center">
                      <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                        {x.label}
                      </div>
                      <div className="num mt-0.5 text-sm font-extrabold text-slate-900">{x.time}</div>
                      <div className="text-[9.5px] font-medium text-slate-400">{x.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'gk' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50/50 px-4 py-3">
                <div>
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800">
                    New GK sequence
                  </h3>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-600">
                    Polity → History → Static GK → Geography → Economics → Science → Current Affairs
                  </p>
                </div>
                <span className="num hidden shrink-0 text-[10px] font-bold text-slate-500 sm:block">
                  180 days · 180h
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {GK_SEQUENCE.map((g) => {
                  const stat = rangeStat(g.startDay, g.endDay, 2);
                  const isCompressed = g.status.includes('Already') || g.status.includes('Read');
                  return (
                    <button
                      key={g.subject}
                      type="button"
                      onClick={() => {
                        onJumpToDay(g.startDay);
                        onClose();
                      }}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/30 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="num text-[10px] font-extrabold text-teal-700">
                              {g.range}
                            </span>
                            {isCompressed && (
                              <span className="inline-flex items-center gap-0.5 rounded border border-amber-200 bg-amber-50 px-1.5 py-px text-[9px] font-extrabold text-amber-700">
                                <Zap className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                                COMPRESSED
                              </span>
                            )}
                          </div>
                          <h4 className="mt-0.5 font-display text-sm font-extrabold text-slate-900">
                            {g.subject}
                          </h4>
                          <p className="text-[10.5px] font-medium text-slate-500">{g.status}</p>
                        </div>
                        <span className="num shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-600">
                          {g.daysCount}d · {g.hours}h
                        </span>
                      </div>

                      <ul className="mt-2.5 space-y-1">
                        {g.topics.map((t) => (
                          <li key={t} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-teal-500" />
                            <span className="leading-snug">{t}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full bg-teal-600" style={{ width: `${stat.pct}%` }} />
                      </div>
                      <div className="num mt-1 text-[10px] font-bold text-slate-400">
                        {stat.done}/{stat.total} days logged · {stat.pct}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'ds' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-sky-200 bg-sky-50/50 px-4 py-3">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-sky-800">
                  Data Science — 15 granular skill blocks (2h/day · 360h)
                </h3>
                <p className="mt-0.5 text-[11px] font-medium text-slate-600">
                  Python → NumPy → Pandas → SQL → Cleaning → EDA → Viz → APIs → Time Series →
                  Indicators → Backtesting → Statistics → Dashboards → AlgoMath → Capstone
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {DS_ROADMAP.map((d) => (
                  <ModuleRow
                    key={d.range}
                    startDay={d.startDay}
                    endDay={d.endDay}
                    range={d.range}
                    title={d.skill}
                    subtitle={d.detail}
                    accent="text-sky-700"
                    taskIndex={4}
                  />
                ))}
              </div>
            </div>
          )}

          {tab === 'mathEnglish' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <div className="mb-2.5 flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-display text-sm font-extrabold text-blue-700">
                    Math — Revision Track (1h/day)
                  </h3>
                  <span className="num text-[10px] font-bold text-slate-500">180h</span>
                </div>
                <div className="space-y-2.5">
                  {CURRICULUM_ROADMAP.math.map((m) => (
                    <ModuleRow
                      key={m.range}
                      startDay={m.startDay}
                      endDay={m.endDay}
                      range={m.range}
                      title={m.topic}
                      accent="text-blue-700"
                      taskIndex={0}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2.5 flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-display text-sm font-extrabold text-indigo-700">
                    English — 9 Specified Modules (1h/day)
                  </h3>
                  <span className="num text-[10px] font-bold text-slate-500">180h</span>
                </div>
                <div className="space-y-2.5">
                  {CURRICULUM_ROADMAP.english.map((e) => (
                    <ModuleRow
                      key={e.range}
                      startDay={e.startDay}
                      endDay={e.endDay}
                      range={e.range}
                      title={e.topic}
                      accent="text-indigo-700"
                      taskIndex={1}
                    />
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
                    GK Rev — spaced repetition track (30m/day · 90h)
                  </h4>
                  <ul className="mt-2 space-y-1 text-[11px] text-slate-700">
                    <li>• <strong>Days 1–12:</strong> Polity PYQ drills (you have read it — test, don&apos;t re-read)</li>
                    <li>• <strong>Days 13–30:</strong> Modern History notes (15m) + Polity PYQs (15m)</li>
                    <li>• <strong>Days 31–92:</strong> Static GK flashcards — 40 Anki-style cards/day</li>
                    <li>• <strong>Days 93–118:</strong> Geography maps, rivers &amp; facts recall</li>
                    <li>• <strong>Days 119–146:</strong> Economics concepts + mixed static recall</li>
                    <li>• <strong>Days 147–180:</strong> Full GK mega revision, all 7 subjects rotating</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-5 py-3">
          <span className="text-[10.5px] font-medium text-slate-500">
            Curriculum is generated dynamically on load and synced to localStorage
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-slate-800 cursor-pointer"
          >
            Close blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
