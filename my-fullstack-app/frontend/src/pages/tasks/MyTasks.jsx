import React, { useMemo, useState, useEffect, useCallback, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { TaskDetail, AddTask, MyTasksHeader, applyFilters } from "../../features/tasks";
import { WeekView, MonthView, KanBanView } from "../../features/calendar";
import { getTasksAPI, searchTasksAPI, updateTaskStatusAPI, reorderTasksAPI } from "../../services/task.service";
import { getProjectsAPI } from "../../services/project.service";
import { getWeekRange, getMonthRange, isDateInRange } from "../../utils/dateHelpers";
import { AuthContext } from "../../context/authContext";
import { useTaskStore } from "../../stores/taskStore";

export const MyTasks = () => {
  const { auth } = useContext(AuthContext);
  const userId = auth?.user?.uid;
  const setUserTasks = useTaskStore((state) => state.setUserTasks);
  const [searchParams, setSearchParams] = useSearchParams();
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [viewType, setViewType] = useState("kanban");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    projectId: null,
    dateRange: null
  });

  useEffect(() => {
    if (searchQuery) return;

    getTasksAPI()
      .then((response) => {
        setAllTasks(response);
        setTasks(response);
        setUserTasks(response);

        // Check for task query param
        const taskId = searchParams.get("task");
        if (taskId && response) {
          const task = response.find(t => t.task_id === taskId);
          if (task) {
            setSelectedTask(task);
          }
        }
      })
      .catch((error) => console.log(error));
  }, [searchQuery, searchParams]);

  useEffect(() => {
    getProjectsAPI()
      .then(setProjects)
      .catch(err => console.error("Error loading projects:", err));
  }, []);

  const filteredTasks = useMemo(() => {
    let result = searchQuery.trim() ? tasks : allTasks;

    // Apply filters if any filter is active
    if (Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : v))) {
      result = applyFilters(result, filters);
    }
    return result;
  }, [tasks, allTasks, filters, searchQuery]);

  useEffect(() => {
    if (!searchQuery.trim()) return;

    const delayDebounceFn = setTimeout(() => {
      searchTasksAPI(searchQuery)
        .then((response) => {
          setTasks(response);
        })
        .catch((error) => {
          console.error("Search error:", error);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleViewTypeChange = (vt) => {
    setViewType(vt);
  };

  const handlePrevious = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewType === "week") {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setMonth(newDate.getMonth() - 1);
      }
      return newDate;
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewType === "week") {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const dateRange = viewType === "week"
    ? getWeekRange(currentDate)
    : getMonthRange(currentDate);

  const filteredTasksMemo = useMemo(() => {
    return filteredTasks.filter(t => {
      return isDateInRange(t.due_date, dateRange.start, dateRange.end);
    });
  }, [filteredTasks, dateRange]);

  const handleTaskDeleted = (taskId) => {
    setTasks(prev => prev.filter(t => t.task_id !== taskId));
    setAllTasks(prev => prev.filter(t => t.task_id !== taskId));
    setSelectedTask(null);
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    const task = tasks.find(t => t.task_id === taskId);
    const previousStatus = task?.status;
    try {
      const res = await updateTaskStatusAPI(taskId, newStatus, previousStatus);
      if (res) {
        setTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, status: newStatus } : t));
        setAllTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, status: newStatus } : t));
        setSelectedTask(prev => prev && prev.task_id === taskId ? { ...prev, status: newStatus } : prev);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleTaskEdited = (updatedTask) => {
    setTasks(prev => prev.map(t => t.task_id === updatedTask.task_id ? updatedTask : t));
    setAllTasks(prev => prev.map(t => t.task_id === updatedTask.task_id ? updatedTask : t));
    if (selectedTask?.task_id === updatedTask.task_id) {
      setSelectedTask(updatedTask);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleAddTask = () => {
    setShowAddTask(true);
  };

  const handleTaskAdded = (responseData) => {
    getTasksAPI()
      .then((response) => {
        setAllTasks(response);
        setTasks(response);
      })
      .catch((error) => {
        console.error("Error refreshing tasks:", error);
      });
  };

  const handleReorder = async (newOrder) => {
    const taskOrders = newOrder.map((t, index) => ({ taskId: t.task_id, orderIndex: index }));
    try {
      await reorderTasksAPI(taskOrders);
      setTasks(newOrder);
      setAllTasks(prev => {
        const doneTasks = prev.filter(t => t.status === "done");
        const activeIds = new Set(newOrder.map(t => t.task_id));
        const remainingDone = doneTasks.filter(t => !activeIds.has(t.task_id));
        return [...newOrder, ...remainingDone];
      });
    } catch (error) {
      console.error("Error reordering tasks:", error);
    }
  };

  return (
    <div className="space-y-6">
      <MyTasksHeader
        viewType={viewType}
        onViewTypeChange={handleViewTypeChange}
        currentDate={currentDate}
        dateRange={dateRange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onAddTask={handleAddTask}
        onSearch={setSearchQuery}
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={() => setFilters({ status: [], priority: [], projectId: null, dateRange: null })}
        projects={projects}
      />

      {viewType === "kanban" ? (
        <KanBanView
          tasks={filteredTasksMemo}
          onTaskClick={handleTaskClick}
          onTaskDelete={handleTaskDeleted}
          onTaskStatusChange={handleTaskStatusChange}
          projectId={null}
          userId={userId}
        />
      ) : viewType === "week" ? (
        <WeekView
          currentDate={currentDate}
          tasks={filteredTasksMemo}
          onTaskClick={handleTaskClick}
          onTaskDelete={handleTaskDeleted}
          onTaskStatusChange={handleTaskStatusChange}
        />
      ) : (
        <MonthView
          currentDate={currentDate}
          tasks={filteredTasksMemo}
          onTaskClick={handleTaskClick}
        />
      )}

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            setSearchParams({}, { replace: true });
          }}
          onUpdate={(updatedTask) => {
            handleTaskEdited(updatedTask);
            setSelectedTask(updatedTask);
          }}
        />
      )}

      {showAddTask && (
        <AddTask
          onClose={() => setShowAddTask(false)}
          onAddSuccess={handleTaskAdded}
        />
      )}
    </div>
  );
};