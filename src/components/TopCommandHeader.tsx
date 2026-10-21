import React from 'react';
import {
  ArrowUpRight,
  BookOpenCheck,
  CalendarCheck,
  ChevronRight,
  Database,
  Grid3x3,
  RotateCcw,
} from 'lucide-react';
import { PHASE_BLOCKS, STUDY_TRACKS, StudyTrack } from '../data/trackerGenerator';
import { TelemetryStats } from '../utils/storage';

interface TopCommandHeaderProps {
  selectedTrack: StudyTrack;
  selectedPhase: number | 'all';
  onSelectPhase: (phase: number | 'all') => void;
  telemetry: TelemetryStats;
  onJumpToDay: (day: number) => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  onOpenCurriculum: () => void;
  onOpenBackup: () => void;
  onOpenResetConfirm: () => void;
}

export const TopCommandHeader: React.FC<TopCommandHeaderProps> = ({
  selectedTrack,
  selectedPhase,
  onSelectPhase,
  telemetry,
  onJumpToDay,
  showHeatmap,
  onToggleHeatmap,
  onOpenCurriculum,
  onOpenBackup,
  onOpenResetConfirm,
}) => {
  const track = STUDY_TRACKS[selectedTrack];

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="header-primary">
          <div className="header-brand-column">
            <div className="brand-lockup">
              <div className="brand-mark" aria-hidden="true">
                <BookOpenCheck size={24} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="brand-overline">Personal study system</p>
                <h1 className="brand-title">180-Day Study Tracker</h1>
              </div>
            </div>
            <nav className="header-breadcrumb" aria-label="Breadcrumb">
              <span>⌂ Home</span>
              <ChevronRight size={12} />
              <span>Study tracker</span>
              <ChevronRight size={12} />
              <strong>{track.label}</strong>
            </nav>
          </div>

          <div className="header-actions">
            <button
              type="button"
              onClick={() => onJumpToDay(telemetry.currentTargetDay)}
              className="target-action"
              title={`Jump to the next incomplete ${track.label} day`}
            >
              <CalendarCheck size={16} />
              <span>
                <span className="target-action-label">Next up · {track.dailyHours}h/day</span>
                <span className="target-action-value">Day {String(telemetry.currentTargetDay).padStart(3, '0')}</span>
              </span>
              <ArrowUpRight size={14} />
            </button>

            <button
              type="button"
              onClick={onToggleHeatmap}
              className="utility-action"
              aria-pressed={showHeatmap}
              title="Toggle the 180-day consistency matrix"
              aria-label="Toggle consistency matrix"
            >
              <Grid3x3 size={15} />
              <span className="hidden sm:inline">Matrix</span>
            </button>

            <button
              type="button"
              onClick={onOpenCurriculum}
              className="utility-action"
              title="Open the full syllabus"
              aria-label="Open syllabus"
            >
              <BookOpenCheck size={15} />
              <span className="hidden md:inline">Syllabus</span>
            </button>

            <button
              type="button"
              onClick={onOpenBackup}
              className="utility-action"
              title="Export or restore progress"
              aria-label="Backup progress"
            >
              <Database size={15} />
              <span className="hidden md:inline">Backup</span>
            </button>

            <button
              type="button"
              onClick={onOpenResetConfirm}
              className="utility-action utility-action-reset"
              title="Reset all progress"
              aria-label="Reset all progress"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        <nav className="phase-navigation no-scrollbar" aria-label="Study phases">
          <button
            type="button"
            onClick={() => onSelectPhase('all')}
            className="phase-tab"
            aria-pressed={selectedPhase === 'all'}
          >
            <span className="phase-tab-top">
              <span className="phase-tab-code">ALL / 180</span>
              <span className="phase-tab-percent">{telemetry.overallPercent}%</span>
            </span>
            <span className="phase-tab-label">All days</span>
            <span className="phase-tab-track" aria-hidden="true">
              <span className="phase-tab-fill" style={{ width: `${telemetry.overallPercent}%` }} />
            </span>
          </button>

          {PHASE_BLOCKS.map((phase) => {
            const stat = telemetry.phaseProgress[phase.id] ?? { percent: 0, completedDays: 0 };
            const isSelected = selectedPhase === phase.id;
            const subtitle = selectedTrack === 'cgl' ? phase.cglSubtitle : phase.dataAnalysisSubtitle;

            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => onSelectPhase(phase.id)}
                title={`${phase.code} — ${subtitle} · ${stat.percent}% complete`}
                className="phase-tab"
                aria-pressed={isSelected}
                data-complete={stat.percent === 100}
              >
                <span className="phase-tab-top">
                  <span className="phase-tab-code">{phase.code}</span>
                  <span className="phase-tab-percent">{stat.percent}%</span>
                </span>
                <span className="phase-tab-label">{phase.label} · {subtitle}</span>
                <span className="phase-tab-track" aria-hidden="true">
                  <span className="phase-tab-fill" style={{ width: `${stat.percent}%` }} />
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
