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
  Flag,
  Search
} from "lucide-react";
import { ProjectCardSkeleton, TaskCardSkeleton } from "../../components/common/SkeletonLoader";
import { getProjectAPI } from "../../services/project.service";
import { TaskCard, AddTask } from "../../features/tasks";
import { searchTasksAPI } from "../../services/task.service";
import { notificationService } from "../../services/notification.service";

export const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" or "list"
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Intelligent Search for project tasks
  useEffect(() => {
    if (!searchQuery.trim()) {
      if (project) {
        setTasks(project.tasks || []);
      }
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      searchTasksAPI(searchQuery, projectId)
        .then((response) => {
          setTasks(response);
        })
        .catch((error) => console.error("Search error:", error));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, projectId, project]);

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
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-slate-200 rounded-xl" />
            <div className="h-4 w-96 bg-slate-100 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-slate-100 rounded-lg" />
            <div className="h-10 w-32 bg-slate-200 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl border border-slate-100" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <div className="h-6 w-32 bg-slate-200 rounded-lg mb-4" />
              {[1, 2].map(j => <TaskCardSkeleton key={j} />)}
            </div>
          ))}
        </div>
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
            {/* Progress Bar */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
                  style={{ width: `${project.stats?.completion_percentage || 0}%` }}
                />
              </div>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                {Math.round(project.stats?.completion_percentage || 0)}% Complete
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
            <button 
              onClick={() => setViewMode("kanban")}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Kanban
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              List
            </button>
          </div>

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

      {/* Content Area */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* To Do Column */}
          <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-rose-500 rounded-full" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">To Do</h3>
                <span className="bg-white border border-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                  {tasksByStatus.todo.length}
                </span>
              </div>
            </div>
            <div className="space-y-4 min-h-[400px]">
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
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-200 border border-slate-50">
                    <Clock size={20} />
                  </div>
                  <p className="text-xs text-slate-400 font-medium italic">No tasks here</p>
                </div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-blue-500 rounded-full" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">In Progress</h3>
                <span className="bg-white border border-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                  {tasksByStatus.in_progress.length}
                </span>
              </div>
            </div>
            <div className="space-y-4 min-h-[400px]">
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
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-200 border border-slate-50">
                    <Clock size={20} />
                  </div>
                  <p className="text-xs text-slate-400 font-medium italic">No tasks in progress</p>
                </div>
              )}
            </div>
          </div>

          {/* Done Column */}
          <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Done</h3>
                <span className="bg-white border border-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                  {tasksByStatus.done.length}
                </span>
              </div>
            </div>
            <div className="space-y-4 min-h-[400px]">
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
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-200 border border-slate-50">
                    <CheckCircle2 size={20} />
                  </div>
                  <p className="text-xs text-slate-400 font-medium italic">No completed tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-200/60 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Task Title</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Due Date</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map((task) => (
                <tr key={task.task_id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.description || "No description"}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      task.status === 'done' ? 'bg-emerald-50 text-emerald-600' :
                      task.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {task.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Flag size={14} className={
                        task.priority === 'high' ? 'text-rose-500 fill-current' :
                        task.priority === 'medium' ? 'text-amber-500 fill-current' :
                        'text-slate-300'
                      } />
                      <span className="text-xs font-bold text-slate-600 capitalize">{task.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-slate-500">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-slate-600">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="py-20 text-center">
               <p className="text-sm text-slate-400 italic">No tasks found for this project.</p>
            </div>
          )}
        </div>
      )}

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

