import { useState, useEffect } from "react";
import { Activity, Clock, Plus, Calendar, Filter, Search } from "lucide-react";
import { activityService } from "../../services/activity.service";

export const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [daysFilter, setDaysFilter] = useState(7);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    loadActivities();
    loadStats();
  }, [daysFilter, actionFilter, selectedDate]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (daysFilter) params.days = daysFilter;
      if (selectedDate) params.date = selectedDate;
      const data = await activityService.getUserActivity(params);
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const filterDays = selectedDate ? 365 : daysFilter;
      const data = await activityService.getActivityStats(filterDays);
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const actionFilters = [
    { id: "all", label: "All", pattern: "" },
    { id: "task_created", label: "Created", pattern: "Created task" },
    { id: "task_updated", label: "Updated", pattern: "Updated task" },
    { id: "task_completed", label: "Done", pattern: "Completed task" },
  ];

  const formatStat = (val) => Number(val) || 0;

  const filteredActivities = activities.filter((activity) => {
    const filter = actionFilters.find(f => f.id === actionFilter);
    if (!filter?.pattern) return true;
    return activity.action?.includes(filter.pattern);
  }).filter((activity) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return activity.action?.toLowerCase().includes(search) ||
      activity.task_title?.toLowerCase().includes(search) ||
      activity.project_name?.toLowerCase().includes(search);
  });

  return (
    <div className="h-full bg-slate-50/50 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Activity</h1>
            <p className="text-slate-500 mt-1">Track all project activities</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatStat(stats.total_activities)}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Created</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{formatStat(stats.created_activities)}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Updated</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{formatStat(stats.updated_activities)}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{formatStat(stats.completed_activities)}</p>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-[40px]! pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            />
          </div>
          
          {/* Days Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {[
              { id: 7, label: "7 days" },
              { id: 14, label: "14 days" },
              { id: 30, label: "30 days" },
            ].map((day) => (
              <button
                key={day.id}
                onClick={() => { setDaysFilter(day.id); setSelectedDate(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  daysFilter === day.id && !selectedDate
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); if (e.target.value) setDaysFilter(7); }}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          />

          {/* Action Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {[
              { id: "all", label: "All", pattern: "" },
              { id: "task_created", label: "Created", pattern: "Created" },
              { id: "task_updated", label: "Updated", pattern: "Updated" },
              { id: "task_completed", label: "Done", pattern: "Completed" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActionFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  actionFilter === filter.id
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">History</h2>
            <span className="text-xs text-slate-500">{filteredActivities.length} activities</span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-pulse flex items-center justify-center gap-3">
                <Activity className="w-6 h-6 text-slate-300" />
                <span className="text-slate-400">Loading...</span>
              </div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium">No activity yet</p>
              <p className="text-sm text-slate-400 mt-1">Start working on tasks to see activity here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredActivities.map((activity) => (
                <div key={activity.log_id} className="p-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{formatAction(activity.action)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                        {activity.task_title && (
                          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {activity.task_title}
                          </span>
                        )}
                        {activity.project_name && (
                          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {activity.project_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};