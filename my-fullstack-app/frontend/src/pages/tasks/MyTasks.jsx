import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import { TaskDetail, AddTask, MyTasksHeader } from "../../features/tasks";
import { WeekView, MonthView } from "../../features/calendar";
import { getTasksAPI, searchTasksAPI } from "../../services/task.service";
import { getWeekRange, getMonthRange, isDateInRange } from "../../utils/dateHelpers";

export const MyTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [viewType, setViewType] = useState("week"); // "week" or "month"
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null); // For task detail modal
  const [showAddTask, setShowAddTask] = useState(false); // For add task modal
  const [searchQuery, setSearchQuery] = useState("");

  const MY_DAY_STORAGE_KEY = "my_day_tasks_v1";

  const getLocalDateKey = useCallback(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const [myDayTaskIds, setMyDayTaskIds] = useState([]); // string[]
  const myDayTaskIdsSet = useMemo(
    () => new Set(myDayTaskIds.map((id) => String(id))),
    [myDayTaskIds]
  );

  // Fetch tasks
  useEffect(() => {
    if (searchQuery) return; // Don't fetch all tasks if searching

    getTasksAPI()
      .then((response) => {
        setAllTasks(response);
        setTasks(response);
      })
      .catch((error) => console.log(error));
  }, [searchQuery]);

  // Intelligent Search logic
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
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Load My Day selection + reset on day change
  useEffect(() => {
    const todayKey = getLocalDateKey();
    try {
      const raw = localStorage.getItem(MY_DAY_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;

      const taskIds = Array.isArray(parsed?.taskIds) ? parsed.taskIds : [];

      if (!parsed || parsed.dateKey !== todayKey) {
        const payload = { dateKey: todayKey, taskIds: [] };
        localStorage.setItem(MY_DAY_STORAGE_KEY, JSON.stringify(payload));
        setMyDayTaskIds([]);
      } else {
        setMyDayTaskIds(taskIds.map(String));
      }
    } catch (e) {
      setMyDayTaskIds([]);
    }

    let timeoutId = null;
    const scheduleReset = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0); // local midnight next day
      const ms = next.getTime() - now.getTime() + 50;
      timeoutId = window.setTimeout(() => {
        const newKey = getLocalDateKey();
        localStorage.setItem(
          MY_DAY_STORAGE_KEY,
          JSON.stringify({ dateKey: newKey, taskIds: [] })
        );
        setMyDayTaskIds([]);
        scheduleReset();
      }, ms);
    };

    scheduleReset();
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [MY_DAY_STORAGE_KEY, getLocalDateKey]);

  // Get date range based on view type
  const dateRange = useMemo(() => {
    if (viewType === "week") {
      return getWeekRange(currentDate);
    } else {
      return getMonthRange(currentDate);
    }
  }, [viewType, currentDate]);

  // Filter tasks by date range (based on due_date)
  const filteredTasks = useMemo(() => {
    if (searchQuery.trim()) return tasks; // Show all search results

    return tasks.filter((task) => {
      if (!task.due_date) return false;
      return isDateInRange(task.due_date, dateRange.start, dateRange.end);
    });
  }, [tasks, dateRange, searchQuery]);

  // Navigate to previous week/month
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next week/month
  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to today
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Handle view type change
  const handleViewTypeChange = (type) => {
    setViewType(type);
    setCurrentDate(new Date()); // Reset to current date when changing view
  };

  // Handle task actions
  const handleTaskDeleted = (deletedTaskId) => {
    const idStr = String(deletedTaskId);
    setTasks((prev) => prev.filter((task) => String(task.task_id) !== idStr));
    setAllTasks((prev) => prev.filter((task) => String(task.task_id) !== idStr));
    setMyDayTaskIds((prev) => prev.filter((id) => String(id) !== idStr));
    if (selectedTask?.task_id === deletedTaskId) {
      setSelectedTask(null);
    }
  };

  const handleTaskEdited = (editedTaskData) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.task_id === editedTaskData.task_id ? editedTaskData : task
      )
    );
    setAllTasks((prev) =>
      prev.map((task) =>
        task.task_id === editedTaskData.task_id ? editedTaskData : task
      )
    );
    // Update selected task if it was edited
    if (selectedTask?.task_id === editedTaskData.task_id) {
      setSelectedTask(editedTaskData);
    }
  };

  // Handle task status change
  const handleTaskStatusChange = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.task_id === updatedTask.task_id ? updatedTask : t))
    );
    setAllTasks((prev) =>
      prev.map((t) => (t.task_id === updatedTask.task_id ? updatedTask : t))
    );
    // Update selected task if it was updated
    if (selectedTask?.task_id === updatedTask.task_id) {
      setSelectedTask(updatedTask);
    }
  };

  // Handle task click
  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  // Handle add task
  const handleAddTask = () => {
    setShowAddTask(true);
  };

  // Handle task added successfully
  const handleTaskAdded = (responseData) => {
    // Response có thể là single task object hoặc object với tasks array
    // Luôn refresh từ API để đảm bảo sync (bao gồm cả recurring tasks)
    getTasksAPI()
      .then((response) => {
        setAllTasks(response);
        setTasks(response);
      })
      .catch((error) => {
        console.error("Error refreshing tasks:", error);
      });
  };

  const toggleMyDay = useCallback(
    (taskId) => {
      const idStr = String(taskId);
      setMyDayTaskIds((prev) => {
        const has = prev.some((x) => String(x) === idStr);
        const next = has ? prev.filter((x) => String(x) !== idStr) : [...prev, idStr];
        localStorage.setItem(
          MY_DAY_STORAGE_KEY,
          JSON.stringify({ dateKey: getLocalDateKey(), taskIds: next })
        );
        return next;
      });
    },
    [MY_DAY_STORAGE_KEY, getLocalDateKey]
  );

  const myDayTasksSorted = useMemo(() => {
    const tasksInMyDay = allTasks.filter((t) =>
      myDayTaskIdsSet.has(String(t.task_id))
    );

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...tasksInMyDay].sort((a, b) => {
      const dueA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const dueB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      if (dueA !== dueB) return dueA - dueB;

      const pA = priorityOrder[a.priority] ?? 1;
      const pB = priorityOrder[b.priority] ?? 1;
      return pA - pB;
    });
  }, [allTasks, myDayTaskIdsSet]);

  return (
    <div className="space-y-6">
      {/* Header with View Toggle and Navigation */}
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
      />

      {/* My Day Focus Section */}
      <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-100 border border-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Star size={18} className="fill-current" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-black text-slate-900">Tầm nhìn hôm nay</h3>
              <p className="text-sm text-slate-500 mt-1">
                {myDayTasksSorted.length > 0
                  ? `Bạn đang tập trung vào ${myDayTasksSorted.length} việc`
                  : "Chọn các task quan trọng để tập trung trong ngày"}
              </p>
            </div>
          </div>
        </div>

        {myDayTasksSorted.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-600">
              Nhấn vào biểu tượng <span className="font-bold text-indigo-600">ngôi sao</span> cạnh một task
              để thêm vào My Day.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {myDayTasksSorted.map((task) => (
              <div
                key={task.task_id}
                className="group relative rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-sm transition flex items-start gap-3 cursor-pointer"
                onClick={() => handleTaskClick(task)}
                role="button"
                tabIndex={0}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMyDay(task.task_id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="shrink-0 p-1 rounded-xl hover:bg-indigo-50 transition text-indigo-600"
                  title="Remove from My Day"
                >
                  <Star size={16} fill="currentColor" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {task.title}
                      </div>
                      {task.due_date && (
                        <div className="text-xs text-slate-500 mt-1">
                          Due:{" "}
                          {new Date(task.due_date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-full">
                        {task.status?.replace("_", " ") || "todo"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest border px-2 py-1 rounded-full ${
                        task.priority === "high"
                          ? "bg-rose-50 border-rose-200 text-rose-600"
                          : task.priority === "medium"
                          ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                          : "bg-emerald-50 border-emerald-200 text-emerald-600"
                      }`}
                    >
                      {task.priority || "medium"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tasks Display */}
      {viewType === "week" ? (
        <WeekView
          currentDate={currentDate}
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
          onTaskDelete={handleTaskDeleted}
          onTaskStatusChange={handleTaskStatusChange}
          myDayTaskIdsSet={myDayTaskIdsSet}
          onToggleMyDay={toggleMyDay}
        />
      ) : (
        <MonthView
          currentDate={currentDate}
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
          myDayTaskIdsSet={myDayTaskIdsSet}
          onToggleMyDay={toggleMyDay}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updatedTask) => {
            handleTaskEdited(updatedTask);
            setSelectedTask(updatedTask);
          }}
          myDayTaskIdsSet={myDayTaskIdsSet}
          onToggleMyDay={toggleMyDay}
        />
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTask
          onClose={() => setShowAddTask(false)}
          onAddSuccess={handleTaskAdded}
        />
      )}
    </div>
  );
};

