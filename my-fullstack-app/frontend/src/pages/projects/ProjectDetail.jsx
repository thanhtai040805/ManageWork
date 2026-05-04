import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Settings, Plus, LayoutGrid, Calendar } from "lucide-react";
import { getProjectAPI } from "../../services/project.service";
import { AddTask, TaskDetail } from "../../features/tasks";
import { WeekView, MonthView, KanBanView } from "../../features/calendar";
import { searchTasksAPI } from "../../services/task.service";
import { notificationService } from "../../services/notification.service";
import { ProjectTaskFilters, applyProjectFilters } from "../../features/tasks/ProjectTaskFilters";
import { AuthContext } from "../../context/authContext";
import { useTaskStore } from "../../stores/taskStore";
import { useContext } from "react";

export const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const user = auth?.user;
  const setProjectTasks = useTaskStore((state) => state.setProjectTasks);
  const [searchParams, setSearchParams] = useSearchParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewType, setViewType] = useState("kanban");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    assignee: [],
    creator: [],
    dateRange: null,
    quickFilter: null
  });

  const members = useMemo(() => project?.members || [], [project]);

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
      const projectTasks = data.tasks || [];
      setTasks(projectTasks);
      setProjectTasks(projectId, projectTasks);
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

  const handleTaskStatusChange = (taskOrId, newStatus) => {
    if (newStatus !== undefined) {
      setTasks((prev) =>
        prev.map((task) =>
          task.task_id === taskOrId ? { ...task, status: newStatus } : task
        )
      );
      fetchProject();
    } else {
      const updatedTask = taskOrId;
      setTasks((prev) =>
        prev.map((task) =>
          task.task_id === updatedTask.task_id ? updatedTask : task
        )
      );
      setSelectedTask(updatedTask);
      fetchProject();
    }
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

  const filteredTasks = useMemo(() => {
    let result = tasks;
    const uid = user?.uid || null;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    result = applyProjectFilters(result, filters, uid);
    return result;
  }, [tasks, searchQuery, filters, user?.uid]);

  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      assignee: [],
      creator: [],
      dateRange: null,
      quickFilter: null
    });
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="h-full bg-slate-50/50 p-8 overflow-y-auto">
        <div className="max-w-6xl space-y-6">
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
    <div className="h-full bg-slate-50/50 overflow-y-auto">
      <div className="space-y-6">
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

        <div className="flex flex-wrap items-center gap-4">
          <ProjectTaskFilters
            filters={filters}
            onFilterChange={setFilters}
            members={members}
            onClearFilters={clearFilters}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl ml-auto">
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
              <LayoutGrid size={16} className="rotate-90" />
            </button>
            <button
              onClick={() => setViewType("month")}
              className={`p-2 rounded-lg transition ${viewType === "month" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              title="Month"
            >
              <Calendar size={16} />
            </button>
          </div>
        </div>

        {viewType === "kanban" ? (
          <KanBanView
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onTaskStatusChange={handleTaskStatusChange}
            onTaskDelete={handleTaskDeleted}
            projectId={projectId}
            userId={user?.uid}
          />
        ) : viewType === "week" ? (
          <WeekView currentDate={currentDate} tasks={filteredTasks} onTaskClick={handleTaskClick} onTaskDelete={handleTaskDeleted} onTaskStatusChange={handleTaskStatusChange} />
        ) : (
          <MonthView currentDate={currentDate} tasks={filteredTasks} onTaskClick={handleTaskClick} onTaskDelete={handleTaskDeleted} onTaskStatusChange={handleTaskStatusChange} />
        )}

        {showAddTask && (
          <AddTask onClose={() => setShowAddTask(false)} onAddSuccess={handleTaskAdded} defaultProjectId={projectId} members={members} />
        )}

        {selectedTask && (
          <TaskDetail task={selectedTask} onClose={() => { setSelectedTask(null); setSearchParams({}, { replace: true }); }} onUpdate={(updatedTask) => { handleTaskEdited(updatedTask); setSelectedTask(updatedTask); }} />
        )}
      </div>
    </div>
  );
};