import React from 'react';
import { CalendarCheck, CalendarDays, Clock3, TrendingUp } from 'lucide-react';
import { PHASE_BLOCKS, STUDY_TRACKS, StudyTrack } from '../data/trackerGenerator';
import { TelemetryStats } from '../utils/storage';

interface OverviewHeroProps {
  studyTrack: StudyTrack;
  telemetry: TelemetryStats;
  startDate: string;
  onChangeStartDate: (value: string) => void;
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({
  studyTrack,
  telemetry,
  startDate,
  onChangeStartDate,
}) => {
  const track = STUDY_TRACKS[studyTrack];
  const phase = PHASE_BLOCKS.find(
    (item) => item.id === Math.ceil(telemetry.currentTargetDay / 30)
  ) ?? PHASE_BLOCKS[0];
  const phaseSubtitle = studyTrack === 'cgl' ? phase.cglSubtitle : phase.dataAnalysisSubtitle;

  return (
    <section aria-label="Study plan summary" className="summary-grid">
      <article className="summary-card summary-card--target">
        <div className="summary-card-head">
          <span className="summary-card-label">Next study day</span>
          <span className="summary-icon summary-icon--blue"><CalendarCheck size={18} /></span>
        </div>
        <div className="summary-card-value">
          <strong className="num">{String(telemetry.currentTargetDay).padStart(3, '0')}</strong>
          <span>of 180</span>
        </div>
        <div className="summary-card-foot">
          <span>{phase.code} · {phaseSubtitle}</span>
          <label className="summary-date-control" title="Set the calendar date for Day 1">
            <CalendarDays size={12} />
            <span>Start</span>
            <input
              type="date"
              aria-label="Start date for Day 1"
              value={startDate}
              onChange={(event) => onChangeStartDate(event.target.value)}
            />
          </label>
        </div>
      </article>

      <article className="summary-card summary-card--hours">
        <div className="summary-card-head">
          <span className="summary-card-label">Study time logged</span>
          <span className="summary-icon summary-icon--mint"><Clock3 size={18} /></span>
        </div>
        <div className="summary-card-value">
          <strong className="num">{telemetry.loggedHours.toFixed(1)}</strong>
          <span>hours</span>
        </div>
        <div className="summary-card-foot">
          <span>{telemetry.remainingHours.toFixed(1)}h remaining</span>
          <span>{track.dailyHours}h planned each day</span>
        </div>
      </article>

      <article className="summary-card summary-card--progress">
        <div className="summary-card-head">
          <span className="summary-card-label">Plan progress</span>
          <span className="summary-icon summary-icon--peach"><TrendingUp size={18} /></span>
        </div>
        <div className="summary-card-value">
          <strong className="num">{telemetry.overallPercent}%</strong>
          <span>{telemetry.daysCompleted} days cleared</span>
        </div>
        <div className="summary-progress-track" aria-label={`${telemetry.overallPercent}% complete`}>
          <div className="summary-progress-fill" style={{ width: `${telemetry.overallPercent}%` }} />
        </div>
        <div className="summary-card-foot">
          <span>{telemetry.completedTasks} / {telemetry.totalTasks} tasks</span>
          <span>{track.dailyTasks} {track.dailyTasks === 1 ? 'block' : 'blocks'} / day</span>
        </div>
      </article>
    </section>
  );
};
