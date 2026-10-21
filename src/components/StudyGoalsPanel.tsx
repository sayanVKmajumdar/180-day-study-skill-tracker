import React from 'react';
import { ArrowUpRight, CheckCircle2, Target } from 'lucide-react';
import {
  PHASE_BLOCKS,
  SUBJECT_STYLES,
  STUDY_TRACKS,
  StudyTrack,
} from '../data/trackerGenerator';
import { TelemetryStats } from '../utils/storage';

interface StudyGoalsPanelProps {
  studyTrack: StudyTrack;
  telemetry: TelemetryStats;
  phase: (typeof PHASE_BLOCKS)[number];
  onViewAll: () => void;
}

export const StudyGoalsPanel: React.FC<StudyGoalsPanelProps> = ({
  studyTrack,
  telemetry,
  phase,
  onViewAll,
}) => {
  const track = STUDY_TRACKS[studyTrack];
  const subtitle = studyTrack === 'cgl' ? phase.cglSubtitle : phase.dataAnalysisSubtitle;
  const phaseProgress = telemetry.phaseProgress[phase.id]?.percent ?? 0;

  return (
    <section className="dashboard-card goals-panel" aria-label="Study goals">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Plan breakdown</p>
          <h2>Goals</h2>
        </div>
        <span className="panel-heading-icon"><Target size={17} /></span>
      </div>

      <div className="goal-phase">
        <div className="goal-phase-top">
          <span className="goal-phase-code">{phase.code} · {phase.label}</span>
          <span className="goal-phase-percent">{phaseProgress}%</span>
        </div>
        <strong className="goal-phase-title">{subtitle}</strong>
        <div className="goal-phase-track">
          <div style={{ width: `${phaseProgress}%` }} />
        </div>
        <div className="goal-phase-meta">
          <span>{Math.round(telemetry.phaseProgress[phase.id]?.completedDays ?? 0)} days done</span>
          <span>{track.dailyHours}h/day</span>
        </div>
      </div>

      <div className="goal-list">
        {track.subjectKeys.map((key, index) => {
          const style = SUBJECT_STYLES[key];
          const stat = telemetry.subjectStats[key];
          return (
            <div className="goal-row" key={key}>
              <div className="goal-row-top">
                <span className="goal-name">
                  <span className={`goal-dot goal-dot--${index % 4}`} />
                  {style.shortName}
                </span>
                <strong className="goal-percent">{stat.percent}%</strong>
              </div>
              <div className="goal-track">
                <div className={`goal-fill goal-fill--${index % 4}`} style={{ width: `${stat.percent}%` }} />
              </div>
              <div className="goal-meta">
                <span>{stat.logged.toFixed(1)}h of {stat.total}h</span>
                <span>{stat.completedCount}/{stat.totalCount} tasks</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="goal-footer">
        <span><CheckCircle2 size={13} /> {telemetry.daysCompleted} / 180 days complete</span>
        <button type="button" onClick={onViewAll} title="Show all phases and days">
          Full plan <ArrowUpRight size={13} />
        </button>
      </div>
    </section>
  );
};
