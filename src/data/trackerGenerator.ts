export interface TrackerTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface DayTrackerItem {
  day: number;
  tasks: TrackerTask[];
}

export type SubjectKey = 'math' | 'english' | 'gkNew' | 'gkRev' | 'dataScience';

export interface ParsedTaskMeta {
  id: string;
  rawTitle: string;
  subjectKey: SubjectKey;
  subjectLabel: string;
  durationLabel: string;
  durationHours: number;
  topic: string;
  isRapidRevision: boolean;
  isMockBlock: boolean;
}

export interface PhaseBlock {
  id: number;
  code: string;
  label: string;
  subtitle: string;
  startDay: number;
  endDay: number;
  mathFocus: string;
  gkFocus: string;
  englishFocus: string;
  dsFocus: string;
}

/* ------------------------------------------------------------------ *
 *  GLOBAL CURRICULUM CONSTANTS
 *  Daily load reduced from 7h -> 5.5h because Math (entire syllabus),
 *  Polity, Modern History, Physics & Chemistry are already covered.
 * ------------------------------------------------------------------ */
export const TOTAL_DAYS = 180;
export const TASKS_PER_DAY = 5;
export const HOURS_PER_DAY = 5.5;
export const TOTAL_TASKS = TOTAL_DAYS * TASKS_PER_DAY; // 900
export const TOTAL_HOURS = TOTAL_DAYS * HOURS_PER_DAY; // 990

/* ------------------------------------------------------------------ *
 *  SUBJECT TRACK BUILDERS
 * ------------------------------------------------------------------ */

/** MATH — full syllabus already covered once => 1h/day, speed + mock focus. */
const buildMathTopic = (day: number): string => {
  if (day <= 10) return 'Arithmetic Sprint — Percentage, Profit/Loss, Discount';
  if (day <= 20) return 'Arithmetic Sprint — Ratio, Mixture, Time & Work';
  if (day <= 30) return 'Arithmetic Sprint — SI/CI, Speed-Time-Distance, Trains';
  if (day <= 42) return 'Algebra & Trigonometry — Identity Recall + 20Q Sprint';
  if (day <= 56) return 'Geometry & Mensuration — Theorem Recall + 20Q Sprint';
  if (day <= 66) return 'Number System, LCM/HCF & Data Interpretation Sprint';
  // Days 67-180: alternating timed sectional mock / deep error analysis
  return day % 2 === 1
    ? 'Sectional Mock — 30 Questions / 20 Minutes (Timed)'
    : 'Error Analysis + Weak-Area Re-drill (Maintain Error Log)';
};

/** ENGLISH — 1h/day with a fully specified micro-syllabus. */
const buildEnglishTopic = (day: number): string => {
  if (day <= 15) return 'Vocabulary — 20 New Words + Latin/Greek Root Words';
  if (day <= 30) return 'Grammar — Subject-Verb Agreement, Tenses, Articles';
  if (day <= 45) return 'Grammar — Prepositions, Conjunctions, Modals';
  if (day <= 60) return 'Error Spotting + Sentence Improvement (40 Q Drill)';
  if (day <= 75) return 'Idioms, Phrases & One-Word Substitution';
  if (day <= 95) return 'Reading Comprehension + Cloze Test (2 Passages)';
  if (day <= 115) return 'Para Jumbles, Fill-in-the-Blanks & Rearrangement';
  if (day <= 135) return 'Active/Passive Voice, Direct/Indirect & Spellings';
  return 'English Sectional Mock (50 Q) + Vocab Spaced Revision';
};

/**
 * GK NEW — Re-sequenced: Polity → History → Static GK → Geography →
 * Economics → Science → Current Affairs.
 * Already-read subjects (Polity, Modern History, Physics, Chemistry)
 * get compressed "rapid revision" windows instead of full study blocks.
 */
export const GK_SEQUENCE = [
  {
    subject: 'Polity',
    range: 'Days 1–12',
    startDay: 1,
    endDay: 12,
    daysCount: 12,
    status: 'Already Read — Rapid Revision',
    hours: 12,
    topics: [
      'Preamble, Union & States, Citizenship',
      'Fundamental Rights, DPSP & Duties',
      'President, PM, Parliament & Cabinet',
      'Judiciary, Constitutional Bodies, Amendments + PYQs',
    ],
  },
  {
    subject: 'History',
    range: 'Days 13–30',
    startDay: 13,
    endDay: 30,
    daysCount: 18,
    status: 'Modern Read — Rev + Ancient/Medieval New',
    hours: 18,
    topics: [
      'Modern India Rapid Revision (1857–1947)',
      'Ancient India — Indus, Vedic, Maurya, Gupta',
      'Medieval India — Sultanate, Mughals, Bhakti-Sufi',
      'Art & Culture — Dance, Music, Architecture',
      'History Revision Test + PYQ Marathon',
    ],
  },
  {
    subject: 'Static GK',
    range: 'Days 31–58',
    startDay: 31,
    endDay: 58,
    daysCount: 28,
    status: 'Fresh — Full Depth',
    hours: 28,
    topics: [
      'National Symbols, Awards & Honours',
      'Books & Authors, Important Days',
      'Sports, Trophies & Tournaments',
      'UN, IMF, World Bank, WTO & Agencies',
      'RBI, ISRO, DRDO, Defence & Institutions',
    ],
  },
  {
    subject: 'Geography',
    range: 'Days 59–92',
    startDay: 59,
    endDay: 92,
    daysCount: 34,
    status: 'Fresh — Highest Priority',
    hours: 34,
    topics: [
      'Universe, Solar System & Earth Motions',
      'Atmosphere, Winds, Cyclones & Rainfall',
      'Indian Physiography & River Systems',
      'Indian Climate, Monsoon, Soils, Vegetation',
      'Agriculture, Minerals, Industries & Energy',
      'World Map, Capitals & Ocean Currents',
    ],
  },
  {
    subject: 'Economics',
    range: 'Days 93–118',
    startDay: 93,
    endDay: 118,
    daysCount: 26,
    status: 'Fresh — Full Depth',
    hours: 26,
    topics: [
      'GDP, GNP, Inflation & Fiscal Deficit',
      'RBI, Monetary Policy, Repo & Money Supply',
      'Banking, NPAs, Basel Norms & UPI',
      'Union Budget, Taxation & GST',
      'BoP, FDI, FPI & Exchange Rate',
    ],
  },
  {
    subject: 'Science',
    range: 'Days 119–146',
    startDay: 119,
    endDay: 146,
    daysCount: 28,
    status: 'Physics/Chem Read — Bio New',
    hours: 28,
    topics: [
      'Physics Rapid Rev — Motion, Optics, Electricity',
      'Chemistry Rapid Rev — Atoms, Acids, Alloys',
      'Biology New — Cell, Genetics, Human Physiology',
      'Plant Physiology, Ecology & Biodiversity',
      'Science & Tech — Space, Defence, Biotech, AI',
    ],
  },
  {
    subject: 'Current Affairs',
    range: 'Days 147–180',
    startDay: 147,
    endDay: 180,
    daysCount: 34,
    status: 'Fresh — Continuous Coverage',
    hours: 34,
    topics: [
      'Last 6 Months — National & Polity',
      'Last 6 Months — Economy & Banking',
      'Last 1 Year — International & Summits',
      'Sports, Awards, Books & Obituaries',
      'Schemes, Indices & Reports',
      'Full CA Mega Revision + GK Mocks',
    ],
  },
] as const;

const buildGkNewTopic = (day: number): string => {
  // 1. POLITY (Days 1–12) — already read → compressed rapid revision
  if (day <= 3) return 'Polity ⚡Rev — Preamble, Union & States, Citizenship';
  if (day <= 6) return 'Polity ⚡Rev — Fundamental Rights, DPSP & Duties';
  if (day <= 9) return 'Polity ⚡Rev — President, PM, Parliament, Cabinet';
  if (day <= 12) return 'Polity ⚡Rev — Judiciary, Bodies, Amendments + PYQs';

  // 2. HISTORY (Days 13–30) — modern already read → rev + new segments
  if (day <= 16) return 'History ⚡Rev — Modern India (1857–1947) Key Notes';
  if (day <= 20) return 'History — Ancient India (Indus, Vedic, Maurya, Gupta)';
  if (day <= 25) return 'History — Medieval India (Sultanate, Mughals, Bhakti-Sufi)';
  if (day <= 28) return 'History — Art & Culture (Dance, Music, Architecture)';
  if (day <= 30) return 'History — Revision Test + PYQ Marathon';

  // 3. STATIC GK (Days 31–58) — fresh, full depth
  if (day <= 35) return 'Static GK — National Symbols, Awards & Honours';
  if (day <= 40) return 'Static GK — Books & Authors, Important Days';
  if (day <= 45) return 'Static GK — Sports, Trophies & Tournaments';
  if (day <= 51) return 'Static GK — UN, IMF, World Bank, WTO & Agencies';
  if (day <= 58) return 'Static GK — RBI, ISRO, DRDO, Defence & Institutions';

  // 4. GEOGRAPHY (Days 59–92) — fresh, highest priority
  if (day <= 63) return 'Geography — Universe, Solar System & Earth Motions';
  if (day <= 69) return 'Geography — Atmosphere, Winds, Cyclones & Rainfall';
  if (day <= 75) return 'Geography — Indian Physiography & River Systems';
  if (day <= 81) return 'Geography — Indian Climate, Monsoon, Soils, Vegetation';
  if (day <= 87) return 'Geography — Agriculture, Minerals, Industries & Energy';
  if (day <= 92) return 'Geography — World Map, Capitals & Ocean Currents';

  // 5. ECONOMICS (Days 93–118) — fresh
  if (day <= 97) return 'Economics — GDP, GNP, Inflation & Fiscal Deficit';
  if (day <= 102) return 'Economics — RBI, Monetary Policy, Repo & Money Supply';
  if (day <= 107) return 'Economics — Banking, NPAs, Basel Norms & UPI';
  if (day <= 112) return 'Economics — Union Budget, Taxation & GST';
  if (day <= 118) return 'Economics — BoP, FDI, FPI & Exchange Rate';

  // 6. SCIENCE (Days 119–146) — physics/chem already read, biology new
  if (day <= 123) return 'Science ⚡Rev — Physics: Motion, Optics, Electricity';
  if (day <= 128) return 'Science ⚡Rev — Chemistry: Atoms, Acids, Alloys';
  if (day <= 136) return 'Science — Biology New: Cell, Genetics, Physiology';
  if (day <= 141) return 'Science — Plant Physiology, Ecology & Biodiversity';
  if (day <= 146) return 'Science & Tech — Space, Defence, Biotech & AI';

  // 7. CURRENT AFFAIRS (Days 147–180)
  if (day <= 152) return 'Current Affairs — Last 6 Months: National & Polity';
  if (day <= 158) return 'Current Affairs — Last 6 Months: Economy & Banking';
  if (day <= 164) return 'Current Affairs — Last 1 Year: International & Summits';
  if (day <= 170) return 'Current Affairs — Sports, Awards, Books & Obituaries';
  if (day <= 175) return 'Current Affairs — Schemes, Indices & Reports';
  return 'Current Affairs — Full CA Mega Revision + GK Mocks';
};

/** GK REV — 30m/day of spaced repetition across already-covered ground. */
const buildGkRevTopic = (day: number): string => {
  if (day <= 12) return 'Polity PYQ Drill (Spaced Repetition)';
  if (day <= 30) return 'Modern History Notes (15m) + Polity PYQs (15m)';
  if (day <= 58) return 'Static GK Flashcards + Polity/History Recall';
  if (day <= 92) return 'Static GK Flashcards — 40 Anki-Style Cards';
  if (day <= 118) return 'Geography Maps, Rivers & Facts Recall';
  if (day <= 146) return 'Economics Concepts + Static GK Mixed Recall';
  return 'Full GK Mega Revision — Rotating All 7 Subjects';
};

/** DATA SCIENCE — 2h/day, 15 granular skill blocks. */
export const DS_ROADMAP = [
  { range: 'Days 1–12', startDay: 1, endDay: 12, skill: 'Python Core', detail: 'Lists, Dicts, Sets, Comprehensions, Functions, Decorators' },
  { range: 'Days 13–22', startDay: 13, endDay: 22, skill: 'NumPy', detail: 'Arrays, Broadcasting, Vectorization, Linear Algebra' },
  { range: 'Days 23–32', startDay: 23, endDay: 32, skill: 'Pandas', detail: 'Series, DataFrame, groupby, merge, pivot, apply' },
  { range: 'Days 33–42', startDay: 33, endDay: 42, skill: 'SQL', detail: 'SELECT, JOINs, GROUP BY, Window Functions, CTEs' },
  { range: 'Days 43–52', startDay: 43, endDay: 52, skill: 'Data Cleaning', detail: 'Nulls, Duplicates, Outliers, Dtype Casting, Regex' },
  { range: 'Days 53–62', startDay: 53, endDay: 62, skill: 'EDA', detail: 'Univariate, Bivariate, Correlation, Crosstabs' },
  { range: 'Days 63–72', startDay: 63, endDay: 72, skill: 'Visualization', detail: 'Matplotlib & Seaborn — Distributions, Categorical, Heatmaps' },
  { range: 'Days 73–84', startDay: 73, endDay: 84, skill: 'APIs & Scraping', detail: 'requests, REST, yfinance, NSE Bhavcopy, BeautifulSoup' },
  { range: 'Days 85–96', startDay: 85, endDay: 96, skill: 'Time Series', detail: 'datetime index, resample, rolling windows, log returns' },
  { range: 'Days 97–110', startDay: 97, endDay: 110, skill: 'Technical Indicators', detail: 'SMA, EMA, RSI, MACD, Bollinger Bands, ATR' },
  { range: 'Days 111–122', startDay: 111, endDay: 122, skill: 'Backtesting', detail: 'Signal generation, PnL, Max Drawdown, Sharpe Ratio' },
  { range: 'Days 123–136', startDay: 123, endDay: 136, skill: 'Statistics', detail: 'Distributions, Hypothesis Testing, Regression, Monte Carlo' },
  { range: 'Days 137–150', startDay: 137, endDay: 150, skill: 'Dashboards', detail: 'React + Tailwind + Recharts, Streamlit, Deployment' },
  { range: 'Days 151–164', startDay: 151, endDay: 164, skill: 'AlgoMath', detail: 'Portfolio Optimization, Monte Carlo, Options Greeks' },
  { range: 'Days 165–180', startDay: 165, endDay: 180, skill: 'Capstone Portfolio', detail: '3 End-to-End Projects, GitHub, README, Live Deploy' },
] as const;

const buildDsTopic = (day: number): string => {
  if (day <= 12) return 'Python Core — Lists, Dicts, Comprehensions, Functions';
  if (day <= 22) return 'NumPy — Arrays, Broadcasting, Vectorization';
  if (day <= 32) return 'Pandas — DataFrame, groupby, merge, pivot, apply';
  if (day <= 42) return 'SQL — SELECT, JOINs, GROUP BY, Window Fns, CTEs';
  if (day <= 52) return 'Data Cleaning — Nulls, Duplicates, Outliers, Dtypes';
  if (day <= 62) return 'EDA — Univariate, Bivariate, Correlation, Crosstabs';
  if (day <= 72) return 'Data Viz — Matplotlib & Seaborn Charts + Heatmaps';
  if (day <= 84) return 'APIs & Scraping — requests, yfinance, NSE, BS4';
  if (day <= 96) return 'Time Series — Resample, Rolling Windows, Returns';
  if (day <= 110) return 'Indicators — SMA, EMA, RSI, MACD, Bollinger, ATR';
  if (day <= 122) return 'Backtesting — Signals, PnL, Drawdown, Sharpe';
  if (day <= 136) return 'Statistics — Distributions, Tests, Regression';
  if (day <= 150) return 'Dashboards — React, Tailwind, Recharts, Streamlit';
  if (day <= 164) return 'AlgoMath — Portfolio Optim, Monte Carlo, Greeks';
  return 'Capstone Portfolio — 3 Projects, GitHub, README, Deploy';
};

/* ------------------------------------------------------------------ *
 *  MAIN GENERATOR (180 days x 5 tasks, built dynamically)
 * ------------------------------------------------------------------ */
export const generate180DaysTracker = (): DayTrackerItem[] => {
  const trackerData: DayTrackerItem[] = [];

  for (let day = 1; day <= TOTAL_DAYS; day++) {
    const math = buildMathTopic(day);
    const english = buildEnglishTopic(day);
    const gkNew = buildGkNewTopic(day);
    const gkRev = buildGkRevTopic(day);
    const dataScience = buildDsTopic(day);

    trackerData.push({
      day,
      tasks: [
        { id: `d${day}_t1`, title: `Math (1h): ${math}`, completed: false },
        { id: `d${day}_t2`, title: `English (1h): ${english}`, completed: false },
        { id: `d${day}_t3`, title: `GK New (1h): ${gkNew}`, completed: false },
        { id: `d${day}_t4`, title: `GK Rev (30m): ${gkRev}`, completed: false },
        { id: `d${day}_t5`, title: `Data Science (2h): ${dataScience}`, completed: false },
      ],
    });
  }

  return trackerData;
};

/* ------------------------------------------------------------------ *
 *  TASK PARSING
 * ------------------------------------------------------------------ */
const DURATION_PATTERN = /^(.+?)\s*\(([^)]+)\):\s*(.+)$/;

const durationToHours = (label: string): number => {
  const hoursMatch = label.match(/^(\d+(?:\.\d+)?)h$/i);
  if (hoursMatch) return Number(hoursMatch[1]);
  const minsMatch = label.match(/^(\d+)m$/i);
  if (minsMatch) return Number(minsMatch[1]) / 60;
  const combined = label.match(/^(?:(\d+(?:\.\d+)?)h)?\s*(?:(\d+)m)?$/i);
  if (combined) {
    const h = combined[1] ? Number(combined[1]) : 0;
    const m = combined[2] ? Number(combined[2]) : 0;
    if (h || m) return h + m / 60;
  }
  return 1;
};

export const parseTaskMeta = (task: TrackerTask): ParsedTaskMeta => {
  const match = task.title.match(DURATION_PATTERN);

  if (!match) {
    return {
      id: task.id,
      rawTitle: task.title,
      subjectKey: 'math',
      subjectLabel: 'Study',
      durationLabel: '1h',
      durationHours: 1,
      topic: task.title,
      isRapidRevision: false,
      isMockBlock: false,
    };
  }

  const [, rawSubject, rawDuration, rawTopic] = match;
  const subjectLabel = rawSubject.trim();
  const durationLabel = rawDuration.trim();
  const topic = rawTopic.trim();

  const keyMap: Record<string, SubjectKey> = {
    Math: 'math',
    English: 'english',
    'GK New': 'gkNew',
    'GK Rev': 'gkRev',
    'Data Science': 'dataScience',
  };

  return {
    id: task.id,
    rawTitle: task.title,
    subjectKey: keyMap[subjectLabel] ?? 'math',
    subjectLabel,
    durationLabel,
    durationHours: durationToHours(durationLabel),
    topic,
    isRapidRevision: /⚡Rev/.test(topic),
    isMockBlock: /Mock|PYQ Marathon|Revision Test/i.test(topic),
  };
};

/** Returns the active GK subject name for a given day. */
export const getGkSubjectForDay = (day: number): string => {
  const found = GK_SEQUENCE.find((g) => day >= g.startDay && day <= g.endDay);
  return found ? found.subject : 'Current Affairs';
};

/* ------------------------------------------------------------------ *
 *  SUBJECT DESIGN TOKENS
 * ------------------------------------------------------------------ */
export const SUBJECT_STYLES: Record<
  SubjectKey,
  {
    name: string;
    shortName: string;
    chip: string;
    chipText: string;
    barColor: string;
    solidBg: string;
    rail: string;
    hex: string;
  }
> = {
  math: {
    name: 'Quantitative Math (Revision Track)',
    shortName: 'Math',
    chip: 'bg-blue-50 border-blue-200/80',
    chipText: 'text-blue-700',
    barColor: 'bg-blue-600',
    solidBg: 'bg-blue-600',
    rail: 'bg-blue-600',
    hex: '#2563EB',
  },
  english: {
    name: 'English Language',
    shortName: 'English',
    chip: 'bg-indigo-50 border-indigo-200/80',
    chipText: 'text-indigo-700',
    barColor: 'bg-indigo-500',
    solidBg: 'bg-indigo-500',
    rail: 'bg-indigo-500',
    hex: '#6366F1',
  },
  gkNew: {
    name: 'GK — New Topics',
    shortName: 'GK New',
    chip: 'bg-teal-50 border-teal-200/80',
    chipText: 'text-teal-700',
    barColor: 'bg-teal-600',
    solidBg: 'bg-teal-600',
    rail: 'bg-teal-600',
    hex: '#0D9488',
  },
  gkRev: {
    name: 'GK — Spaced Revision',
    shortName: 'GK Rev',
    chip: 'bg-amber-50 border-amber-200/80',
    chipText: 'text-amber-700',
    barColor: 'bg-amber-500',
    solidBg: 'bg-amber-500',
    rail: 'bg-amber-500',
    hex: '#F59E0B',
  },
  dataScience: {
    name: 'Data Science & AlgoMath',
    shortName: 'Data Sci',
    chip: 'bg-sky-50 border-sky-200/80',
    chipText: 'text-sky-700',
    barColor: 'bg-sky-500',
    solidBg: 'bg-sky-500',
    rail: 'bg-sky-500',
    hex: '#0EA5E9',
  },
};

export const SUBJECT_ORDER: SubjectKey[] = [
  'math',
  'english',
  'gkNew',
  'gkRev',
  'dataScience',
];

/* ------------------------------------------------------------------ *
 *  SIX 30-DAY PHASES
 * ------------------------------------------------------------------ */
export const PHASE_BLOCKS: PhaseBlock[] = [
  {
    id: 1,
    code: 'P1',
    label: 'Days 1–30',
    subtitle: 'Rapid Revisit & Python Core',
    startDay: 1,
    endDay: 30,
    mathFocus: 'Arithmetic Sprints + Algebra/Trig Recall (1h)',
    gkFocus: 'Polity ⚡Rev (12d) → History Rev + Ancient/Medieval',
    englishFocus: 'Vocab Roots → Subject-Verb Agreement & Tenses',
    dsFocus: 'Python Core → NumPy → Pandas Fundamentals',
  },
  {
    id: 2,
    code: 'P2',
    label: 'Days 31–60',
    subtitle: 'Static GK Foundation & Data Wrangling',
    startDay: 31,
    endDay: 60,
    mathFocus: 'Geometry & Mensuration Recall (1h)',
    gkFocus: 'Static GK — Awards, Books, Sports, UN, ISRO/DRDO',
    englishFocus: 'Prepositions, Modals → Error Spotting Drills',
    dsFocus: 'Pandas Mastery → SQL Joins & Window Functions',
  },
  {
    id: 3,
    code: 'P3',
    label: 'Days 61–90',
    subtitle: 'Geography Intensive & EDA/Visualization',
    startDay: 61,
    endDay: 90,
    mathFocus: 'Number System, LCM/HCF, DI → Sectional Mocks',
    gkFocus: 'Geography — Physical, Indian, Agriculture, World Map',
    englishFocus: 'Idioms & One-Words → Reading Comprehension',
    dsFocus: 'Data Cleaning → EDA → Matplotlib/Seaborn Storytelling',
  },
  {
    id: 4,
    code: 'P4',
    label: 'Days 91–120',
    subtitle: 'Economics Deep Dive & Market Data',
    startDay: 91,
    endDay: 120,
    mathFocus: 'Alternating Sectional Mocks + Error Analysis',
    gkFocus: 'Economics — RBI, Budget, GST, BoP → Science ⚡Rev',
    englishFocus: 'RC + Cloze → Para Jumbles & Rearrangement',
    dsFocus: 'APIs/Scraping → Time Series → RSI, MACD, EMA',
  },
  {
    id: 5,
    code: 'P5',
    label: 'Days 121–150',
    subtitle: 'Science, Statistics & Dashboards',
    startDay: 121,
    endDay: 150,
    mathFocus: 'Alternating Sectional Mocks + Error Analysis',
    gkFocus: 'Biology (New) + Sci-Tech + Economics Recall',
    englishFocus: 'Active/Passive, Spellings → English Sectional Mocks',
    dsFocus: 'Backtesting → Statistics → React/Recharts Dashboards',
  },
  {
    id: 6,
    code: 'P6',
    label: 'Days 151–180',
    subtitle: 'Current Affairs & Capstone Portfolio',
    startDay: 151,
    endDay: 180,
    mathFocus: 'Alternating Sectional Mocks + Error Analysis',
    gkFocus: 'Current Affairs (1 Year) + Full GK Mega Revision',
    englishFocus: 'English Sectional Mocks + Vocab Spaced Revision',
    dsFocus: 'AlgoMath Case Studies → 3 Capstone Projects + Deploy',
  },
];

/* ------------------------------------------------------------------ *
 *  FULL SYLLABUS BLUEPRINT (for the modal)
 * ------------------------------------------------------------------ */
export const CURRICULUM_ROADMAP = {
  summary: [
    {
      key: 'math' as SubjectKey,
      title: 'Math — Revision Track',
      daily: '1h / day',
      totalHours: 180,
      note: 'Entire syllabus already covered once → speed drills + timed mocks only',
    },
    {
      key: 'english' as SubjectKey,
      title: 'English — Specified Syllabus',
      daily: '1h / day',
      totalHours: 180,
      note: '9 micro-modules: roots, grammar, error spotting, idioms, RC, jumbles',
    },
    {
      key: 'gkNew' as SubjectKey,
      title: 'GK New — 7-Subject Sequence',
      daily: '1h / day',
      totalHours: 180,
      note: 'Polity → History → Static GK → Geography → Economics → Science → CA',
    },
    {
      key: 'gkRev' as SubjectKey,
      title: 'GK Rev — Spaced Repetition',
      daily: '30m / day',
      totalHours: 90,
      note: 'PYQ drills + flashcards, always revising previously finished ground',
    },
    {
      key: 'dataScience' as SubjectKey,
      title: 'Data Science — 15 Skill Blocks',
      daily: '2h / day',
      totalHours: 360,
      note: 'Python → NumPy → Pandas → SQL → EDA → Viz → APIs → Indicators → Capstone',
    },
  ],
  english: [
    { range: 'Days 1–15', startDay: 1, endDay: 15, topic: 'Vocabulary — 20 New Words/Day + Latin/Greek Roots' },
    { range: 'Days 16–30', startDay: 16, endDay: 30, topic: 'Subject-Verb Agreement, Tenses, Articles' },
    { range: 'Days 31–45', startDay: 31, endDay: 45, topic: 'Prepositions, Conjunctions, Modals' },
    { range: 'Days 46–60', startDay: 46, endDay: 60, topic: 'Error Spotting + Sentence Improvement (40 Q)' },
    { range: 'Days 61–75', startDay: 61, endDay: 75, topic: 'Idioms, Phrases & One-Word Substitution' },
    { range: 'Days 76–95', startDay: 76, endDay: 95, topic: 'Reading Comprehension + Cloze Test' },
    { range: 'Days 96–115', startDay: 96, endDay: 115, topic: 'Para Jumbles, Fill-in-the-Blanks, Rearrangement' },
    { range: 'Days 116–135', startDay: 116, endDay: 135, topic: 'Active/Passive, Direct/Indirect & Spellings' },
    { range: 'Days 136–180', startDay: 136, endDay: 180, topic: 'English Sectional Mock (50 Q) + Vocab Spaced Revision' },
  ],
  math: [
    { range: 'Days 1–10', startDay: 1, endDay: 10, topic: 'Arithmetic Sprint — Percentage, Profit/Loss, Discount' },
    { range: 'Days 11–20', startDay: 11, endDay: 20, topic: 'Arithmetic Sprint — Ratio, Mixture, Time & Work' },
    { range: 'Days 21–30', startDay: 21, endDay: 30, topic: 'Arithmetic Sprint — SI/CI, Speed-Time-Distance' },
    { range: 'Days 31–42', startDay: 31, endDay: 42, topic: 'Algebra & Trigonometry — Identity Recall + Sprints' },
    { range: 'Days 43–56', startDay: 43, endDay: 56, topic: 'Geometry & Mensuration — Theorem Recall + Sprints' },
    { range: 'Days 57–66', startDay: 57, endDay: 66, topic: 'Number System, LCM/HCF & Data Interpretation' },
    { range: 'Days 67–180', startDay: 67, endDay: 180, topic: 'Odd Days: Sectional Mock (30Q/20m) • Even Days: Error Analysis' },
  ],
};
