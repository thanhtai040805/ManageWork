import React, { useState, useEffect, useContext } from 'react';
import { Clock, Plus, Trash2, History } from 'lucide-react';
import { timeService } from '../../services/time.service';
import { AuthContext } from '../../context/authContext';
import { format } from 'date-fns';

export const TimeLog = ({ taskId }) => {
  const { auth } = useContext(AuthContext);
  const user = auth?.user;
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [formData, setFormData] = useState({
    durationMinutes: '',
    description: '',
    startedAt: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    if (taskId) {
      loadData();
    }
  }, [taskId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesRes, totalRes] = await Promise.all([
        timeService.getTaskEntries(taskId),
        timeService.getTaskTotalTime(taskId)
      ]);
      setEntries(entriesRes || []);
      setTotalMinutes(totalRes?.totalMinutes || 0);
    } catch (error) {
      console.error("Error loading time entries", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      await timeService.createEntry({
        taskId,
        durationMinutes: parseInt(formData.durationMinutes),
        description: formData.description,
        startedAt: new Date(formData.startedAt).toISOString()
      });
      setShowAddForm(false);
      setFormData({
        durationMinutes: '',
        description: '',
        startedAt: new Date().toISOString().slice(0, 16)
      });
      loadData();
    } catch (error) {
      console.error("Error adding time entry", error);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      try {
        await timeService.deleteEntry(entryId);
        loadData();
      } catch (error) {
        console.error("Error deleting time entry", error);
      }
    }
  };

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (loading && entries.length === 0) {
    return <div className="animate-pulse h-20 bg-slate-100 rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="text-slate-400" size={18} />
          <h3 className="text-sm font-semibold text-slate-800">Time Tracking</h3>
          {totalMinutes > 0 && (
            <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
              {formatDuration(totalMinutes)} total
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`p-1.5 rounded-lg transition-colors ${showAddForm ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'
            }`}
        >
          <Plus size={18} />
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddEntry} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Duration (mins)</label>
              <input
                type="number"
                required
                value={formData.durationMinutes}
                onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })}
                placeholder="e.g. 60"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
              <input
                type="datetime-local"
                value={formData.startedAt}
                onChange={e => setFormData({ ...formData, startedAt: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="What were you working on?"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition"
            >
              Add Entry
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {entries.length > 0 ? (
          entries.map(entry => (
            <div key={entry.entry_id} className="group flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  {entry.username?.substring(0, 2).toUpperCase() || '??'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">{entry.description || 'No description'}</span>
                    <span className="text-xs text-slate-400">• {formatDuration(entry.duration_minutes)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {format(new Date(entry.started_at), 'MMM d, h:mm a')}
                  </div>
                </div>
              </div>
              {user?.uid === entry.user_id && (
                <button
                  onClick={() => handleDeleteEntry(entry.entry_id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="py-2 flex items-center justify-center gap-2 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <History className=" text-slate-300" size={12} />
            <p className="text-xs text-slate-400">No time logged yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

