import { useState, useEffect } from "react";
import { Link2, Plus, X, Loader2, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import axios from "axios";
import { notificationService } from "../../services/notification.service";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8888/v1/api";

export const DependencyManager = ({ taskId, projectId }) => {
  const [dependencies, setDependencies] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, [taskId]);

  const fetchData = async () => {
    try {
      const [depRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/dependencies/task/${taskId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }),
        axios.get(`${API_URL}/tasks`, { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } })
      ]);
      setDependencies(depRes?.data?.data || []);
      setAvailableTasks((tasksRes?.data?.data || []).filter(t => t.task_id !== taskId));
    } catch (error) {
      console.error("Failed to fetch dependencies", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (dependsOnTaskId) => {
    try {
      const res = await axios.post(`${API_URL}/dependencies/create`, 
        { taskId, dependsOnTaskId, dependencyType: "blocking" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );
      // Re-fetch to get titles
      fetchData();
      setIsAdding(false);
    } catch (error) {
      notificationService.error(error.response?.data?.message || "Failed to add dependency");
    }
  };

  const handleDelete = async (dependencyId) => {
    try {
      await axios.delete(`${API_URL}/dependencies/${dependencyId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setDependencies(dependencies.filter(d => d.dependency_id !== dependencyId));
    } catch (error) {
      console.error("Failed to delete dependency", error);
    }
  };

  if (loading) return <Loader2 className="animate-spin text-slate-400" size={16} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 size={18} className="text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Dependencies
          </h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
        >
          <Plus size={12} />
          Add Dependency
        </button>
      </div>

      <div className="space-y-2">
        {dependencies.map(dep => (
          <div 
            key={dep.dependency_id}
            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-amber-200 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={dep.depends_on_status === 'done' ? 'text-emerald-500' : 'text-amber-500'}>
                {dep.depends_on_status === 'done' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{dep.depends_on_title}</p>
                <p className="text-xs text-slate-400">Blocks this task • {dep.depends_on_status}</p>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(dep.dependency_id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {dependencies.length === 0 && !isAdding && (
          <div className="py-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <p className="text-sm text-slate-400">No dependencies set.</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg space-y-3">
          <input
            autoFocus
            className="w-full text-sm border-b border-slate-200 focus:border-indigo-500 focus:outline-none py-1"
            placeholder="Search tasks to depend on..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-48 overflow-y-auto space-y-1">
            {availableTasks
              .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
              .filter(t => !dependencies.some(d => d.depends_on_task_id === t.task_id))
              .map(task => (
                <button
                  key={task.task_id}
                  onClick={() => handleAdd(task.task_id)}
                  className="w-full text-left px-2 py-2 text-xs rounded-lg hover:bg-slate-50 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Circle size={12} className="text-slate-300" />
                    <span className="truncate max-w-[200px]">{task.title}</span>
                  </div>
                  <Plus size={12} className="opacity-0 group-hover:opacity-100 text-indigo-500" />
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
