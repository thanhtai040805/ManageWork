import { useState, useEffect } from "react";
import { Activity, Clock, User, Loader2 } from "lucide-react";
import { activityService } from "../../services/activity.service";

export const ProjectActivity = ({ projectId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadActivity();
    }
  }, [projectId]);

  const loadActivity = async () => {
    setLoading(true);
    try {
      const data = await activityService.getProjectActivity(projectId);
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading project activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
        <Activity className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No project activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
        <span className="text-xs text-slate-500">{activities.length} logs</span>
      </div>
      
      <div className="space-y-3">
        {activities.slice(0, 10).map((activity) => (
          <div key={activity.log_id} className="bg-white p-3 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <Activity size={14} className="text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 leading-snug">
                  {formatAction(activity.action)}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                   <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold">
                      {activity.full_name?.[0] || "?"}
                    </div>
                    <span className="text-[11px] text-slate-500">{activity.full_name || activity.username}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
