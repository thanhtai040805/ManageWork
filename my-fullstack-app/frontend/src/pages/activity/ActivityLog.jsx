import { useState, useEffect } from "react";
import { Activity, Calendar, Filter } from "lucide-react";
import { activityService } from "../../services/activity.service";

export const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadActivities();
    loadStats();
  }, [filter]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await activityService.getUserActivity({ limit: 50 });
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await activityService.getActivityStats(30);
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const formatAction = (action) => {
    return action;
  };

  const formatStat = (val) => Number(val) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <Activity className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Activity Log</h1>
            <p className="text-sm text-slate-500">Track all project activities</p>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Activities</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{formatStat(stats.total_activities)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Created</p>
            <p className="text-3xl font-black text-emerald-600 mt-2">{formatStat(stats.created_activities)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Updated</p>
            <p className="text-3xl font-black text-amber-600 mt-2">{formatStat(stats.updated_activities)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Completed</p>
            <p className="text-3xl font-black text-rose-600 mt-2">{formatStat(stats.completed_activities)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">History</h2>
          <span className="text-sm text-slate-500">{activities.length} activities</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-pulse flex items-center justify-center gap-3">
              <Activity className="w-6 h-6 text-slate-300" />
              <span className="text-slate-400">Loading...</span>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-slate-300" />
            </div>
<p className="text-slate-500 font-medium">No activity yet</p>
              <p className="text-sm text-slate-400 mt-1">Start working on tasks to see activity here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {activities.map((activity) => (
              <div key={activity.log_id} className="p-5 hover:bg-slate-50 transition">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{formatAction(activity.action)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-500">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                      {activity.task_title && (
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {activity.task_title}
                        </span>
                      )}
                      {activity.project_name && (
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
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
  );
};