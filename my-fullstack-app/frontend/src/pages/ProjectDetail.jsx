import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  Plus, 
  MoreVertical,
  CheckCircle2,
  Circle,
  Clock,
  Flag
} from "lucide-react";
import { getProjectAPI } from "../util/projectAPI";
import TaskCard from "../components/TaskCard";
import { AddTask } from "../components/AddTask";
import { notificationService } from "../services/notificationService";

export const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" or "list"

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await getProjectAPI(projectId);
      setProject(data);
      // Use tasks from project response
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Error fetching project:", error);
      notificationService.error("Failed to load project");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAdded = (newTask) => {
    // Refresh project to get updated tasks and stats
    fetchProject();
    setShowAddTask(false);
  };

  const handleTaskDeleted = (taskId) => {
    // Refresh project to get updated tasks and stats
    fetchProject();
  };

  const handleTaskEdited = (updatedTask) => {
    // Update local state for immediate UI update
    setTasks((prev) =>
      prev.map((task) =>
        task.task_id === updatedTask.task_id ? updatedTask : task
      )
    );
    // Also refresh project to get updated stats
    fetchProject();
  };

  const handleTaskStatusChange = (updatedTask) => {
    // Update local state for immediate UI update
    setTasks((prev) =>
      prev.map((task) =>
        task.task_id === updatedTask.task_id ? updatedTask : task
      )
    );
    // Also refresh project to get updated stats
    fetchProject();
  };

  // Group tasks by status
  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-500">Loading project...</div>
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
            onClick={() => navigate("/projects")}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
            {project.description && (
              <p className="text-slate-500 mt-1">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/projects/${projectId}/settings`)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <Settings size={18} />
            Settings
          </button>
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            <Plus size={20} />
            Create Task
          </button>
        </div>
      </div>

      {/* Stats */}
      {project.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500">Total Tasks</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {project.stats.total_tasks || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500">Completed</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {project.stats.completed_tasks || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500">In Progress</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {tasksByStatus.in_progress.length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500">Members</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {project.stats.total_members || 0}
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* To Do Column */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Circle size={18} className="text-rose-500" />
              <h3 className="font-semibold text-slate-900">To Do</h3>
              <span className="bg-white text-slate-600 text-xs px-2 py-0.5 rounded-full">
                {tasksByStatus.todo.length}
              </span>
            </div>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {tasksByStatus.todo.map((task) => (
              <TaskCard
                key={task.task_id}
                task={task}
                onDelete={handleTaskDeleted}
                onEditSuccess={handleTaskEdited}
                onStatusChange={handleTaskStatusChange}
              />
            ))}
            {tasksByStatus.todo.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-8">
                No tasks
              </div>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Circle size={18} className="text-blue-500 fill-current" />
              <h3 className="font-semibold text-slate-900">In Progress</h3>
              <span className="bg-white text-slate-600 text-xs px-2 py-0.5 rounded-full">
                {tasksByStatus.in_progress.length}
              </span>
            </div>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {tasksByStatus.in_progress.map((task) => (
              <TaskCard
                key={task.task_id}
                task={task}
                onDelete={handleTaskDeleted}
                onEditSuccess={handleTaskEdited}
                onStatusChange={handleTaskStatusChange}
              />
            ))}
            {tasksByStatus.in_progress.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-8">
                No tasks
              </div>
            )}
          </div>
        </div>

        {/* Done Column */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <h3 className="font-semibold text-slate-900">Done</h3>
              <span className="bg-white text-slate-600 text-xs px-2 py-0.5 rounded-full">
                {tasksByStatus.done.length}
              </span>
            </div>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {tasksByStatus.done.map((task) => (
              <TaskCard
                key={task.task_id}
                task={task}
                onDelete={handleTaskDeleted}
                onEditSuccess={handleTaskEdited}
                onStatusChange={handleTaskStatusChange}
              />
            ))}
            {tasksByStatus.done.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-8">
                No tasks
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTask
          onClose={() => setShowAddTask(false)}
          onAddSuccess={handleTaskAdded}
          defaultProjectId={parseInt(projectId)}
        />
      )}
    </div>
  );
};

