import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, UserPlus, Settings as SettingsIcon, X, Save, Trash2 } from "lucide-react";
import { 
  getProjectAPI, 
  updateProjectAPI, 
  deleteProjectAPI, 
  getProjectMembersAPI, 
  addProjectMemberAPI, 
  removeProjectMemberAPI 
} from "../util/projectAPI";
import { getUsersAPI } from "../util/api";
import { notificationService } from "../services/notificationService";

export const ProjectSettings = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("viewer");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchProject();
    fetchAllUsers();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const data = await getProjectAPI(projectId);
      setProject(data);
      setMembers(data.members || []);
      setFormData({
        name: data.name || "",
        description: data.description || "",
      });
    } catch (error) {
      console.error("Error fetching project:", error);
      notificationService.error("Failed to load project");
      navigate(`/projects/${projectId}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const users = await getUsersAPI();
      setAllUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUsers([]);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
      };
      await updateProjectAPI(projectId, updateData);
      notificationService.success("Project updated successfully");
      setEditMode(false);
      fetchProject();
    } catch (error) {
      console.error("Error updating project:", error);
      notificationService.error(error.response?.data?.message || "Failed to update project");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      notificationService.error("Please select a user");
      return;
    }

    try {
      await addProjectMemberAPI(projectId, selectedUserId, selectedRole);
      notificationService.success("Member added successfully");
      setShowAddMember(false);
      setSelectedUserId("");
      setSelectedRole("viewer");
      fetchProject();
    } catch (error) {
      console.error("Error adding member:", error);
      notificationService.error(error.response?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      await removeProjectMemberAPI(projectId, userId);
      notificationService.success("Member removed successfully");
      fetchProject();
    } catch (error) {
      console.error("Error removing member:", error);
      notificationService.error("Failed to remove member");
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project? All tasks in this project will be deleted.")) {
      return;
    }

    try {
      await deleteProjectAPI(projectId);
      notificationService.success("Project deleted successfully");
      navigate("/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
      notificationService.error("Failed to delete project");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-500">Loading project settings...</div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <SettingsIcon size={28} />
              Project Settings
            </h1>
            <p className="text-slate-500 mt-1">{project.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {editMode ? (
            <>
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    name: project.name || "",
                    description: project.description || "",
                  });
                }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                <Save size={18} />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Edit Project
            </button>
          )}
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Project Details</h2>
        <form onSubmit={handleUpdateProject}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Project Name *
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                  autoFocus
                />
              ) : (
                <div className="px-3 py-2 text-slate-900 font-medium">{project.name}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              {editMode ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  rows={3}
                />
              ) : (
                <div className="px-3 py-2 text-slate-600">
                  {project.description || "No description"}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Users size={20} />
            Members
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{members.length} member(s)</span>
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-sm"
            >
              <UserPlus size={16} />
              Add Member
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {members.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No members yet. Add your first member!
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {member.full_name?.charAt(0) || member.username?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {member.full_name || member.username}
                        {project.owner_id === member.user_id && (
                          <span className="ml-2 text-xs text-slate-500">(Owner)</span>
                        )}
                      </div>
                    <div className="text-sm text-slate-500">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    member.role === "admin" 
                      ? "bg-indigo-100 text-indigo-600" 
                      : member.role === "member"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {member.role}
                  </span>
                  {project.owner_id !== member.user_id && (
                    <button
                      onClick={() => handleRemoveMember(member.user_id)}
                      className="p-1 hover:bg-slate-100 rounded transition"
                    >
                      <X size={18} className="text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg border border-rose-200 p-6">
        <h2 className="text-xl font-semibold text-rose-900 mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-900">Delete Project</div>
            <div className="text-sm text-slate-500 mt-1">
              Once you delete a project, there is no going back. Please be certain.
            </div>
          </div>
          <button
            onClick={handleDeleteProject}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition font-medium"
          >
            <Trash2 size={18} />
            Delete Project
          </button>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Add Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    User
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                    autoFocus
                  >
                    <option value="">Select a user</option>
                    {allUsers
                      .filter(user => !members.find(m => m.user_id === user.user_id))
                      .map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                          {user.full_name || user.username} ({user.email})
                        </option>
                      ))}
                  </select>
                  {allUsers.length === 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      Loading users...
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMember(false);
                    setSelectedUserId("");
                    setSelectedRole("viewer");
                  }}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

