import { useState } from "react";
import { CheckCircle2, Circle, Trash2, Edit2, X, Check } from "lucide-react";

export const SubtaskItem = ({ subtask, onToggle, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(subtask.title);

  const handleUpdate = () => {
    if (title.trim() === "") return;
    onUpdate(subtask.subtask_id, { title });
    setIsEditing(false);
  };

  return (
    <div className="group flex items-center gap-3 py-2 px-3 hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-100">
      <button
        onClick={() => onToggle(subtask.subtask_id)}
        className={`flex-shrink-0 transition-colors ${
          subtask.is_done ? "text-emerald-500" : "text-slate-300 hover:text-slate-400"
        }`}
      >
        {subtask.is_done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </button>

      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            autoFocus
            className="flex-1 bg-white border border-indigo-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdate();
              if (e.key === "Escape") {
                setTitle(subtask.title);
                setIsEditing(false);
              }
            }}
          />
          <button onClick={handleUpdate} className="text-emerald-500 hover:bg-emerald-50 p-1 rounded">
            <Check size={14} />
          </button>
          <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded">
            <X size={14} />
          </button>
        </div>
      ) : (
        <span
          className={`flex-1 text-sm transition-all cursor-pointer ${
            subtask.is_done ? "text-slate-400 line-through" : "text-slate-700"
          }`}
          onClick={() => setIsEditing(true)}
        >
          {subtask.title}
        </span>
      )}

      {!isEditing && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(subtask.subtask_id)}
            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
