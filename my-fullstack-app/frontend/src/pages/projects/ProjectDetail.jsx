import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Settings, Users, Plus, Clock, Search, LayoutGrid, Calendar } from "lucide-react";
import { getProjectAPI } from "../../services/project.service";
import { TaskCard, AddTask, TaskDetail } from "../../features/tasks";
import { WeekView, MonthView } from "../../features/calendar";
import { searchTasksAPI } from "../../services/task.service";
import { notificationService } from "../../services/notification.service";

export const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewType, setViewType] = useState("kanban");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchProject();
  }, [projectId]);

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
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Error fetching project:", error);
      notificationService.error("Failed to load project");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAdded = () => {
    fetchProject();
    setShowAddTask(false);
  };

  const handleTaskDeleted = () => {
    fetchProject();
  };

  const handleTaskEdited = (updatedTask) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.task_id === updatedTask.task_id ? updatedTask : task
      )
    );
    setSelectedTask(updatedTask);
    fetchProject();
  };

  const handleTaskStatusChange = (updatedTask) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.task_id === updatedTask.task_id ? updatedTask : task
      )
    );
    setSelectedTask(updatedTask);
    fetchProject();
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  useEffect(() => {
    const taskId = searchParams.get("task");
    if (taskId && tasks.length > 0) {
      const task = tasks.find(t => t.task_id === taskId);
      if (task) {
        setSelectedTask(task);
      }
    }
  }, [searchParams, tasks]);

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter === "all") return true;
    return task.status === statusFilter;
  });

  const tasksByStatus = {
    todo: filteredTasks.filter((t) => t.status === "todo"),
    in_progress: filteredTasks.filter((t) => t.status === "in_progress"),
    review: filteredTasks.filter((t) => t.status === "review"),
    done: filteredTasks.filter((t) => t.status === "done"),
  };

  if (loading) {
    return (
      <div className="h-full bg-slate-50/50 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-10 w-64 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-4 w-96 bg-slate-100 rounded-lg animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-24 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="h-full bg-slate-50/50 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/projects")}
              className="p-2 hover:bg-slate-100 rounded-xl transition"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
              {project.description && (
                <p className="text-slate-500 mt-1 text-sm">{project.description}</p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-1000"
                    style={{ width: `${project.stats?.completion_percentage || 0}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-indigo-600">
                  {Math.round(project.stats?.completion_percentage || 0)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/projects/${projectId}/settings`)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition bg-white"
            >
              <Settings size={18} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-600">Settings</span>
            </button>
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition font-medium shadow-sm"
            >
              <Plus size={20} />
              New Task
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-[40px]! pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {[
              { id: "all", label: "All" },
              { id: "todo", label: "To Do" },
              { id: "in_progress", label: "In Progress" },
              { id: "review", label: "Review" },
              { id: "done", label: "Done" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  statusFilter === filter.id
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewType("kanban")}
              className={`p-2 rounded-lg transition ${viewType === "kanban" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              title="Kanban"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewType("week")}
              className={`p-2 rounded-lg transition ${viewType === "week" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              title="Week"
            >
              <Calendar size={16} />
            </button>
          </div>
        </div>

        {project.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{project.stats.total_tasks || 0}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{project.stats.completed_tasks || 0}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{tasksByStatus.in_progress.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Members</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{project.stats.total_members || 0}</p>
            </div>
          </div>
        )}

        {viewType === "kanban" ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-5 bg-rose-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">To Do</h3>
                  <span className="text-[10px] font-bold bg-white text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-100">
                    {tasksByStatus.todo.length}
                  </span>
                </div>
              </div>
              <div className="space-y-3 min-h-[300px]">
                {tasksByStatus.todo.map((task) => (
                  <TaskCard key={task.task_id} task={task} onDelete={handleTaskDeleted} onEditSuccess={handleTaskEdited} onStatusChange={handleTaskStatusChange} onCardClick={handleTaskClick} />
                ))}
              </div>
            </div>
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-5 bg-blue-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">In Progress</h3>
                  <span className="text-[10px] font-bold bg-white text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-100">
                    {tasksByStatus.in_progress.length}
                  </span>
                </div>
              </div>
              <div className="space-y-3 min-h-[300px]">
                {tasksByStatus.in_progress.map((task) => (
                  <TaskCard key={task.task_id} task={task} onDelete={handleTaskDeleted} onEditSuccess={handleTaskEdited} onStatusChange={handleTaskStatusChange} onCardClick={handleTaskClick} />
                ))}
              </div>
            </div>
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-5 bg-amber-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Review</h3>
                  <span className="text-[10px] font-bold bg-white text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-100">
                    {tasksByStatus.review.length}
                  </span>
                </div>
              </div>
              <div className="space-y-3 min-h-[300px]">
                {tasksByStatus.review.map((task) => (
                  <TaskCard key={task.task_id} task={task} onDelete={handleTaskDeleted} onEditSuccess={handleTaskEdited} onStatusChange={handleTaskStatusChange} onCardClick={handleTaskClick} />
                ))}
              </div>
            </div>
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-5 bg-emerald-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Done</h3>
                  <span className="text-[10px] font-bold bg-white text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-100">
                    {tasksByStatus.done.length}
                  </span>
                </div>
              </div>
              <div className="space-y-3 min-h-[300px]">
                {tasksByStatus.done.map((task) => (
                  <TaskCard key={task.task_id} task={task} onDelete={handleTaskDeleted} onEditSuccess={handleTaskEdited} onStatusChange={handleTaskStatusChange} onCardClick={handleTaskClick} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <WeekView currentDate={currentDate} tasks={filteredTasks} onTaskClick={handleTaskClick} onTaskDelete={handleTaskDeleted} onTaskStatusChange={handleTaskStatusChange} />
        )}

        {showAddTask && (
          <AddTask onClose={() => setShowAddTask(false)} onAddSuccess={handleTaskAdded} defaultProjectId={projectId} />
        )}

        {selectedTask && (
          <TaskDetail task={selectedTask} onClose={() => { setSelectedTask(null); setSearchParams({}, { replace: true }); }} onUpdate={(updatedTask) => { handleTaskEdited(updatedTask); setSelectedTask(updatedTask); }} />
        )}
      </div>
    </div>
  );
};