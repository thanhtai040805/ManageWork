import { Clock3, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { TaskDetail } from "./TaskDetail";
import { deleteTaskByIDAPI, updateTaskStatusAPI, editTaskByIDAPI } from "../../services/task.service";
import { notificationService } from "../../services/notification.service";

const STATUS_META = {
  todo: {
    label: "Not Started",
    tone: "text-rose-500",
    accent: "border-rose-400",
  },
  in_progress: {
    label: "In Progress",
    tone: "text-blue-500",
    accent: "border-blue-400",
  },
  done: {
    label: "Completed",
    tone: "text-emerald-500",
    accent: "border-emerald-400",
  },
};

const PRIORITY_META = {
  low: {
    label: "Low",
    tone: "text-emerald-500",
  },
  medium: {
    label: "Medium",
    tone: "text-indigo-500",
  },
  high: {
    label: "High",
    tone: "text-rose-500",
  },
};

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  // Format: "DD MMM YYYY, HH:mm"
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TaskCard = ({ task, onDelete, onEditSuccess, onStatusChange }) => {
  const [currentTask, setCurrentTask] = useState(task);
  const status = STATUS_META[currentTask.status] || STATUS_META.todo;
  const priority = PRIORITY_META[currentTask.priority] || PRIORITY_META.medium;
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  const handleDelete = () => {
    deleteTaskByIDAPI(currentTask?.task_id)
      .then(() => {
        onDelete(currentTask?.task_id);
        notificationService.success("Task deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting task:", error);
        notificationService.error(error.response?.data?.message || "Failed to delete task");
      });
  };

  const handleStatusChange = async (e) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (newStatus === currentTask.status) return;

    setIsUpdatingStatus(true);
    try {
      const updatedTask = await updateTaskStatusAPI(currentTask.task_id, newStatus);
      setCurrentTask({ ...currentTask, status: newStatus });
      if (onStatusChange) {
        onStatusChange(updatedTask);
      }
      if (onEditSuccess) {
        onEditSuccess(updatedTask);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      notificationService.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (newPriority === currentTask.priority) return;

    try {
      const updatedTask = await editTaskByIDAPI(
        currentTask.task_id,
        { priority: newPriority },
        'this'
      );
      setCurrentTask({ ...currentTask, priority: newPriority });
      if (onEditSuccess) {
        onEditSuccess(updatedTask);
      }
      notificationService.success("Priority updated");
    } catch (error) {
      console.error("Error updating priority:", error);
      notificationService.error(error.response?.data?.message || "Failed to update priority");
    }
  };

  return (
    <>
      <article
        onClick={() => setIsDetailOpen(true)}
        className="group relative flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
      >
        <span
          className={`absolute inset-y-6 left-0 w-1 rounded-full bg-gradient-to-b from-transparent via-current to-transparent ${status.accent}`}
        />
        <div className="flex-1">
          <header className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${status.accent}`}
              />
              <h3 className="text-xl font-bold text-slate-900">
                {currentTask.title}
              </h3>
            </div>
          </header>

          <div className="mb-4">
            <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap break-words line-clamp-6">
              {currentTask.description || "No description provided."}
            </p>
          </div>

          <footer className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium">
            <div 
              className="text-slate-400 flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <span>Priority:</span>
              <select
                value={currentTask.priority || "medium"}
                onChange={(e) => handlePriorityChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <option value="low" className="bg-white text-slate-900">Low</option>
                <option value="medium" className="bg-white text-slate-900">Medium</option>
                <option value="high" className="bg-white text-slate-900">High</option>
              </select>
            </div>
            <div 
              className="text-slate-400 flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <span>Status:</span>
              <select
                value={currentTask.status || "todo"}
                onChange={handleStatusChange}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={isUpdatingStatus}
                className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${
                  currentTask.status === "todo"
                    ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                    : currentTask.status === "in_progress"
                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                } ${isUpdatingStatus ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <option value="todo" className="bg-white text-slate-900">Not Started</option>
                <option value="in_progress" className="bg-white text-slate-900">In Progress</option>
                <option value="done" className="bg-white text-slate-900">Done</option>
              </select>
            </div>
            {currentTask.start_date && (
              <span className="flex items-center gap-1 text-slate-400">
                <Clock3 size={14} />
                Start: {formatDate(currentTask.start_date)}
              </span>
            )}
            {currentTask.due_date && (
              <span className="flex items-center gap-1 text-slate-400">
                <Clock3 size={14} />
                Due: {formatDate(currentTask.due_date)}
              </span>
            )}
          </footer>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6">
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleDelete();
            }}
            type="button"
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            Delete Task
          </button>
        </div>
      </article>

      {isDetailOpen && (
        <TaskDetail 
          task={currentTask} 
          onClose={() => setIsDetailOpen(false)}
          onUpdate={(updatedTask) => {
            setCurrentTask(updatedTask);
            if (onEditSuccess) {
              onEditSuccess(updatedTask);
            }
          }}
        />
      )}
    </>
  );
};

export default TaskCard;

