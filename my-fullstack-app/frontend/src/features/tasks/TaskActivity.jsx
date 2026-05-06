import { useState, useEffect } from "react";
import { Activity, Clock, User, Loader2 } from "lucide-react";
import { activityService } from "../../services/activity.service";

export const TaskActivity = ({ taskId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      loadActivity();
    }
  }, [taskId]);

  const loadActivity = async () => {
    setLoading(true);
    try {
      const data = await activityService.getTaskActivity(taskId);
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading task activity:", error);
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
        <span className="ml-3 text-slate-500 text-sm">Loading activity...</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <Activity className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No activity recorded for this task yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Activity size={18} className="text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Activity History
        </h3>
      </div>
      
      <div className="relative">
        <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-slate-100" />
        
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.log_id} className="relative flex gap-4">
              <div className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white border-2 border-slate-100 shadow-sm shrink-0">
                <Activity size={14} className="text-indigo-500" />
              </div>
              
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900 leading-tight">
                    {formatAction(activity.action)}
                  </p>
                  <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                      {activity.full_name?.[0] || activity.username?.[0] || "?"}
                    </div>
                    <span className="text-xs text-slate-600 font-medium">
                      {activity.full_name || activity.username}
                    </span>
                  </div>
                  
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
