import {
  DayTrackerItem,
  generate180DaysTracker,
  parseTaskMeta,
  PHASE_BLOCKS,
  SubjectKey,
  SUBJECT_ORDER,
  TOTAL_HOURS,
  TOTAL_TASKS,
} from '../data/trackerGenerator';

/**
 * Storage keys are version-bumped (v2) because the curriculum itself changed
 * (re-sequenced GK, compressed Math/English hours). This prevents old v1
 * completion flags from being mapped onto unrelated topics.
 */
const STORAGE_KEYS = {
  COMPLETED_MAP: 'study_tracker_180_completed_v2',
  NOTES: 'study_tracker_180_notes_v2',
  BOOKMARKS: 'study_tracker_180_bookmarks_v2',
  START_DATE: 'study_tracker_180_start_date_v2',
  HIDE_COMPLETED: 'study_tracker_180_hide_completed_v2',
} as const;

export interface TrackerStorageState {
  days: DayTrackerItem[];
  notes: Record<number, string>;
  bookmarks: Record<number, boolean>;
  startDate: string;
}

const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const todayIso = (): string => new Date().toISOString().split('T')[0];

/** Builds a fresh 180-day curriculum and merges persisted completion flags. */
export const loadTrackerState = (): TrackerStorageState => {
  const baseDays = generate180DaysTracker();
  const completedMap = safeParse<Record<string, boolean>>(
    safeGet(STORAGE_KEYS.COMPLETED_MAP),
    {}
  );

  const days = baseDays.map((dayItem) => ({
    ...dayItem,
    tasks: dayItem.tasks.map((task) => ({
      ...task,
      completed: completedMap[task.id] === true,
    })),
  }));

  return {
    days,
    notes: safeParse<Record<number, string>>(safeGet(STORAGE_KEYS.NOTES), {}),
    bookmarks: safeParse<Record<number, boolean>>(safeGet(STORAGE_KEYS.BOOKMARKS), {}),
    startDate: safeGet(STORAGE_KEYS.START_DATE) || todayIso(),
  };
};

export const saveDaysToStorage = (days: DayTrackerItem[]): void => {
  try {
    const completedMap: Record<string, boolean> = {};
    days.forEach((d) =>
      d.tasks.forEach((t) => {
        if (t.completed) completedMap[t.id] = true;
      })
    );
    localStorage.setItem(STORAGE_KEYS.COMPLETED_MAP, JSON.stringify(completedMap));
  } catch (e) {
    console.error('localStorage save failed:', e);
  }
};

export const saveNotesToStorage = (notes: Record<number, string>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('localStorage save failed:', e);
  }
};

export const saveBookmarksToStorage = (bookmarks: Record<number, boolean>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('localStorage save failed:', e);
  }
};

export const saveStartDateToStorage = (startDate: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.START_DATE, startDate);
  } catch (e) {
    console.error('localStorage save failed:', e);
  }
};

/** Queue-mode preference: hide fully-cleared days so the next day stays on top. Defaults ON. */
export const loadHideCompleted = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HIDE_COMPLETED);
    if (raw === null) return true;
    return JSON.parse(raw) === true;
  } catch {
    return true;
  }
};

export const saveHideCompletedToStorage = (value: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.HIDE_COMPLETED, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage save failed:', e);
  }
};

export const clearAllTrackerStorage = (): TrackerStorageState => {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error('localStorage clear failed:', e);
  }
  return loadTrackerState();
};

export interface SubjectStat {
  logged: number;
  total: number;
  completedCount: number;
  totalCount: number;
  percent: number;
}

export interface PhaseStat {
  completedTasks: number;
  totalTasks: number;
  percent: number;
  completedDays: number;
}

export interface TelemetryStats {
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  overallPercent: number;
  daysCompleted: number;
  daysInProgress: number;
  daysUntouched: number;
  totalPossibleHours: number;
  loggedHours: number;
  remainingHours: number;
  subjectStats: Record<SubjectKey, SubjectStat>;
  phaseProgress: Record<number, PhaseStat>;
  currentTargetDay: number;
  activeStreak: number;
  bestStreak: number;
  etaDateLabel: string;
  projectedFinishLabel: string;
}

export const computeTelemetry = (days: DayTrackerItem[]): TelemetryStats => {
  let completedTasks = 0;
  let daysCompleted = 0;
  let daysInProgress = 0;
  let daysUntouched = 0;
  let loggedHours = 0;

  const subjectStats = {} as Record<SubjectKey, SubjectStat>;
  SUBJECT_ORDER.forEach((key) => {
    subjectStats[key] = {
      logged: 0,
      total: 0,
      completedCount: 0,
      totalCount: 0,
      percent: 0,
    };
  });

  const phaseProgress = {} as Record<number, PhaseStat>;
  PHASE_BLOCKS.forEach((p) => {
    phaseProgress[p.id] = {
      completedTasks: 0,
      totalTasks: 0,
      percent: 0,
      completedDays: 0,
    };
  });

  let currentTargetDay = days.length;
  let foundTarget = false;

  days.forEach((dayItem) => {
    const phaseId = Math.ceil(dayItem.day / 30);
    let doneCount = 0;

    dayItem.tasks.forEach((task) => {
      const meta = parseTaskMeta(task);
      const s = subjectStats[meta.subjectKey];
      s.total += meta.durationHours;
      s.totalCount += 1;
      if (phaseProgress[phaseId]) phaseProgress[phaseId].totalTasks += 1;

      if (task.completed) {
        completedTasks += 1;
        doneCount += 1;
        loggedHours += meta.durationHours;
        s.logged += meta.durationHours;
        s.completedCount += 1;
        if (phaseProgress[phaseId]) phaseProgress[phaseId].completedTasks += 1;
      }
    });

    if (doneCount === dayItem.tasks.length) {
      daysCompleted += 1;
      if (phaseProgress[phaseId]) phaseProgress[phaseId].completedDays += 1;
    } else if (doneCount > 0) {
      daysInProgress += 1;
    } else {
      daysUntouched += 1;
    }

    if (!foundTarget && doneCount < dayItem.tasks.length) {
      currentTargetDay = dayItem.day;
      foundTarget = true;
    }
  });

  SUBJECT_ORDER.forEach((key) => {
    const s = subjectStats[key];
    s.percent = s.total > 0 ? Math.round((s.logged / s.total) * 100) : 0;
  });

  Object.values(phaseProgress).forEach((p) => {
    p.percent = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0;
  });

  // Streaks: consecutive fully-completed days
  let activeStreak = 0;
  let bestStreak = 0;
  let running = 0;
  let gapEncountered = false;

  days.forEach((d) => {
    const allDone = d.tasks.every((t) => t.completed);
    if (allDone) {
      running += 1;
      bestStreak = Math.max(bestStreak, running);
      if (!gapEncountered) activeStreak = running;
    } else {
      const anyDone = d.tasks.some((t) => t.completed);
      if (anyDone) {
        // current day in progress — keeps the streak alive, does not extend it
        if (!gapEncountered) activeStreak = running;
      } else {
        if (running > 0) gapEncountered = true;
        running = 0;
      }
    }
  });

  const remainingTasks = Math.max(0, TOTAL_TASKS - completedTasks);
  const remainingHours = Math.max(0, TOTAL_HOURS - loggedHours);
  const overallPercent = TOTAL_TASKS > 0
    ? Number(((completedTasks / TOTAL_TASKS) * 100).toFixed(1))
    : 0;

  return {
    totalTasks: TOTAL_TASKS,
    completedTasks,
    remainingTasks,
    overallPercent,
    daysCompleted,
    daysInProgress,
    daysUntouched,
    totalPossibleHours: TOTAL_HOURS,
    loggedHours,
    remainingHours,
    subjectStats,
    phaseProgress,
    currentTargetDay,
    activeStreak,
    bestStreak,
    etaDateLabel: getEtaDateLabel(remainingTasks, currentTargetDay),
    projectedFinishLabel: '',
  };
};

/** Rough finish projection: remaining tasks ÷ 5 tasks per day. */
const getEtaDateLabel = (remainingTasks: number, currentDay: number): string => {
  const daysLeft = Math.ceil(remainingTasks / 5);
  const target = new Date();
  target.setDate(target.getDate() + daysLeft);
  const label = target.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${label} (Day ${currentDay + daysLeft > 180 ? 180 : currentDay + daysLeft}/180)`;
};

/** Calendar label for a given tracker day, based on the chosen start date. */
export const getProjectedDateLabel = (
  dayNumber: number,
  startDateStr: string,
  withYear = false
): string => {
  if (!startDateStr) return '';
  try {
    const [y, m, d] = startDateStr.split('-').map(Number);
    if (!y || !m || !d) return '';
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + (dayNumber - 1));
    return date.toLocaleDateString(
      'en-US',
      withYear
        ? { month: 'short', day: 'numeric', year: 'numeric' }
        : { month: 'short', day: 'numeric' }
    );
  } catch {
    return '';
  }
};

/** Long-form weekday label, e.g. "Mon". */
export const getProjectedWeekday = (
  dayNumber: number,
  startDateStr: string
): string => {
  if (!startDateStr) return '';
  try {
    const [y, m, d] = startDateStr.split('-').map(Number);
    if (!y || !m || !d) return '';
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + (dayNumber - 1));
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } catch {
    return '';
  }
};
