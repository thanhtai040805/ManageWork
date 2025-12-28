import React, { useMemo, useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import {
  TaskCard,
  CompletedTaskCard,
  TaskStatus,
  AddTask,
} from "../../features/tasks";
import { getTasksAPI } from "../../services/task.service";

const getStatusCounts = (tasks) =>
  tasks.reduce(
    (accumulator, task) => {
      if (accumulator[task.status] !== undefined) {
        accumulator[task.status] += 1;
      }
      return accumulator;
    },
    { todo: 0, in_progress: 0, done: 0 }
  );

// Helper function to check if a date is today (compares only date, not time)
const isDateToday = (dateString) => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    const today = new Date();

    // Reset time to 00:00:00 for accurate date comparison
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    return dateOnly.getTime() === todayOnly.getTime();
  } catch (error) {
    console.error("Error parsing date:", dateString, error);
    return false;
  }
};

// Helper function to check if task is in today (only check due_date)
const isTaskInToday = (task) => {
  // Only check due_date - show task if due_date is today
  if (task.due_date) {
    return isDateToday(task.due_date);
  }
  // If no due_date, don't show the task
  return false;
};

export const Home = () => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [tasks, setTasks] = useState([]);

  const handleTaskDeleted = (deletedTaskId) => {
    setTasks((prev) => prev.filter((task) => task.task_id !== deletedTaskId));
  };

  const handleTaskEdited = (editedTaskData) => {
    console.log("Edited task data:", editedTaskData);
    setTasks((prev) =>
      prev.map((task) =>
        task.task_id === editedTaskData.task_id ? editedTaskData : task
      )
    );
  };

  const handleTaskStatusChange = (updatedTask) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.task_id === updatedTask.task_id ? updatedTask : task
      )
    );
  };

  useEffect(() => {
    getTasksAPI()
      .then((response) => {
        setTasks(response);
      })
      .catch((error) => console.log(error));
  }, []);

const handleTaskAdded = (newTasks) => {
  setTasks((prev) => [...newTasks, ...prev]);
};


  // Filter tasks: only show tasks in today that are not done
  const todoTasks = useMemo(
    () => tasks.filter((task) => task.status !== "done" && isTaskInToday(task)),
    [tasks]
  );

  // Filter completed tasks: only show tasks completed today
  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === "done" && isTaskInToday(task)),
    [tasks]
  );

  // Calculate status counts only for today's tasks
  const todayTasks = useMemo(
    () => tasks.filter((task) => isTaskInToday(task)),
    [tasks]
  );
  const statusCounts = useMemo(() => getStatusCounts(todayTasks), [todayTasks]);

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="space-y-5 rounded-3xl bg-white p-8 shadow-lg shadow-slate-100">
          <header className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-rose-500">
                <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                To-Do
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-slate-400">
                <CalendarIcon size={16} />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>Today</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAddTaskOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-slate-800"
            >
              <Plus size={16} />
              Add task
            </button>
          </header>

          <div className="space-y-5">
            {todoTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarIcon size={48} className="mb-4 text-slate-300" />
                <p className="text-lg font-medium text-slate-600">
                  No tasks for today
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Add a task with today's due date to see it here
                </p>
              </div>
            ) : (
              todoTasks.map((task) => (
                <TaskCard
                  key={task.task_id}
                  task={task}
                  onDelete={handleTaskDeleted}
                  onEditSuccess={handleTaskEdited}
                  onStatusChange={handleTaskStatusChange}
                />
              ))
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <TaskStatus stats={{ ...statusCounts, total: todayTasks.length }} />

          <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg shadow-slate-100">
            <header className="flex items-center gap-2 text-sm font-semibold text-rose-500">
              <span className="flex h-4 w-4 items-center justify-center rounded border border-rose-300 bg-rose-50">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              Completed Task
            </header>
            <div className="space-y-4">
              {completedTasks.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-4">
                  No completed tasks for today
                </p>
              ) : (
                completedTasks.map((task) => (
                  <CompletedTaskCard key={task.task_id} task={task} />
                ))
              )}
            </div>
          </section>
        </aside>
      </div>

      {isAddTaskOpen && (
        <AddTask
          onClose={() => setIsAddTaskOpen(false)}
          onAddSuccess={handleTaskAdded}
        />
      )}
    </>
  );
};

