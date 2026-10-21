import { useCallback, useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FilterX,
  PartyPopper,
  Sigma,
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
import { StudyGoalsPanel } from './components/StudyGoalsPanel';
import { StudyTrackSwitcher } from './components/StudyTrackSwitcher';
import { WeeklyRhythm } from './components/WeeklyRhythm';
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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
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
  const goalPhase =
    activePhase ??
    PHASE_BLOCKS.find((phase) => phase.id === Math.ceil(telemetry.currentTargetDay / 30)) ??
    PHASE_BLOCKS[0];

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

      <main className="app-main mx-auto w-full max-w-[1160px] flex-1 space-y-5 px-4 py-6 sm:px-6">
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

        <div className="dashboard-layout">
          <div className="dashboard-main-column">
            <section className="dashboard-section today-section" aria-label="Today's study plan">
              <div className="section-heading">
                <div>
                  <p className="dashboard-kicker">Today · Focused session</p>
                  <h2 className="section-title">
                    {STUDY_TRACKS[selectedTrack].label} · Day {focusedDayItem.day}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeck((visible) => !visible)}
                  className="section-action"
                  aria-expanded={showDeck}
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
                  isBookmarked={Boolean(scopedBookmarks[focusedDayItem.day])}
                  onToggleTask={handleToggleTask}
                  onToggleAllDayTasks={handleToggleAllDayTasks}
                  onChangeNote={handleChangeNote}
                  onToggleBookmark={handleToggleBookmark}
                  onNavigateDay={(dayNumber) => setFocusedDay(Math.max(1, Math.min(TOTAL_DAYS, dayNumber)))}
                />
              )}
            </section>
          </div>

          <aside className="dashboard-sidebar" aria-label="Progress and habits">
            <StudyGoalsPanel
              studyTrack={selectedTrack}
              telemetry={telemetry}
              phase={goalPhase}
              onViewAll={() => setSelectedPhase('all')}
            />
            <WeeklyRhythm
              days={scopedDays}
              currentTargetDay={telemetry.currentTargetDay}
              focusedDay={focusedDay}
              startDate={startDate}
              telemetry={telemetry}
              onSelectDay={handleJumpToDay}
            />
          </aside>
        </div>

        <section className="dashboard-section queue-section" aria-label="Study queue">
          <div className="section-heading">
            <div>
              <p className="dashboard-kicker">180-day roadmap · {STUDY_TRACKS[selectedTrack].label}</p>
              <h2 className="section-title">Top Tasks</h2>
            </div>
            <span className="queue-count">
              <strong className="num">{isCompletedFilter ? sunkDays.length : queueDays.length}</strong>
              <span>days in view</span>
            </span>
          </div>

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
            onToggleHideCompleted={() => setHideCompleted((value) => !value)}
            clearedInView={isCompletedFilter ? 0 : sunkDays.length}
          />

          {filteredDays.length === 0 ? (
            <div className="dashboard-card empty-state">
              <div className="empty-state-icon"><FilterX size={22} /></div>
              <h3>No days match this view</h3>
              <p>
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
                className="grad-brand empty-state-button"
              >
                Reset all filters
              </button>
            </div>
          ) : queueEmpty ? (
            <div className="dashboard-card empty-state queue-clear">
              <div className="empty-state-icon"><PartyPopper size={22} /></div>
              <h3>Queue clear — every day in this view is done</h3>
              <p>
                All {sunkDays.length} day{sunkDays.length === 1 ? '' : 's'} here are cleared for{' '}
                {STUDY_TRACKS[selectedTrack].label}. Your next target is{' '}
                <strong className="num">Day {telemetry.currentTargetDay}</strong>.
              </p>
              <div className="empty-state-actions">
                <button
                  type="button"
                  onClick={() => handleJumpToDay(telemetry.currentTargetDay)}
                  className="grad-brand empty-state-button"
                >
                  Go to Day {telemetry.currentTargetDay}
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearedSection((visible) => !visible)}
                  className="section-action"
                >
                  {showClearedSection ? 'Hide' : 'Review'} cleared days ({sunkDays.length})
                </button>
              </div>

              {showClearedSection && (
                <div className={viewMode === 'grid' ? 'day-grid cleared-review' : 'day-list cleared-review'}>
                  {sunkDays.map(renderDay)}
                </div>
              )}
            </div>
          ) : (
            <div className="queue-results">
              <section
                aria-label="Up-next study queue"
                className={viewMode === 'grid' ? 'day-grid' : 'day-list'}
              >
                {(isCompletedFilter ? sunkDays : queueDays).map(renderDay)}
              </section>

              {!isCompletedFilter && sunkDays.length > 0 && hideCompleted && (
                <section aria-label="Cleared days" className="cleared-days-panel">
                  <button
                    type="button"
                    onClick={() => setShowClearedSection((visible) => !visible)}
                    className="cleared-days-toggle"
                  >
                    <span className="cleared-icon"><CheckCircle2 size={16} /></span>
                    <span className="cleared-copy">
                      <strong>Cleared days ({sunkDays.length})</strong>
                      <small>Finished days drop out of the queue. Expand to review or undo.</small>
                    </span>
                    {showClearedSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showClearedSection && (
                    <div className={viewMode === 'grid' ? 'day-grid cleared-review' : 'day-list cleared-review'}>
                      {sunkDays.map(renderDay)}
                    </div>
                  )}
                </section>
              )}

              {!isCompletedFilter && sunkDays.length > 0 && !hideCompleted && (
                <section aria-label="Cleared days at the bottom" className="cleared-inline">
                  <div className="cleared-inline-title">
                    <span />
                    <strong><CheckCircle2 size={14} /> Cleared · bottom of queue ({sunkDays.length})</strong>
                    <span />
                  </div>
                  <div className={viewMode === 'grid' ? 'day-grid' : 'day-list'}>
                    {sunkDays.map(renderDay)}
                  </div>
                </section>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="mx-auto flex max-w-[1160px] flex-col items-center justify-between gap-2.5 px-4 py-5 sm:flex-row sm:px-6">
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
