import { useState, useContext, useEffect } from "react";
import { 
  Hash, Lock, Plus, Search, Settings, 
  ChevronDown, ChevronRight
} from "lucide-react";
import { ThemeContext } from "@/context/themeContext";
import { useChannelStore } from "@/stores/chat/channelStore";
import { getProjectsAPI } from "@/services/project.service";

export function ChannelSidebar({ projectId, onProjectChange, onChannelSelect }) {
  const { primaryColor } = useContext(ThemeContext);
  const { channels, loading, fetchChannels, setCurrentChannel } = useChannelStore();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || null);
  const [showCreateChannel, setShowCreateChannel] = useState(false);

  useEffect(() => {
    getProjectsAPI().then((data) => {
      setProjects(data?.projects || data || []);
    });
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchChannels(selectedProjectId);
    } else {
      fetchChannels(null);
    }
  }, [selectedProjectId]);

  const handleProjectChange = (newProjectId) => {
    setSelectedProjectId(newProjectId);
    onProjectChange?.(newProjectId);
  };

  const handleChannelClick = (channel) => {
    setCurrentChannel(channel);
    onChannelSelect?.(channel);
  };

  const handleCreateChannel = () => {
    setShowCreateChannel(true);
  };

  return (
    <div className="w-[280px] h-full border-r border-gray-200/60 bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-gray-900 tracking-tight">Channels</h3>
          <button 
            onClick={handleCreateChannel}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="Add Channel"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Project Filter */}
        <select
          value={selectedProjectId || ""}
          onChange={(e) => handleProjectChange(e.target.value || null)}
          className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.project_id} value={p.project_id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto py-2 px-1 custom-scrollbar">
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            Loading...
          </div>
        ) : channels.length > 0 ? (
          <div className="space-y-0.5">
            {channels.map((channel) => (
              <div
                key={channel.channel_id}
                onClick={() => handleChannelClick(channel)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
              >
                {channel.is_public ? (
                  <Hash size={16} className="text-gray-400" />
                ) : (
                  <Lock size={16} className="text-gray-400" />
                )}
                <span className="truncate">{channel.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-400 mb-3">No channels yet</p>
            <button
              onClick={handleCreateChannel}
              className="text-xs font-semibold text-white px-4 py-2 rounded-lg"
              style={{ backgroundColor: primaryColor }}
            >
              Create Channel
            </button>
          </div>
        )}
      </div>

      {/* Modals placeholder - will be implemented */}
      {showCreateChannel && (
        <CreateChannelModal 
          projectId={selectedProjectId}
          projects={projects}
          onClose={() => setShowCreateChannel(false)}
          onSuccess={() => {
            setShowCreateChannel(false);
            fetchChannels(selectedProjectId);
          }}
        />
      )}
    </div>
  );
}

// Simple Create Channel Modal
function CreateChannelModal({ projectId, projects, onClose, onSuccess }) {
  const { primaryColor } = useContext(ThemeContext);
  const { addChannel } = useChannelStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !selectedProjectId) return;
    
    try {
      setSaving(true);
      await addChannel({
        name: name.trim(),
        description: description.trim(),
        project_id: selectedProjectId,
        is_public: isPublic,
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to create channel:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[400px] p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Create Channel</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Channel Name
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">#</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="general"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Public channel (anyone in project can join)
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              required
            >
              <option value="">Select project</option>
              {projects?.map((p) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !selectedProjectId}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChannelSidebar;