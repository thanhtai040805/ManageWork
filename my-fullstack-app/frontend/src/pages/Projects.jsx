import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Grid3x3, List, Search, Calendar, MoreVertical } from "lucide-react";
import { getProjectsAPI, createProjectAPI, deleteProjectAPI } from "../util/projectAPI";
import { notificationService } from "../services/notificationService";

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const navigate = useNavigate();

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
      // Navigate to project detail
      // Response format: { message, data: { project_id, ... } }
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
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      await deleteProjectAPI(projectId);
      notificationService.success("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      notificationService.error("Failed to delete project");
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { dateStyle: "medium" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-500">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">Manage your projects and teams</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          <Plus size={20} />
          Create Project
        </button>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded transition ${
              viewMode === "grid"
                ? "bg-indigo-100 text-indigo-600"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Grid3x3 size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded transition ${
              viewMode === "list"
                ? "bg-indigo-100 text-indigo-600"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500 text-lg">
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
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.project_id}
              onClick={() => navigate(`/projects/${project.project_id}`)}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition cursor-pointer group relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
                  )}
                </div>
                <button
                  onClick={(e) => handleDeleteProject(project.project_id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded transition"
                >
                  <MoreVertical size={18} className="text-slate-400" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{formatDate(project.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Project</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Created</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr
                  key={project.project_id}
                  onClick={() => navigate(`/projects/${project.project_id}`)}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-slate-900">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-slate-500 mt-1">{project.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(project.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => handleDeleteProject(project.project_id, e)}
                      className="p-1 hover:bg-slate-100 rounded transition"
                    >
                      <MoreVertical size={18} className="text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
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
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

