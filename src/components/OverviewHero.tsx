import React from 'react';
import {
  ArrowRight,
  CalendarDays,
  Clock4,
  Flame,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  PHASE_BLOCKS,
  STUDY_TRACKS,
  SUBJECT_STYLES,
  TOTAL_DAYS,
  StudyTrack,
} from '../data/trackerGenerator';
import { TelemetryStats } from '../utils/storage';

interface OverviewHeroProps {
  studyTrack: StudyTrack;
  telemetry: TelemetryStats;
  startDate: string;
  onChangeStartDate: (value: string) => void;
  onJumpToTarget: () => void;
}

const RING_RADIUS = 50;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const OverviewHero: React.FC<OverviewHeroProps> = ({
  studyTrack,
  telemetry,
  startDate,
  onChangeStartDate,
  onJumpToTarget,
}) => {
  const ringOffset = RING_CIRCUMFERENCE * (1 - telemetry.overallPercent / 100);
  const trackConfig = STUDY_TRACKS[studyTrack];
  const subjectKeys = trackConfig.subjectKeys;
  const activePhase =
    PHASE_BLOCKS.find((phase) => phase.id === Math.ceil(telemetry.currentTargetDay / 30)) ??
    PHASE_BLOCKS[0];
  const activePhaseNumber = Math.ceil(telemetry.currentTargetDay / 30);
  const activePhaseSubtitle =
    studyTrack === 'cgl' ? activePhase.cglSubtitle : activePhase.dataAnalysisSubtitle;

  const tiles = [
    {
      icon: <Target size={14} />,
      label: 'Days cleared',
      value: `${telemetry.daysCompleted}`,
      sub: `of ${TOTAL_DAYS}`,
      extra: `${telemetry.daysInProgress} in progress · ${telemetry.daysUntouched} to go`,
    },
    {
      icon: <Clock4 size={14} />,
      label: 'Hours logged',
      value: telemetry.loggedHours.toFixed(1),
      sub: `of ${telemetry.totalPossibleHours}h`,
      extra: `${telemetry.remainingHours.toFixed(1)}h remaining`,
    },
    {
      icon: <Flame size={14} />,
      label: 'Current streak',
      value: `${telemetry.activeStreak}d`,
      sub: `best ${telemetry.bestStreak}d`,
      extra: `${trackConfig.dailyHours}h planned each day`,
    },
    {
      icon: <TrendingUp size={14} />,
      label: 'Projected finish',
      value: telemetry.etaDateLabel.split(' (')[0],
      sub: telemetry.etaDateLabel.includes('(')
        ? telemetry.etaDateLabel.match(/\(([^)]+)\)/)?.[1] ?? ''
        : '',
      extra: `${telemetry.remainingTasks} tasks remaining`,
    },
  ];

  return (
    <section aria-label="Progress overview" className="overview-board">
      <div className="overview-board-top">
        <div className="overview-kicker">
          <span className="overview-kicker-dot" />
          <span>{trackConfig.label} / progress</span>
          <span className="overview-kicker-separator" />
          <span className="overview-phase-code">{activePhase.code} · {activePhase.label}</span>
        </div>
        <label className="overview-date-control">
          <CalendarDays size={13} />
          <span>DAY 1 DATE</span>
          <input
            type="date"
            aria-label="Start date for Day 1"
            value={startDate}
            onChange={(event) => onChangeStartDate(event.target.value)}
          />
        </label>
      </div>

      <div className="overview-grid">
        <div className="overview-summary">
          <p className="overview-label">{activePhase.code} · {activePhase.label} · {trackConfig.dailyHours} hours / day</p>
          <h2 className="overview-title">{activePhaseSubtitle}</h2>
          <p className="overview-description">
            {studyTrack === 'cgl'
              ? `Math: ${activePhase.mathFocus} · English: ${activePhase.englishFocus} · General Awareness: ${activePhase.gkFocus}`
              : `Analytics focus: ${activePhase.dsFocus}`}
          </p>
          <button type="button" onClick={onJumpToTarget} className="overview-action">
            <span>Continue with Day</span>
            <span className="num">{String(telemetry.currentTargetDay).padStart(3, '0')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="overview-score">
          <div className="overview-ring" role="img" aria-label={`${telemetry.overallPercent}% overall complete`}>
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle className="overview-ring-track" cx="60" cy="60" r={RING_RADIUS} />
              <circle
                className="overview-ring-progress"
                cx="60"
                cy="60"
                r={RING_RADIUS}
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <div className="overview-ring-value">
              {telemetry.overallPercent}<span>%</span>
            </div>
          </div>
          <div className="overview-score-copy">
            <span>Plan complete</span>
            <strong>{telemetry.completedTasks} / {telemetry.totalTasks} tasks</strong>
            <small>{telemetry.loggedHours.toFixed(1)} hours logged</small>
          </div>
        </div>
      </div>

      <div className="overview-stats">
        {tiles.map((tile) => (
          <article key={tile.label} className="overview-stat">
            <div className="overview-stat-label">
              <span>{tile.label}</span>
              {tile.icon}
            </div>
            <div className="overview-stat-value">
              <strong>{tile.value}</strong>
              {tile.sub && <span>{tile.sub}</span>}
            </div>
            <p className="overview-stat-extra">{tile.extra}</p>
          </article>
        ))}
      </div>

      <div className="overview-lower">
        <div className="overview-lower-block">
          <h3 className="overview-lower-title">
            <span>Phase blocks</span>
            <span className="overview-lower-note">30 days each</span>
          </h3>
          <div className="overview-phase-list">
            {PHASE_BLOCKS.map((phase) => {
              const percent = telemetry.phaseProgress[phase.id]?.percent ?? 0;
              const active = phase.id === activePhaseNumber;
              return (
                <div key={phase.id} className={`overview-phase-item${active ? ' is-active' : ''}`}>
                  <div className="overview-phase-track">
                    <div className="overview-phase-fill" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="overview-phase-meta">
                    <span>{phase.code}</span>
                    <span>{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overview-lower-block">
          <h3 className="overview-lower-title">
            <span>{studyTrack === 'cgl' ? 'Subject progress' : 'Skill progress'}</span>
            <span className="overview-lower-note">
              {studyTrack === 'cgl' ? <><Zap size={11} /> Rev = rapid revision</> : 'Daily block completion'}
            </span>
          </h3>
          <div className={`overview-subjects${subjectKeys.length === 1 ? ' is-single' : ''}`}>
            {subjectKeys.map((key) => {
              const style = SUBJECT_STYLES[key];
              const stat = telemetry.subjectStats[key];
              return (
                <div
                  key={key}
                  className="overview-subject"
                  title={`${style.name}: ${stat.logged.toFixed(1)}h of ${stat.total}h`}
                >
                  <div className="overview-subject-top">
                    <span>{style.shortName}</span>
                    <span>{stat.percent}%</span>
                  </div>
                  <div className="overview-subject-track">
                    <div className="overview-subject-fill" style={{ width: `${stat.percent}%` }} />
                  </div>
                  <div className="overview-subject-meta">
                    <span>{stat.logged.toFixed(1)}h</span>
                    <span>{stat.completedCount}/{stat.totalCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
