import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Grid3x3, FolderKanban, Users, Search, MoreVertical } from "lucide-react";
import { getProjectsAPI, createProjectAPI, deleteProjectAPI } from "../../services/project.service";
import { notificationService } from "../../services/notification.service";
import { confirm } from "../../components/common/ConfirmModal";
import { ProjectCardSkeleton } from "../../components/common/SkeletonLoader";
import { AuthContext } from "../../context/authContext";

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const currentUserId = auth?.user?.uid;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjectsAPI();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      notificationService.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      notificationService.error("Project name is required");
      return;
    }

    try {
      const response = await createProjectAPI(newProject.name, newProject.description);
      notificationService.success("Project created successfully");
      setShowCreateModal(false);
      setNewProject({ name: "", description: "" });
      fetchProjects();
      const projectId = response?.data?.project_id || response?.project_id;
      if (projectId) {
        navigate(`/projects/${projectId}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      notificationService.error(error.response?.data?.message || "Failed to create project");
    }
  };

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    const ok = await confirm({
      title: "Delete Project",
      message: "Are you sure you want to delete this project?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await deleteProjectAPI(projectId);
      notificationService.success("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      notificationService.error("Failed to delete project");
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    const isOwner = project.owner_id === currentUserId;
    const userRole = project.user_role;
    
    if (activeTab === "all") return true;
    if (activeTab === "my") return isOwner || userRole === "admin";
    if (activeTab === "shared") return !isOwner && userRole && userRole !== "admin";
    
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { dateStyle: "medium" });
  };

  if (loading) {
    return (
      <div className="h-full bg-slate-50/50 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50/50 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
            <p className="text-slate-500 mt-1">Manage your projects and teams</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition font-medium shadow-sm"
          >
            <Plus size={20} />
            Create Project
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-[40px]! pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          {[
            { id: "all", label: "All", icon: Grid3x3 },
            { id: "my", label: "My Projects", icon: FolderKanban },
            { id: "shared", label: "Shared", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">
              {searchQuery ? "No projects found" : "No projects yet"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create your first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.project_id}
                onClick={() => navigate(`/projects/${project.project_id}`)}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-indigo-600" />
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(project.project_id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-100 rounded-lg transition"
                  >
                    <MoreVertical size={16} className="text-slate-400" />
                  </button>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{project.description}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <FolderKanban size={12} />
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                  {project.member_count !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Users size={12} />
                      <span>{project.member_count} members</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Create New Project</h2>
              <form onSubmit={handleCreateProject}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="Enter project name"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                      rows={3}
                      placeholder="Enter project description"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewProject({ name: "", description: "" });
                    }}
                    className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};