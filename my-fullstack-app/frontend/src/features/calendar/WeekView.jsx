import React, { useMemo } from "react";
import { X } from "lucide-react";
import { getWeekDays, isSameDay } from "../../utils/dateHelpers";
import { getPriorityBadgeClass, getStatusBadgeClass, getStatusSelectClass, getPriorityLabel, getStatusLabel, getAutoStatus, STATUS_OPTIONS, PRIORITY_OPTIONS } from "../../utils/taskColors";
import { updateTaskStatusAPI } from "../../services/task.service";
import { deleteTaskByIDAPI } from "../../services/task.service";
import { confirm } from "../../components/common/ConfirmModal";

export const WeekView = ({
  currentDate,
  tasks,
  onTaskClick,
  onTaskDelete,
  onTaskStatusChange,
}) => {
  const weekDays = useMemo(() => {
    return getWeekDays(currentDate);
  }, [currentDate]);

  const tasksByDay = useMemo(() => {
    const grouped = {};
    weekDays.forEach((day) => {
      grouped[day.toISOString().split("T")[0]] = {
        day,
        tasks: tasks.filter((task) => isSameDay(task.due_date, day)),
      };
    });
    return grouped;
  }, [weekDays, tasks]);

  const handleStatusChange = async (taskId, newStatus, e) => {
    e.stopPropagation();
    const task = tasks.find((t) => t.task_id === taskId);
    if (!task || task.status === newStatus) return;

    try {
      const updatedTask = await updateTaskStatusAPI(taskId, newStatus, task.status);
      onTaskStatusChange(updatedTask);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    const ok = await confirm({
      title: "Delete Task",
      message: "Are you sure you want to delete this task?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    
    deleteTaskByIDAPI(taskId)
      .then(() => {
        onTaskDelete(taskId);
      })
      .catch((error) => {
        console.error("Error deleting task:", error);
      });
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-100 overflow-x-auto">
      <div className="grid grid-cols-7 gap-3 min-w-[1200px]">
        {weekDays.map((day) => {
          const dayKey = day.toISOString().split("T")[0];
          const dayTasks = tasksByDay[dayKey]?.tasks || [];
          const isToday = day.toDateString() === new Date().toDateString();
          const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
          const dayNumber = day.getDate();
          const monthName = day.toLocaleDateString("en-US", { month: "short" });

          const dayTodoTasks = dayTasks.filter((task) => task.status !== "done");
          const dayCompletedTasks = dayTasks.filter((task) => task.status === "done");

          return (
            <div key={dayKey} className={`flex flex-col rounded-xl border-2 ${isToday ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"}`}>
              <div className={`p-3 border-b ${isToday ? "bg-indigo-100 border-indigo-200" : "bg-slate-50 border-slate-200"}`}>
                <div className="text-xs font-semibold text-slate-500 uppercase">{dayName}</div>
                <div className={`text-2xl font-bold mt-1 ${isToday ? "text-indigo-600" : "text-slate-900"}`}>{dayNumber}</div>
                <div className="text-xs text-slate-400 mt-1">{monthName}</div>
                <div className="mt-2 text-xs text-slate-500">{dayTodoTasks.length} task{dayTodoTasks.length !== 1 ? "s" : ""}</div>
              </div>

              <div className="flex-1 p-3 space-y-2 overflow-y-auto min-h-[500px] max-h-[700px]">
                {dayTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-400">No tasks</p>
                  </div>
                ) : (
                  <>
                    {dayTodoTasks.map((task) => (
                      <div key={task.task_id} onClick={() => onTaskClick(task)} className="group relative p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition cursor-pointer">
                        <button onClick={(e) => handleDeleteTask(task.task_id, e)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-100 text-rose-500 transition" title="Delete task">
                          <X size={14} />
                        </button>

                        <div className="text-sm font-semibold text-slate-900 line-clamp-2">{task.title}</div>
                        {task.description && <div className="text-sm text-slate-600 mt-2 line-clamp-4 leading-relaxed">{task.description}</div>}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded ${getPriorityBadgeClass(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${getStatusBadgeClass(getAutoStatus(task))}`}>
                            {getStatusLabel(getAutoStatus(task))}
                          </span>
                          <select value={task.status || "todo"} onChange={(e) => handleStatusChange(task.task_id, e.target.value, e)} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className={`text-xs font-medium px-2 py-0.5 rounded border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${getStatusSelectClass(task.status)}`}>
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value} className="bg-white text-slate-900">{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        {task.due_date && <div className="text-xs text-slate-400 mt-1">{new Date(task.due_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>}
                      </div>
                    ))}

                    {dayCompletedTasks.map((task) => (
                      <div key={task.task_id} className="group p-2 rounded-lg bg-emerald-50 border border-emerald-200 opacity-75 flex items-start gap-2">
                        <div className="text-sm font-semibold text-slate-700 line-clamp-2 line-through">{task.title}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};