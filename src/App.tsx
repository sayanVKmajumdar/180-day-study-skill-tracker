import { useCallback, useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  FilterX,
  PartyPopper,
  Sigma,
  Target,
} from 'lucide-react';
import {
  generate180DaysTracker,
  getStudyTrackDay,
  isTaskInStudyTrack,
  PHASE_BLOCKS,
  STUDY_TRACKS,
  StudyTrack,
  TOTAL_DAYS,
} from './data/trackerGenerator';
import {
  clearAllTrackerStorage,
  computeTelemetry,
  loadHideCompleted,
  loadTrackerState,
  saveBookmarksToStorage,
  saveDaysToStorage,
  saveHideCompletedToStorage,
  saveNotesToStorage,
  saveStartDateToStorage,
} from './utils/storage';
import { TopCommandHeader } from './components/TopCommandHeader';
import { OverviewHero } from './components/OverviewHero';
import { StudyTrackSwitcher } from './components/StudyTrackSwitcher';
import { ConsistencyHeatmap } from './components/ConsistencyHeatmap';
import { ActiveDaySpotlight } from './components/ActiveDaySpotlight';
import { FilterToolbar, StatusFilter, ViewMode } from './components/FilterToolbar';
import { DayCard } from './components/DayCard';
import { CompactDayRow } from './components/CompactDayRow';
import { CurriculumModal } from './components/CurriculumModal';
import { BackupModal, ResetConfirmModal } from './components/BackupResetModals';

const isDayCleared = (day: { tasks: { completed: boolean }[] }) =>
  day.tasks.length > 0 && day.tasks.every((t) => t.completed);

// Keep per-day notes and bookmarks independent while preserving the old CGL day keys.
const DATA_ANALYSIS_DAY_KEY_OFFSET = 1000;
const getTrackDayStorageKey = (track: StudyTrack, day: number): number =>
  track === 'dataAnalysis' ? day + DATA_ANALYSIS_DAY_KEY_OFFSET : day;

const scopeDayRecords = <T,>(record: Record<number, T>, track: StudyTrack): Record<number, T> => {
  const offset = track === 'dataAnalysis' ? DATA_ANALYSIS_DAY_KEY_OFFSET : 0;
  const scoped: Record<number, T> = {};
  Object.entries(record).forEach(([storedDay, value]) => {
    const day = Number(storedDay) - offset;
    if (Number.isInteger(day) && day >= 1 && day <= TOTAL_DAYS) scoped[day] = value;
  });
  return scoped;
};

export function App() {
  const initialState = useMemo(() => loadTrackerState(), []);

  const [days, setDays] = useState(initialState.days);
  const [notes, setNotes] = useState<Record<number, string>>(initialState.notes);
  const [bookmarks, setBookmarks] = useState<Record<number, boolean>>(
    initialState.bookmarks
  );
  const [startDate, setStartDate] = useState<string>(initialState.startDate);
  const [selectedTrack, setSelectedTrack] = useState<StudyTrack>('cgl');

  const trackDays = useMemo(
    () => ({
      cgl: days.map((day) => getStudyTrackDay(day, 'cgl')),
      dataAnalysis: days.map((day) => getStudyTrackDay(day, 'dataAnalysis')),
    }),
    [days]
  );
  const telemetryByTrack = useMemo(
    () => ({
      cgl: computeTelemetry(trackDays.cgl),
      dataAnalysis: computeTelemetry(trackDays.dataAnalysis),
    }),
    [trackDays]
  );
  const scopedDays = trackDays[selectedTrack];
  const scopedNotes = useMemo(() => scopeDayRecords(notes, selectedTrack), [notes, selectedTrack]);
  const scopedBookmarks = useMemo(
    () => scopeDayRecords(bookmarks, selectedTrack),
    [bookmarks, selectedTrack]
  );
  const telemetry = telemetryByTrack[selectedTrack];
  const overallTelemetry = useMemo(() => computeTelemetry(days), [days]);

  const [selectedPhase, setSelectedPhase] = useState<number | 'all'>('all');
  const [focusedDay, setFocusedDay] = useState<number>(
    () => computeTelemetry(initialState.days.map((day) => getStudyTrackDay(day, 'cgl'))).currentTargetDay
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showDeck, setShowDeck] = useState(true);

  // Queue mode: cleared days are removed from the top so the next day stays on top.
  const [hideCompleted, setHideCompleted] = useState<boolean>(() => loadHideCompleted());
  const [showClearedSection, setShowClearedSection] = useState(false);

  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  /* ---------------- localStorage sync ---------------- */
  useEffect(() => saveDaysToStorage(days), [days]);
  useEffect(() => saveNotesToStorage(notes), [notes]);
  useEffect(() => saveBookmarksToStorage(bookmarks), [bookmarks]);
  useEffect(() => saveStartDateToStorage(startDate), [startDate]);
  useEffect(() => saveHideCompletedToStorage(hideCompleted), [hideCompleted]);

  /* ---------------- actions ---------------- */
  const celebrate = useCallback(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.7 },
        colors: ['#2563EB', '#0EA5E9', '#0D9488', '#10B981'],
      });
    } catch {
      /* canvas-confetti unavailable — ignore */
    }
  }, []);

  /** After a day is cleared, advance the mission deck to the next incomplete day. */
  const advanceDeckIfCleared = useCallback(
    (updatedDays: typeof days, clearedDayNumber: number) => {
      const clearedDay = updatedDays.find((d) => d.day === clearedDayNumber);
      const scopedClearedDay = clearedDay && getStudyTrackDay(clearedDay, selectedTrack);
      if (!scopedClearedDay || !isDayCleared(scopedClearedDay)) return;
      celebrate();
      setFocusedDay((prevFocused) => {
        if (prevFocused !== clearedDayNumber) return prevFocused;
        const next = updatedDays.find((day) => !isDayCleared(getStudyTrackDay(day, selectedTrack)));
        return next ? next.day : prevFocused;
      });
      setShowDeck(true);
    },
    [celebrate, selectedTrack]
  );

  const handleToggleTask = useCallback(
    (dayNumber: number, taskId: string) => {
      const updated = days.map((d) => {
        if (d.day !== dayNumber) return d;
        return {
          ...d,
          tasks: d.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        };
      });
      setDays(updated);
      advanceDeckIfCleared(updated, dayNumber);
    },
    [days, advanceDeckIfCleared]
  );

  const handleToggleAllDayTasks = useCallback(
    (dayNumber: number, markComplete: boolean) => {
      const updated = days.map((d) => {
        if (d.day !== dayNumber) return d;
        return {
          ...d,
          tasks: d.tasks.map((t) =>
            isTaskInStudyTrack(t, selectedTrack) ? { ...t, completed: markComplete } : t
          ),
        };
      });
      setDays(updated);
      if (markComplete) advanceDeckIfCleared(updated, dayNumber);
    },
    [days, selectedTrack, advanceDeckIfCleared]
  );

  const handleChangeNote = useCallback((dayNumber: number, text: string) => {
    const storageDay = getTrackDayStorageKey(selectedTrack, dayNumber);
    setNotes((prev) => {
      const next = { ...prev };
      if (!text.trim()) delete next[storageDay];
      else next[storageDay] = text;
      return next;
    });
  }, [selectedTrack]);

  const handleToggleBookmark = useCallback((dayNumber: number) => {
    const storageDay = getTrackDayStorageKey(selectedTrack, dayNumber);
    setBookmarks((prev) => {
      const next = { ...prev };
      if (next[storageDay]) delete next[storageDay];
      else next[storageDay] = true;
      return next;
    });
  }, [selectedTrack]);

  const handleJumpToDay = useCallback(
    (dayNumber: number) => {
      const clamped = Math.max(1, Math.min(TOTAL_DAYS, dayNumber));
      setFocusedDay(clamped);
      setShowDeck(true);

      const targetPhase = Math.ceil(clamped / 30);
      setSelectedPhase((prev) =>
        prev !== 'all' && prev !== targetPhase ? targetPhase : prev
      );

      setStatusFilter('all');
      setSearchQuery('');

      // If the destination day is cleared and cleared days are hidden,
      // reveal them so the card actually exists to scroll to.
      const dest = scopedDays.find((d) => d.day === clamped);
      if (dest && isDayCleared(dest) && hideCompleted) {
        setShowClearedSection(true);
      }

      window.setTimeout(() => {
        const el = document.getElementById(`day-card-${clamped}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 90);
    },
    [scopedDays, hideCompleted]
  );

  const handleSelectTrack = useCallback(
    (track: StudyTrack) => {
      if (track === selectedTrack) return;
      setSelectedTrack(track);
      setFocusedDay(telemetryByTrack[track].currentTargetDay);
      setSelectedPhase('all');
      setStatusFilter('all');
      setSearchQuery('');
      setShowHeatmap(false);
      setShowClearedSection(false);
      setShowDeck(true);
    },
    [selectedTrack, telemetryByTrack]
  );

  const handleJumpToTrackDay = useCallback(
    (track: StudyTrack, dayNumber: number) => {
      const clamped = Math.max(1, Math.min(TOTAL_DAYS, dayNumber));
      setSelectedTrack(track);
      setFocusedDay(clamped);
      setSelectedPhase('all');
      setStatusFilter('all');
      setSearchQuery('');
      setShowHeatmap(false);
      setShowDeck(true);
      setShowClearedSection(false);

      const destination = trackDays[track].find((day) => day.day === clamped);
      if (destination && isDayCleared(destination) && hideCompleted) {
        setShowClearedSection(true);
      }

      window.setTimeout(() => {
        const el = document.getElementById(`day-card-${clamped}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 90);
    },
    [trackDays, hideCompleted]
  );

  const handleFocusDay = useCallback((dayNumber: number) => {
    setFocusedDay(dayNumber);
    setShowDeck(true);
  }, []);

  const handleImportState = useCallback(
    (payload: {
      completedMap?: Record<string, boolean>;
      notes?: Record<number, string>;
      bookmarks?: Record<number, boolean>;
      startDate?: string;
    }) => {
      const fresh = generate180DaysTracker();
      const map = payload.completedMap ?? {};
      const rehydrated = fresh.map((d) => ({
        ...d,
        tasks: d.tasks.map((t) => ({ ...t, completed: map[t.id] === true })),
      }));
      setDays(rehydrated);
      if (payload.notes) setNotes(payload.notes);
      if (payload.bookmarks) setBookmarks(payload.bookmarks);
      if (payload.startDate) setStartDate(payload.startDate);
      const next = rehydrated.find(
        (day) => !isDayCleared(getStudyTrackDay(day, selectedTrack))
      );
      if (next) setFocusedDay(next.day);
    },
    [selectedTrack]
  );

  const handleReset = useCallback(() => {
    const fresh = clearAllTrackerStorage();
    setDays(fresh.days);
    setNotes(fresh.notes);
    setBookmarks(fresh.bookmarks);
    setFocusedDay(1);
    setStatusFilter('all');
    setSearchQuery('');
    setSelectedPhase('all');
    setShowClearedSection(false);
  }, []);

  /* ---------------- derived data ---------------- */
  const phaseDays = useMemo(() => {
    if (selectedPhase === 'all') return scopedDays;
    const block = PHASE_BLOCKS.find((p) => p.id === selectedPhase);
    return block ? scopedDays.slice(block.startDay - 1, block.endDay) : scopedDays;
  }, [scopedDays, selectedPhase]);

  const filteredDays = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return phaseDays.filter((d) => {
      const doneCount = d.tasks.filter((t) => t.completed).length;
      const isAllDone = doneCount === d.tasks.length;
      const isInProgress = doneCount > 0 && !isAllDone;
      const hasRevTask = d.tasks.some((t) => t.title.includes('⚡Rev'));

      if (statusFilter === 'completed' && !isAllDone) return false;
      if (statusFilter === 'in-progress' && !isInProgress) return false;
      if (statusFilter === 'incomplete' && doneCount > 0) return false;
      if (statusFilter === 'bookmarked' && !scopedBookmarks[d.day]) return false;
      if (statusFilter === 'with-notes' && !scopedNotes[d.day]?.trim()) return false;
      if (statusFilter === 'rapid-rev' && !hasRevTask) return false;

      if (q) {
        const dayMatch =
          String(d.day) === q ||
          `day ${d.day}`.includes(q) ||
          `d${d.day}`.includes(q) ||
          String(d.day).padStart(3, '0').includes(q);
        const taskMatch = d.tasks.some((t) => t.title.toLowerCase().includes(q));
        const noteMatch = (scopedNotes[d.day] || '').toLowerCase().includes(q);
        return dayMatch || taskMatch || noteMatch;
      }

      return true;
    });
  }, [phaseDays, statusFilter, searchQuery, scopedBookmarks, scopedNotes]);

  /**
   * Queue split: active (up-next) days stay on top in chronological order with
   * the current target pinned first; cleared days are removed from the top and
   * collected separately (hidden or sunk to the bottom).
   */
  const { queueDays, sunkDays } = useMemo(() => {
    const active = filteredDays.filter((d) => !isDayCleared(d));
    const cleared = filteredDays.filter((d) => isDayCleared(d));
    const targetIdx = active.findIndex((d) => d.day === telemetry.currentTargetDay);
    if (targetIdx > 0) {
      const [target] = active.splice(targetIdx, 1);
      active.unshift(target);
    }
    return { queueDays: active, sunkDays: cleared };
  }, [filteredDays, telemetry.currentTargetDay]);

  const isCompletedFilter = statusFilter === 'completed';
  const queueEmpty = !isCompletedFilter && queueDays.length === 0 && sunkDays.length > 0;

  const focusedDayItem = useMemo(
    () => scopedDays.find((d) => d.day === focusedDay) ?? scopedDays[0],
    [scopedDays, focusedDay]
  );

  const bookmarkCount = useMemo(
    () => Object.values(scopedBookmarks).filter(Boolean).length,
    [scopedBookmarks]
  );

  const notesCount = useMemo(
    () => Object.values(scopedNotes).filter((n) => n?.trim()).length,
    [scopedNotes]
  );

  const activePhase = useMemo(
    () =>
      selectedPhase === 'all'
        ? null
        : PHASE_BLOCKS.find((p) => p.id === selectedPhase) ?? null,
    [selectedPhase]
  );

  const renderDay = (d: (typeof days)[number]) =>
    viewMode === 'grid' ? (
      <DayCard
        key={d.day}
        dayItem={d}
        isCurrentTarget={d.day === telemetry.currentTargetDay}
        isFocused={d.day === focusedDay}
        startDate={startDate}
        hasNote={Boolean(scopedNotes[d.day]?.trim())}
        isBookmarked={Boolean(scopedBookmarks[d.day])}
        onToggleTask={handleToggleTask}
        onToggleAllDayTasks={handleToggleAllDayTasks}
        onFocusDay={handleFocusDay}
        onToggleBookmark={handleToggleBookmark}
      />
    ) : (
      <CompactDayRow
        key={d.day}
        dayItem={d}
        isCurrentTarget={d.day === telemetry.currentTargetDay}
        isFocused={d.day === focusedDay}
        startDate={startDate}
        hasNote={Boolean(scopedNotes[d.day]?.trim())}
        isBookmarked={Boolean(scopedBookmarks[d.day])}
        onToggleTask={handleToggleTask}
        onToggleAllDayTasks={handleToggleAllDayTasks}
        onFocusDay={handleFocusDay}
        onToggleBookmark={handleToggleBookmark}
      />
    );

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <TopCommandHeader
        selectedTrack={selectedTrack}
        selectedPhase={selectedPhase}
        onSelectPhase={setSelectedPhase}
        telemetry={telemetry}
        onJumpToDay={handleJumpToDay}
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap((v) => !v)}
        onOpenCurriculum={() => setIsCurriculumOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenResetConfirm={() => setIsResetOpen(true)}
      />

      <main className="mx-auto w-full max-w-[1500px] flex-1 space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <StudyTrackSwitcher
          selectedTrack={selectedTrack}
          onSelectTrack={handleSelectTrack}
          cglTelemetry={telemetryByTrack.cgl}
          dataAnalysisTelemetry={telemetryByTrack.dataAnalysis}
        />

        <OverviewHero
          studyTrack={selectedTrack}
          telemetry={telemetry}
          startDate={startDate}
          onChangeStartDate={setStartDate}
          onJumpToTarget={() => handleJumpToDay(telemetry.currentTargetDay)}
        />

        {showHeatmap && (
          <ConsistencyHeatmap
            studyTrack={selectedTrack}
            days={scopedDays}
            focusedDay={focusedDay}
            currentTargetDay={telemetry.currentTargetDay}
            startDate={startDate}
            bookmarks={scopedBookmarks}
            onSelectDay={handleJumpToDay}
          />
        )}

        {/* Mission deck */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <h2 className="font-display text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                {STUDY_TRACKS[selectedTrack].label} mission deck · Day {focusedDayItem.day} of {TOTAL_DAYS}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowDeck((s) => !s)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-500 transition hover:bg-white hover:text-slate-900 cursor-pointer"
            >
              {showDeck ? 'Minimise' : 'Expand'}
              {showDeck ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {showDeck && (
            <ActiveDaySpotlight
              studyTrack={selectedTrack}
              dayItem={focusedDayItem}
              isCurrentTarget={focusedDayItem.day === telemetry.currentTargetDay}
              startDate={startDate}
              note={scopedNotes[focusedDayItem.day] || ''}
              isBookmarked={Boolean(bookmarks[focusedDayItem.day])}
              onToggleTask={handleToggleTask}
              onToggleAllDayTasks={handleToggleAllDayTasks}
              onChangeNote={handleChangeNote}
              onToggleBookmark={handleToggleBookmark}
              onNavigateDay={(d) => setFocusedDay(Math.max(1, Math.min(TOTAL_DAYS, d)))}
            />
          )}
        </section>

        {/* Phase banner */}
        {activePhase && (
          <div className="surface flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-start gap-3">
              <span className="num grad-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-extrabold text-white">
                {activePhase.code}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-sm font-extrabold text-slate-900">
                    {activePhase.label} · {selectedTrack === 'cgl' ? activePhase.cglSubtitle : activePhase.dataAnalysisSubtitle}
                  </h3>
                  <span className="num rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-800">
                    {telemetry.phaseProgress[activePhase.id]?.percent ?? 0}% complete
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                  {selectedTrack === 'cgl' ? (
                    <>
                      <span className="font-bold text-blue-700">Math:</span> {activePhase.mathFocus}
                      <span className="mx-1.5 text-slate-300">•</span>
                      <span className="font-bold text-indigo-700">English:</span> {activePhase.englishFocus}
                      <span className="mx-1.5 text-slate-300">•</span>
                      <span className="font-bold text-teal-700">GK:</span> {activePhase.gkFocus}
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-sky-700">Data Analysis:</span>{' '}
                      {activePhase.dsFocus}
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPhase('all')}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5 text-blue-600" />
              Show all 180 days
            </button>
          </div>
        )}

        <FilterToolbar
          studyTrack={selectedTrack}
          statusFilter={statusFilter}
          onChangeStatusFilter={setStatusFilter}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          filteredCount={isCompletedFilter ? sunkDays.length : queueDays.length}
          totalInPhaseCount={phaseDays.length}
          bookmarkCount={bookmarkCount}
          notesCount={notesCount}
          hideCompleted={hideCompleted}
          onToggleHideCompleted={() => setHideCompleted((v) => !v)}
          clearedInView={isCompletedFilter ? 0 : sunkDays.length}
        />

        {/* Day list */}
        {filteredDays.length === 0 ? (
          <div className="surface flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FilterX className="h-6 w-6" />
            </div>
            <h3 className="mt-3 font-display text-base font-extrabold text-slate-900">
              No days match this view
            </h3>
            <p className="mt-1 max-w-md text-[11.5px] text-slate-500">
              Nothing matches the <strong>{statusFilter}</strong> filter
              {searchQuery ? <> and search “{searchQuery}”</> : null}. Try clearing them.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
                setSelectedPhase('all');
              }}
              className="grad-brand mt-4 rounded-xl px-4 py-2 text-[11px] font-bold text-white transition hover:brightness-110 cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : queueEmpty ? (
          /* Queue clear — every visible day is done, next target lives elsewhere */
          <div className="surface flex flex-col items-center justify-center border-emerald-200 bg-emerald-50/60 px-6 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <PartyPopper className="h-6 w-6" />
            </div>
            <h3 className="mt-3 font-display text-base font-extrabold text-slate-900">
              Queue clear — every day in this view is done
            </h3>
            <p className="mt-1 max-w-md text-[11.5px] text-slate-500">
              All {sunkDays.length} day{sunkDays.length === 1 ? '' : 's'} here are cleared for{' '}
              {STUDY_TRACKS[selectedTrack].label}. Your next target is{' '}
              <strong className="num text-slate-800">Day {telemetry.currentTargetDay}</strong>.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleJumpToDay(telemetry.currentTargetDay)}
                className="grad-brand rounded-xl px-4 py-2 text-[11px] font-bold text-white transition hover:brightness-110 cursor-pointer"
              >
                Go to Day {telemetry.currentTargetDay}
              </button>
              <button
                type="button"
                onClick={() => setShowClearedSection((v) => !v)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
              >
                {showClearedSection ? 'Hide' : 'Review'} cleared days ({sunkDays.length})
              </button>
            </div>

            {showClearedSection && (
              <div
                className={
                  viewMode === 'grid'
                    ? 'mt-6 grid w-full grid-cols-1 gap-4 text-left md:grid-cols-2 xl:grid-cols-3'
                    : 'mt-6 w-full space-y-2 text-left'
                }
              >
                {sunkDays.map(renderDay)}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Up-next queue — next day on top */}
            <section
              aria-label="Up-next study queue"
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
                  : 'space-y-2'
              }
            >
              {(isCompletedFilter ? sunkDays : queueDays).map(renderDay)}
            </section>

            {/* Cleared days — removed from the top */}
            {!isCompletedFilter && sunkDays.length > 0 && hideCompleted && (
              <section aria-label="Cleared days" className="surface overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowClearedSection((v) => !v)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50/70 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-[12px] font-extrabold text-slate-800">
                        Cleared days ({sunkDays.length}) — removed from the top
                      </h3>
                      <p className="text-[10.5px] font-medium text-slate-500">
                        Finished days drop out of the queue automatically. Expand to review or undo them.
                      </p>
                    </div>
                  </div>
                  {showClearedSection ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                </button>

                {showClearedSection && (
                  <div className="border-t border-slate-200/80 bg-slate-50/50 p-4">
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
                          : 'space-y-2'
                      }
                    >
                      {sunkDays.map(renderDay)}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Inline sunk mode — cleared days visible but pinned to the bottom */}
            {!isCompletedFilter && sunkDays.length > 0 && !hideCompleted && (
              <section aria-label="Cleared days at the bottom" className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Cleared — sunk to the bottom ({sunkDays.length})
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 gap-4 opacity-90 md:grid-cols-2 xl:grid-cols-3'
                      : 'space-y-2 opacity-90'
                  }
                >
                  {sunkDays.map(renderDay)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-2.5 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="grad-brand flex h-7 w-7 items-center justify-center rounded-lg text-white">
              <Sigma className="h-3.5 w-3.5" strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold text-slate-700">
              180-Day CGL &amp; Data Analysis Tracker
            </span>
            <span className="hidden text-slate-300 sm:inline">|</span>
            <span className="num hidden text-[10.5px] font-semibold text-slate-500 sm:inline">
              CGL: 630h · Data Analysis: 360h · 180 days each
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10.5px] font-medium text-slate-500">
              Progress saved locally in your browser
            </span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[10.5px] font-bold text-blue-600 transition hover:underline cursor-pointer"
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </footer>

      <CurriculumModal
        isOpen={isCurriculumOpen}
        onClose={() => setIsCurriculumOpen(false)}
        days={days}
        onJumpToTrackDay={handleJumpToTrackDay}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        days={days}
        notes={notes}
        bookmarks={bookmarks}
        startDate={startDate}
        onImportState={handleImportState}
      />

      <ResetConfirmModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirmReset={handleReset}
        completedTasksCount={overallTelemetry.completedTasks}
      />
    </div>
  );
}

export default App;
