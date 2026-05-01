import { useState, useEffect } from "react";
import { Tag as TagIcon, Plus, X, Loader2, Check } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8888/v1/api";

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#64748b"
];

export const TagManager = ({ taskId }) => {
  const [allTags, setAllTags] = useState([]);
  const [taskTags, setTaskTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    fetchData();
  }, [taskId]);

  const fetchData = async () => {
    try {
      const [allRes, taskRes] = await Promise.all([
        axios.get(`${API_URL}/tags`, { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }),
        axios.get(`${API_URL}/tags/task/${taskId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } })
      ]);
      setAllTags(allRes?.data?.data || []);
      setTaskTags(taskRes?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch tags", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttach = async (tagId) => {
    try {
      await axios.post(`${API_URL}/tags/attach`, 
        { taskId, tagId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );
      const tag = allTags.find(t => t.tag_id === tagId);
      if (tag) {
        setTaskTags([...taskTags, tag]);
      } else {
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to attach tag", error);
    }
  };

  const handleDetach = async (tagId) => {
    try {
      await axios.delete(`${API_URL}/tags/detach/${taskId}/${tagId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setTaskTags(taskTags.filter(t => t.tag_id !== tagId));
    } catch (error) {
      console.error("Failed to detach tag", error);
    }
  };

  const handleCreateAndAttach = async () => {
    if (!newTagName.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/tags/create`, 
        { name: newTagName, color: selectedColor },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );
      const newTag = res?.data?.data;
      if (newTag) {
        setAllTags([...allTags, newTag]);
        await handleAttach(newTag.tag_id);
        setNewTagName("");
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Failed to create tag", error);
    }
  };

  if (loading) return <Loader2 className="animate-spin text-slate-400" size={16} />;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TagIcon size={14} className="text-slate-500" />
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags</label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(taskTags || []).map(tag => {
          if (!tag) return null;
          const tagColor = tag?.color || "#64748b";
          const tagName = tag?.name || "Unnamed";
          return (
          <span 
            key={tag.tag_id}
            style={{ backgroundColor: `${tagColor}15`, color: tagColor, borderColor: `${tagColor}30` }}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border group transition-all"
          >
            {tagName}
            <button 
              onClick={() => handleDetach(tag.tag_id)}
              className="hover:bg-black/5 rounded-full transition-colors"
            >
              <X size={10} />
            </button>
          </span>
          );
        })}
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
        >
          <Plus size={12} />
          Add Tag
        </button>
      </div>

      {isAdding && (
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            <input
              autoFocus
              className="w-full text-sm border-b border-slate-200 focus:border-indigo-500 focus:outline-none py-1"
              placeholder="Tag name..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-5 h-5 rounded-full transition-transform ${selectedColor === color ? 'scale-125 ring-2 ring-offset-1 ring-slate-300' : 'hover:scale-110'}`}
                />
              ))}
            </div>
          </div>

          <div className="max-h-32 overflow-y-auto space-y-1">
            {allTags
              .filter(tag => !taskTags.some(tt => tt.tag_id === tag.tag_id))
              .filter(tag => tag.name.toLowerCase().includes(newTagName.toLowerCase()))
              .map(tag => {
                const tagColor = tag?.color || "#64748b";
                return (
                <button
                  key={tag.tag_id}
                  onClick={() => handleAttach(tag.tag_id)}
                  className="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-slate-50 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tagColor }} />
                    <span>{tag.name}</span>
                  </div>
                  <Plus size={12} className="opacity-0 group-hover:opacity-100 text-slate-400" />
                </button>
              );
            })}
          </div>

          {newTagName && !allTags.some(t => t.name.toLowerCase() === newTagName.toLowerCase()) && (
            <button
              onClick={handleCreateAndAttach}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all font-medium"
            >
              <Plus size={12} />
              Create "{newTagName}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};
