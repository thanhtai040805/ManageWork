import { useState, useEffect } from "react";
import { Clock, Trash2, Plus, X } from "lucide-react";
import { timeService } from "../../services/time.service";

export const TimeTracker = ({ taskId }) => {
  const [entries, setEntries] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ hours: 0, minutes: 15, description: "" });

  useEffect(() => {
    if (taskId) {
      loadEntries();
    }
  }, [taskId]);

  const loadEntries = async () => {
    try {
      const data = await timeService.getTaskEntries(taskId);
      setEntries(data || []);
      const total = await timeService.getTaskTotalTime(taskId);
      setTotalMinutes(parseInt(total) || 0);
    } catch (error) {
      console.error("Error loading time entries:", error);
    }
  };

  const formatMinutes = (mins) => {
    if (!mins) return "0m";
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs > 0) return `${hrs}h ${m}m`;
    return `${m}m`;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const totalMins = (parseInt(newEntry.hours) * 60) + parseInt(newEntry.minutes);
    if (totalMins <= 0) return;
    
    try {
      await timeService.createEntry({
        taskId,
        durationMinutes: totalMins,
        description: newEntry.description || "Manual entry"
      });
      await loadEntries();
      setShowAdd(false);
      setNewEntry({ hours: 0, minutes: 15, description: "" });
    } catch (error) {
      console.error("Error adding time:", error);
    }
  };

  const handleDelete = async (entryId) => {
    try {
      await timeService.deleteEntry(entryId);
      await loadEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Time Logged</span>
        </div>
        {totalMinutes > 0 && (
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            {formatMinutes(totalMinutes)}
          </span>
        )}
      </div>

      {/* Add button */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          Add time
        </button>
      ) : (
        <form onSubmit={handleAdd} className="space-y-2 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="23"
                value={newEntry.hours}
                onChange={(e) => setNewEntry({ ...newEntry, hours: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border rounded"
                placeholder="Hours"
              />
            </div>
            <span className="text-slate-400">h</span>
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="59"
                value={newEntry.minutes}
                onChange={(e) => setNewEntry({ ...newEntry, minutes: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border rounded"
                placeholder="Minutes"
              />
            </div>
            <span className="text-slate-400">m</span>
          </div>
          <input
            type="text"
            value={newEntry.description}
            onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
            className="w-full px-2 py-1 text-sm border rounded"
            placeholder="Description (optional)"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="flex-1 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* Entries list */}
      {entries.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-slate-100">
          {entries.slice(0, 5).map((entry) => (
            <div key={entry.entry_id} className="flex items-center justify-between text-sm group">
              <div className="flex-1">
                <span className="text-slate-700">{formatMinutes(entry.duration_minutes)}</span>
                {entry.description && (
                  <span className="text-slate-400 text-xs ml-2">{entry.description}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(entry.entry_id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && !showAdd && (
        <p className="text-xs text-slate-400 text-center py-2">No time logged yet</p>
      )}
    </div>
  );
};