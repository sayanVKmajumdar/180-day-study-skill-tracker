import React from 'react';
import { StudyTrack } from '../data/trackerGenerator';
import {
  ArrowDownUp,
  Bookmark,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  Clock3,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  Search,
  X,
} from 'lucide-react';

export type StatusFilter =
  | 'all'
  | 'incomplete'
  | 'in-progress'
  | 'completed'
  | 'bookmarked'
  | 'with-notes'
  | 'rapid-rev';

export type ViewMode = 'grid' | 'list';

interface FilterToolbarProps {
  studyTrack: StudyTrack;
  statusFilter: StatusFilter;
  onChangeStatusFilter: (f: StatusFilter) => void;
  searchQuery: string;
  onChangeSearchQuery: (q: string) => void;
  viewMode: ViewMode;
  onChangeViewMode: (m: ViewMode) => void;
  filteredCount: number;
  totalInPhaseCount: number;
  bookmarkCount: number;
  notesCount: number;
  hideCompleted: boolean;
  onToggleHideCompleted: () => void;
  clearedInView: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  studyTrack,
  statusFilter,
  onChangeStatusFilter,
  searchQuery,
  onChangeSearchQuery,
  viewMode,
  onChangeViewMode,
  filteredCount,
  totalInPhaseCount,
  bookmarkCount,
  notesCount,
  hideCompleted,
  onToggleHideCompleted,
  clearedInView,
}) => {
  const filters: {
    id: StatusFilter;
    label: string;
    icon?: React.ReactNode;
    badge?: number;
  }[] = [
    { id: 'all', label: 'Up next queue' },
    { id: 'incomplete', label: 'Untouched', icon: <CircleDashed className="h-3 w-3 text-slate-400" /> },
    { id: 'in-progress', label: 'In progress', icon: <Clock3 className="h-3 w-3 text-blue-500" /> },
    {
      id: 'completed',
      label: 'Completed days',
      icon: <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
    },
    {
      id: 'rapid-rev',
      label: '⚡ Rapid-rev days',
    },
    {
      id: 'bookmarked',
      label: 'Flagged',
      icon: <Bookmark className="h-3 w-3 text-amber-500" />,
      badge: bookmarkCount,
    },
    {
      id: 'with-notes',
      label: 'With logs',
      icon: <ClipboardList className="h-3 w-3 text-teal-600" />,
      badge: notesCount,
    },
  ];
  const visibleFilters = filters.filter(
    (filter) => studyTrack === 'cgl' || filter.id !== 'rapid-rev'
  );

  return (
    <div className="surface flex flex-col gap-3 p-3.5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
          {visibleFilters.map((f) => {
            const active = statusFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onChangeStatusFilter(f.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition cursor-pointer ${
                  active
                    ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm shadow-blue-600/10'
                    : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white'
                }`}
              >
                {f.icon}
                <span>{f.label}</span>
                {typeof f.badge === 'number' && f.badge > 0 && (
                  <span className="num rounded-full bg-slate-200/80 px-1.5 py-px text-[9px] font-extrabold text-slate-700">
                    {f.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onChangeSearchQuery(e.target.value)}
              placeholder="Search day, topic, note… (SQL, Polity, Python)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-8 pr-7 text-[11.5px] font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onChangeSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <span className="num text-[10.5px] font-bold text-slate-500">
            <span className="text-slate-900">{filteredCount}</span> / {totalInPhaseCount} days
          </span>

          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100/70 p-0.5">
            <button
              type="button"
              onClick={() => onChangeViewMode('grid')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('list')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Compact table view"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Compact</span>
            </button>
          </div>
        </div>
      </div>

      {/* Queue-mode strip: cleared days removed from top, next day pinned on top */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <ArrowDownUp className="h-3.5 w-3.5" />
          </span>
          <span>
            Queue mode:{' '}
            <span className="font-extrabold text-slate-900">
              {hideCompleted ? 'cleared days removed — next day stays on top' : 'cleared days sink to the bottom'}
            </span>
          </span>
          {clearedInView > 0 && (
            <span className="num rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
              {clearedInView} cleared
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleHideCompleted}
          aria-pressed={hideCompleted}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition cursor-pointer ${
            hideCompleted
              ? 'border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
          title={hideCompleted ? 'Show cleared days again' : 'Hide cleared days from the queue'}
        >
          {hideCompleted ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {hideCompleted ? 'Cleared hidden' : 'Cleared visible'}
          {/* Mini switch */}
          <span
            className={`relative inline-flex h-4 w-7 items-center rounded-full transition ${
              hideCompleted ? 'bg-white/30' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition ${
                hideCompleted ? 'translate-x-3.5' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>
      </div>
    </div>
  );
};
