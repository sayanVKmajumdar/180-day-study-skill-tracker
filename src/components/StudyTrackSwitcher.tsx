import React from 'react';
import { BarChart3, BookOpenCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { STUDY_TRACKS, StudyTrack } from '../data/trackerGenerator';
import { TelemetryStats } from '../utils/storage';

interface StudyTrackSwitcherProps {
  selectedTrack: StudyTrack;
  onSelectTrack: (track: StudyTrack) => void;
  cglTelemetry: TelemetryStats;
  dataAnalysisTelemetry: TelemetryStats;
}

const TRACK_CARDS = [
  { id: 'cgl' as const, icon: BookOpenCheck, index: '01' },
  { id: 'dataAnalysis' as const, icon: BarChart3, index: '02' },
];

export const StudyTrackSwitcher: React.FC<StudyTrackSwitcherProps> = ({
  selectedTrack,
  onSelectTrack,
  cglTelemetry,
  dataAnalysisTelemetry,
}) => {
  const telemetryByTrack = {
    cgl: cglTelemetry,
    dataAnalysis: dataAnalysisTelemetry,
  };

  return (
    <section aria-label="Choose a study track" className="track-switcher">
      <div className="track-section-heading">
        <div>
          <p className="section-kicker">Choose a track / 180-day plan</p>
          <h2 className="track-section-title">Two plans. Separate progress.</h2>
        </div>
        <p className="track-section-note">Switch any time; each plan keeps its own log.</p>
      </div>

      <div className="track-grid">
        {TRACK_CARDS.map(({ id, icon: Icon, index }) => {
          const config = STUDY_TRACKS[id];
          const telemetry = telemetryByTrack[id];
          const active = selectedTrack === id;

          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectTrack(id)}
              className="track-card"
              data-active={active}
            >
              <span className="track-card-head">
                <span className="track-index">{index} / TRACK</span>
                <span className="track-copy">
                  <span className="track-name">{config.label}</span>
                  <span className="track-description">{config.description}</span>
                </span>
                <span className="track-status">
                  {active ? <><CheckCircle2 size={13} /> ACTIVE</> : <><Icon size={13} /> OPEN</>}
                  <ChevronRight size={14} />
                </span>
              </span>

              <span className="track-meta">
                <span><strong>{config.dailyHours}h/day</strong> · {config.dailyTasks} {config.dailyTasks === 1 ? 'block' : 'blocks'} / day</span>
                <span><strong>{telemetry.daysCompleted}</strong> / 180 days cleared</span>
              </span>

              <span className="track-progress-track" aria-hidden="true">
                <span
                  className="track-progress-fill"
                  style={{ width: `${telemetry.overallPercent}%` }}
                />
              </span>

              <span className="track-card-foot">
                <span>{active ? 'Currently selected' : 'Select to view this plan'}</span>
                <strong>{telemetry.overallPercent}% complete</strong>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
