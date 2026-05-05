import { useState, useContext, useEffect, useMemo } from "react";
import { 
  Hash, Lock, Plus, Search, Settings, 
  ChevronDown, ChevronRight, Folder
} from "lucide-react";
import { ThemeContext } from "@/context/themeContext";
import { useChannelStore } from "@/stores/chat/channelStore";
import { getProjectsAPI, getProjectMembersAPI } from "@/services/project.service";

export function ChannelSidebar({ projectId, onProjectChange, onChannelSelect }) {
  const { primaryColor } = useContext(ThemeContext);
  const { channels, loading, fetchChannels, setCurrentChannel } = useChannelStore();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || null);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState({});

  useEffect(() => {
    getProjectsAPI().then((data) => {
      setProjects(data?.projects || data || []);
    });
  }, []);

  useEffect(() => {
    fetchChannels(null);
  }, []);

  const groupedChannels = useMemo(() => {
    const groups = { public: [], byProject: {} };
    
    channels.forEach((channel) => {
      if (!channel.project_id) {
        groups.public.push(channel);
      } else {
        if (!groups.byProject[channel.project_id]) {
          groups.byProject[channel.project_id] = [];
        }
        groups.byProject[channel.project_id].push(channel);
      }
    });

    return groups;
  }, [channels]);

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.project_id === projectId);
    return project?.name || "Unknown Project";
  };

  const toggleProjectExpand = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

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

        <div className="flex items-center gap-2">
          <select
            value={selectedProjectId || ""}
            onChange={(e) => handleProjectChange(e.target.value || null)}
            className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.project_id} value={p.project_id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto py-2 px-1 custom-scrollbar">
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            Loading...
          </div>
        ) : channels.length === 0 ? (
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
        ) : (
          <div className="space-y-1">
            {/* Public Channels (no project) */}
            {groupedChannels.public.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Hash size={12} />
                  Public
                </div>
                {groupedChannels.public.map((channel) => (
                  <div
                    key={channel.channel_id}
                    onClick={() => handleChannelClick(channel)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer text-sm text-gray-700 ml-2"
                  >
                    <Hash size={16} className="text-gray-400" />
                    <span className="truncate">{channel.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Channels by Project */}
            {Object.entries(groupedChannels.byProject).map(([projectId, projectChannels]) => (
              <div key={projectId}>
                <div 
                  className="px-2 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded"
                  onClick={() => toggleProjectExpand(projectId)}
                >
                  {expandedProjects[projectId] ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                  <Folder size={12} />
                  {getProjectName(projectId)}
                </div>
                {expandedProjects[projectId] !== false && projectChannels.map((channel) => (
                  <div
                    key={channel.channel_id}
                    onClick={() => handleChannelClick(channel)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer text-sm text-gray-700 ml-4"
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
            ))}
          </div>
        )}
      </div>

      {showCreateChannel && (
        <CreateChannelModal 
          projectId={selectedProjectId}
          projects={projects}
          onClose={() => setShowCreateChannel(false)}
          onSuccess={() => {
            setShowCreateChannel(false);
            fetchChannels(null);
          }}
        />
      )}
    </div>
  );
}

function CreateChannelModal({ projectId, projects, onClose, onSuccess }) {
  const { primaryColor } = useContext(ThemeContext);
  const { addChannel } = useChannelStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  const [projectMembers, setProjectMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (selectedProjectId) {
      getProjectMembersAPI(selectedProjectId).then((data) => {
        setProjectMembers(data || []);
      }).catch(() => setProjectMembers([]));
    } else {
      setProjectMembers([]);
      setSelectedMembers([]);
    }
  }, [selectedProjectId]);

  const toggleMember = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      setSaving(true);
      const newChannel = await addChannel({
        name: name.trim(),
        description: description.trim(),
        project_id: selectedProjectId || null,
        is_public: isPublic,
      });

      if (newChannel && selectedMembers.length > 0) {
        const { addChannelMember } = await import("@/services/channel.service");
        for (const userId of selectedMembers) {
          await addChannelMember(newChannel.channel_id, userId, "member");
        }
      }
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
              Project (optional)
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedMembers([]);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            >
              <option value="">No project (Public)</option>
              {projects?.map((p) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProjectId && projectMembers.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Add Members (optional)
              </label>
              <div className="border border-gray-200 rounded-lg max-h-32 overflow-y-auto p-2 space-y-1">
                {projectMembers.map((member) => (
                  <label
                    key={member.user_id}
                    className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.user_id)}
                      onChange={() => toggleMember(member.user_id)}
                      className="rounded"
                    />
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.full_name} className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">
                        {member.full_name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm">{member.full_name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

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
              disabled={saving || !name.trim()}
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