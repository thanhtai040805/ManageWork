import { useState, useEffect } from "react";
import { Plus, ListChecks, Loader2, Check, X } from "lucide-react";
import { SubtaskItem } from "./SubtaskItem";
import { 
  getTaskSubtasksAPI, 
  createSubtaskAPI, 
  toggleSubtaskAPI, 
  deleteSubtaskAPI,
  updateSubtaskAPI 
} from "../../services/subtaskService";

export const SubtaskList = ({ taskId }) => {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchSubtasks();
  }, [taskId]);

  const fetchSubtasks = async () => {
    try {
      const res = await getTaskSubtasksAPI(taskId);
      setSubtasks(res.data);
    } catch (error) {
      console.error("Failed to fetch subtasks", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newTitle.trim() === "") return;
    try {
      const res = await createSubtaskAPI(taskId, newTitle);
      setSubtasks([...subtasks, res.data]);
      setNewTitle("");
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to add subtask", error);
    }
  };

  const handleToggle = async (subtaskId) => {
    try {
      const res = await toggleSubtaskAPI(subtaskId);
      setSubtasks(subtasks.map(s => s.subtask_id === subtaskId ? res.data : s));
    } catch (error) {
      console.error("Failed to toggle subtask", error);
    }
  };

  const handleDelete = async (subtaskId) => {
    try {
      await deleteSubtaskAPI(subtaskId);
      setSubtasks(subtasks.filter(s => s.subtask_id !== subtaskId));
    } catch (error) {
      console.error("Failed to delete subtask", error);
    }
  };

  const handleUpdate = async (subtaskId, data) => {
    try {
      const res = await updateSubtaskAPI(subtaskId, data);
      setSubtasks(subtasks.map(s => s.subtask_id === subtaskId ? res.data : s));
    } catch (error) {
      console.error("Failed to update subtask", error);
    }
  };

  const completedCount = subtasks.filter(s => s.is_done).length;
  const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks size={18} className="text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Subtasks ({completedCount}/{subtasks.length})
          </h3>
        </div>
        {subtasks.length > 0 && (
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="space-y-1">
        {subtasks.map(subtask => (
          <SubtaskItem 
            key={subtask.subtask_id} 
            subtask={subtask}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      {isAdding ? (
        <div className="flex items-center gap-2 mt-2 px-3">
          <input
            autoFocus
            className="flex-1 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="What needs to be done?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") setIsAdding(false);
            }}
          />
          <button 
            onClick={handleAdd}
            className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Check size={16} />
          </button>
          <button 
            onClick={() => setIsAdding(false)}
            className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 rounded-lg transition-all group"
        >
          <Plus size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
          <span>Add subtask</span>
        </button>
      )}
    </div>
  );
};
