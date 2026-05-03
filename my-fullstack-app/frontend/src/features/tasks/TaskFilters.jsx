import { useState, useCallback } from "react";
import { Filter, X, Calendar, Flag, FolderKanban } from "lucide-react";
import { STATUS_COLORS, PRIORITY_COLORS, getStatusOptionsForDisplay } from "../../utils/taskColors";

export const TaskFilters = ({
  filters,
  onFilterChange,
  projects = [],
  onClearFilters
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filters.status?.length > 0 || 
    filters.priority?.length > 0 || 
    filters.projectId ||
    filters.dateRange;

  const statusOptions = getStatusOptionsForDisplay();

  const priorityOptions = [
    { value: "high", label: "High", ...PRIORITY_COLORS.high },
    { value: "medium", label: "Medium", ...PRIORITY_COLORS.medium },
    { value: "low", label: "Low", ...PRIORITY_COLORS.low }
  ];

  const toggleStatus = (status) => {
    const current = filters.status || [];
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    onFilterChange({ ...filters, status: updated });
  };

  const togglePriority = (priority) => {
    const current = filters.priority || [];
    const updated = current.includes(priority)
      ? current.filter(p => p !== priority)
      : [...current, priority];
    onFilterChange({ ...filters, priority: updated });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
          hasActiveFilters 
            ? "bg-indigo-50 border-indigo-300 text-indigo-700" 
            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
        }`}
      >
        <Filter size={18} />
        <span className="font-medium">Filters</span>
        {hasActiveFilters && (
          <span className="w-5 h-5 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center">
            ✓
          </span>
        )}
      </button>

      {showFilters && (
        <>
          <div className="fixed inset-0 z-0" onClick={() => setShowFilters(false)} />
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    onClearFilters();
                    setShowFilters(false);
                  }}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleStatus(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      filters.status?.includes(opt.value)
                        ? `${opt.bg} ${opt.text}`
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Priority
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {priorityOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => togglePriority(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      filters.priority?.includes(opt.value)
                        ? `${opt.bg} ${opt.text}`
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Filter */}
            {projects.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Project
                </label>
                <select
                  value={filters.projectId || ""}
                  onChange={(e) => onFilterChange({ ...filters, projectId: e.target.value || null })}
                  className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">All Projects</option>
                  {projects.map(p => (
                    <option key={p.project_id} value={p.project_id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Due Date
              </label>
              <select
                value={filters.dateRange || ""}
                onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value || null })}
                className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">Any time</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const applyFilters = (tasks, filters) => {
  let filtered = [...tasks];

  if (filters.status?.length > 0) {
    filtered = filtered.filter(t => filters.status.includes(t.status));
  }

  if (filters.priority?.length > 0) {
    filtered = filtered.filter(t => filters.priority.includes(t.priority));
  }

  if (filters.projectId) {
    filtered = filtered.filter(t => t.project_id === filters.projectId);
  }

  if (filters.dateRange) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    filtered = filtered.filter(t => {
      if (!t.due_date) return false;
      const due = new Date(t.due_date);
      
      switch (filters.dateRange) {
        case "today":
          return due.toDateString() === now.toDateString();
        case "tomorrow":
          return due.toDateString() === tomorrow.toDateString();
        case "this_week":
          return due >= now && due <= endOfWeek;
        case "this_month":
          return due >= now && due <= endOfMonth;
        case "overdue":
          return due < now && t.status !== "done";
        default:
          return true;
      }
    });
  }

  return filtered;
};