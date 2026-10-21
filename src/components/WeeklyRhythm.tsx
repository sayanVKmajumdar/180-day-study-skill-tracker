import React from 'react';
import { Check, Flame } from 'lucide-react';
import { DayTrackerItem, TOTAL_DAYS } from '../data/trackerGenerator';
import { getProjectedDateLabel, TelemetryStats } from '../utils/storage';

interface WeeklyRhythmProps {
  days: DayTrackerItem[];
  currentTargetDay: number;
  focusedDay: number;
  startDate: string;
  telemetry: TelemetryStats;
  onSelectDay: (day: number) => void;
}

export const WeeklyRhythm: React.FC<WeeklyRhythmProps> = ({
  days,
  currentTargetDay,
  focusedDay,
  startDate,
  telemetry,
  onSelectDay,
}) => {
  const weekStart = Math.max(
    1,
    Math.min(TOTAL_DAYS - 6, Math.floor((currentTargetDay - 1) / 7) * 7 + 1)
  );
  const week = Array.from({ length: 7 }, (_, index) => {
    const dayNumber = weekStart + index;
    return days.find((day) => day.day === dayNumber);
  }).filter((day): day is DayTrackerItem => Boolean(day));
  const weekNumber = Math.ceil(weekStart / 7);

  return (
    <section className="dashboard-card rhythm-panel" aria-label="Weekly study rhythm">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Small steps, repeated</p>
          <h2>Habits</h2>
        </div>
        <span className="streak-chip"><Flame size={13} /> {telemetry.activeStreak} day streak</span>
      </div>

      <p className="rhythm-caption">Week {String(weekNumber).padStart(2, '0')} · Days {weekStart}–{week[week.length - 1]?.day}</p>

      <div className="rhythm-grid">
        {week.map((day) => {
          const completed = day.tasks.filter((task) => task.completed).length;
          const percent = Math.round((completed / Math.max(day.tasks.length, 1)) * 100);
          const isComplete = completed === day.tasks.length;
          const isActive = day.day === currentTargetDay;
          const date = getProjectedDateLabel(day.day, startDate);
          let weekday = `D${day.day}`;
          if (startDate) {
            const dateObj = new Date(`${startDate}T00:00:00`);
            dateObj.setDate(dateObj.getDate() + day.day - 1);
            weekday = dateObj.toLocaleDateString('en', { weekday: 'short' });
          }

          return (
            <button
              key={day.day}
              type="button"
              onClick={() => onSelectDay(day.day)}
              className={`rhythm-day${isActive ? ' is-target' : ''}${day.day === focusedDay ? ' is-focused' : ''}${isComplete ? ' is-complete' : ''}`}
              title={`Day ${day.day}${date ? ` · ${date}` : ''} · ${completed}/${day.tasks.length} tasks complete`}
              aria-label={`Day ${day.day}, ${completed} of ${day.tasks.length} tasks complete`}
            >
              <span className="rhythm-weekday">{weekday}</span>
              <span className="rhythm-cell">
                {isComplete ? <Check size={13} strokeWidth={2.5} /> : <span>{percent ? `${percent}%` : day.day}</span>}
              </span>
              <span className="rhythm-day-number">{String(day.day).padStart(2, '0')}</span>
            </button>
          );
        })}
      </div>

      <div className="rhythm-footer">
        <span><i className="rhythm-legend rhythm-legend--done" /> Cleared</span>
        <span><i className="rhythm-legend rhythm-legend--active" /> In progress</span>
        <span><i className="rhythm-legend rhythm-legend--empty" /> Upcoming</span>
      </div>
    </section>
  );
};
