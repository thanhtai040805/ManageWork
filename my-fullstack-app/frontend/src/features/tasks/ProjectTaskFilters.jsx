import { useState, useMemo } from "react";
import { Filter, X, Calendar, Flag, Users, Search, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { PRIORITY_COLORS, getStatusOptionsForDisplay } from "../../utils/taskColors";

const statusOptions = getStatusOptionsForDisplay();

const priorityOptions = [
  { value: "high", label: "High", ...PRIORITY_COLORS.high },
  { value: "medium", label: "Medium", ...PRIORITY_COLORS.medium },
  { value: "low", label: "Low", ...PRIORITY_COLORS.low }
];

const quickFilters = [
  { id: "my_tasks", label: "My Tasks", icon: Users, description: "Assigned to me or created by me" },
  { id: "overdue", label: "Overdue", icon: AlertCircle, description: "Past due date" },
  { id: "this_week", label: "This Week", icon: Calendar, description: "Due this week" },
  { id: "completed", label: "Completed", icon: CheckCircle, description: "Done status" },
];

export const ProjectTaskFilters = ({
  filters,
  onFilterChange,
  members = [],
  onClearFilters,
  onSearchChange,
  searchQuery
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const memberCount = members.length;
  const showMemberSelect = memberCount >= 3;

  const hasActiveFilters = useMemo(() => {
    return filters.status?.length > 0 ||
      filters.priority?.length > 0 ||
      filters.assignee?.length > 0 ||
      filters.creator?.length > 0 ||
      filters.dateRange ||
      filters.quickFilter !== null;
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status?.length) count += filters.status.length;
    if (filters.priority?.length) count += filters.priority.length;
    if (filters.assignee?.length) count += filters.assignee.length;
    if (filters.creator?.length) count += filters.creator.length;
    if (filters.dateRange) count++;
    if (filters.quickFilter) count++;
    return count;
  }, [filters]);

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

  const toggleAssignee = (userId) => {
    const current = filters.assignee || [];
    if (userId === "me") {
      const isSelected = current.includes("me");
      onFilterChange({ ...filters, assignee: isSelected ? [] : ["me"] });
    } else {
      const updated = current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId];
      onFilterChange({ ...filters, assignee: updated });
    }
  };

  const toggleCreator = (userId) => {
    const current = filters.creator || [];
    if (userId === "me") {
      const isSelected = current.includes("me");
      onFilterChange({ ...filters, creator: isSelected ? [] : ["me"] });
    } else {
      const updated = current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId];
      onFilterChange({ ...filters, creator: updated });
    }
  };

  const handleAssigneeSelect = (e) => {
    const value = e.target.value;
    if (value === "") {
      onFilterChange({ ...filters, assignee: [] });
    } else if (value === "me") {
      onFilterChange({ ...filters, assignee: ["me"] });
    } else {
      onFilterChange({ ...filters, assignee: [value] });
    }
  };

  const handleCreatorSelect = (e) => {
    const value = e.target.value;
    if (value === "") {
      onFilterChange({ ...filters, creator: [] });
    } else if (value === "me") {
      onFilterChange({ ...filters, creator: ["me"] });
    } else {
      onFilterChange({ ...filters, creator: [value] });
    }
  };

  const handleQuickFilter = (filterId) => {
    const newQuickFilter = filters.quickFilter === filterId ? null : filterId;
    onFilterChange({ ...filters, quickFilter: newQuickFilter });
  };

  const clearAll = () => {
    onClearFilters();
    setShowFilters(false);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search tasks (e.g., priority:high assignee:me)"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-[40px]! pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange?.("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Quick Filters */}
      {quickFilters.map((qf) => (
        <button
          key={qf.id}
          onClick={() => handleQuickFilter(qf.id)}
          className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition ${filters.quickFilter === qf.id
              ? "bg-indigo-50 border-indigo-300 text-indigo-700"
              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
        >
          <qf.icon size={16} />
          {qf.label}
        </button>
      ))}

      {/* Advanced Filters Button */}
      <div className="relative">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition ${hasActiveFilters
              ? "bg-indigo-50 border-indigo-300 text-indigo-700"
              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
        >
          <Filter size={18} />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {showFilters && (
          <>
            <div className="fixed inset-0 z-0" onClick={() => setShowFilters(false)} />
            <div className="absolute top-full right-0 mt-2 w-[420px] bg-white rounded-2xl shadow-xl border border-slate-200 z-10 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Advanced Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-rose-600 hover:underline font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-4 space-y-5">
                {/* Quick Filters in Panel */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                    Quick Filters
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickFilters.map((qf) => (
                      <button
                        key={qf.id}
                        onClick={() => handleQuickFilter(qf.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition ${filters.quickFilter === qf.id
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                          }`}
                      >
                        <qf.icon size={14} />
                        <span className="font-medium">{qf.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggleStatus(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filters.status?.includes(opt.value)
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
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    Priority
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {priorityOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => togglePriority(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filters.priority?.includes(opt.value)
                            ? `${opt.bg} ${opt.text}`
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assignee Filter */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    Assignee
                  </label>
                  {showMemberSelect ? (
                    <select
                      value={filters.assignee?.[0] || ""}
                      onChange={handleAssigneeSelect}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                    >
                      <option value="">Any</option>
                      <option value="me">Me</option>
                      {members.map(member => (
                        <option key={member.user_id} value={member.user_id}>
                          {member.full_name || member.username}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleAssignee("me")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${filters.assignee?.includes("me")
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                          }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                          ME
                        </div>
                        Me
                      </button>
                      {memberCount > 1 && members.map(member => (
                        <button
                          key={member.user_id}
                          onClick={() => toggleAssignee(member.user_id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${filters.assignee?.includes(member.user_id)
                              ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                            }`}
                        >
                          <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                            {member.full_name?.[0] || member.username?.[0] || "?"}
                          </div>
                          {member.full_name || member.username || "Unknown"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Creator Filter */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    Creator
                  </label>
                  {showMemberSelect ? (
                    <select
                      value={filters.creator?.[0] || ""}
                      onChange={handleCreatorSelect}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                    >
                      <option value="">Any</option>
                      <option value="me">Me</option>
                      {members.map(member => (
                        <option key={member.user_id} value={member.user_id}>
                          {member.full_name || member.username}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleCreator("me")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${filters.creator?.includes("me")
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                          }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                          ME
                        </div>
                        Me
                      </button>
                      {memberCount > 1 && members.map(member => (
                        <button
                          key={member.user_id}
                          onClick={() => toggleCreator(member.user_id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${filters.creator?.includes(member.user_id)
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                            }`}
                        >
                          <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                            {member.full_name?.[0] || member.username?.[0] || "?"}
                          </div>
                          {member.full_name || member.username || "Unknown"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Due Date Range */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    Due Date
                  </label>
                  <select
                    value={filters.dateRange || ""}
                    onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="">Any time</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                    <option value="next_month">Next Month</option>
                    <option value="overdue">Overdue</option>
                    <option value="no_date">No Due Date</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const getDateHelpers = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return { now };
};

export const applyProjectFilters = (tasks, filters, currentUserId) => {
  let filtered = [...tasks];
  const { now } = getDateHelpers();

  // Quick filters
  if (filters.quickFilter) {
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

    switch (filters.quickFilter) {
      case "my_tasks":
        filtered = filtered.filter(t =>
          t.assigned_to === currentUserId || t.created_by === currentUserId
        );
        break;
      case "overdue":
        filtered = filtered.filter(t =>
          t.due_date && new Date(t.due_date) < now && t.status !== "done"
        );
        break;
      case "this_week":
        filtered = filtered.filter(t => {
          if (!t.due_date) return false;
          const due = new Date(t.due_date);
          return due >= now && due <= endOfWeek;
        });
        break;
      case "completed":
        filtered = filtered.filter(t => t.status === "done");
        break;
    }
  }

  // Status filter
  if (filters.status?.length > 0) {
    filtered = filtered.filter(t => filters.status.includes(t.status));
  }

  // Priority filter
  if (filters.priority?.length > 0) {
    filtered = filtered.filter(t => filters.priority.includes(t.priority));
  }

  // Assignee filter - includes "me" option
  if (filters.assignee?.length > 0) {
    filtered = filtered.filter(t => {
      if (!t.assigned_to) return false;
      // Check if any selected assignee matches
      return filters.assignee.some(a => {
        if (a === "me") return t.assigned_to === currentUserId;
        return t.assigned_to === a;
      });
    });
  }

  // Creator filter - includes "me" option
  if (filters.creator?.length > 0) {
    filtered = filtered.filter(t => {
      if (!t.created_by) return false;
      return filters.creator.some(c => {
        if (c === "me") return t.created_by === currentUserId;
        return t.created_by === c;
      });
    });
  }

  // Date range filter
  if (filters.dateRange) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    filtered = filtered.filter(t => {
      if (filters.dateRange === "no_date") return !t.due_date;
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
        case "next_month":
          return due > endOfMonth && due <= nextMonth;
        case "overdue":
          return due < now && t.status !== "done";
        default:
          return true;
      }
    });
  }

  return filtered;
};