import React from "react";
import { getMonthDays, isSameDay } from "../utils/dateHelpers";

export const MonthView = ({ currentDate, tasks, onTaskClick }) => {
  const monthDays = getMonthDays(currentDate);

  return (
    <div className="rounded-3xl bg-white p-4 md:p-6 shadow-lg shadow-slate-100 overflow-x-auto">
      {/* Calendar Header - Day names */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4 min-w-[700px]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs md:text-sm font-semibold text-slate-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 min-w-[700px]">
        {monthDays.map((dayObj, index) => {
          const { date, isCurrentMonth } = dayObj;
          const dayKey = date.toISOString().split("T")[0];
          const dayTasks = tasks.filter((task) =>
            isSameDay(task.due_date, date)
          );
          const isToday =
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear();

          // Separate tasks by status
          const dayTodoTasks = dayTasks.filter(
            (task) => task.status !== "done"
          );
          const dayCompletedTasks = dayTasks.filter(
            (task) => task.status === "done"
          );

          return (
            <div
              key={`${dayKey}-${index}`}
              className={`min-h-[100px] md:min-h-[140px] border rounded-lg p-1 md:p-2 transition flex flex-col ${
                isToday
                  ? "border-2 border-indigo-500 bg-indigo-50 shadow-md"
                  : isCurrentMonth
                  ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  : "border-slate-100 bg-slate-50 opacity-50"
              }`}
            >
              {/* Day number */}
              <div
                className={`text-xs md:text-sm font-semibold mb-1 md:mb-2 ${
                  isToday
                    ? "text-indigo-600"
                    : isCurrentMonth
                    ? "text-slate-700"
                    : "text-slate-400"
                }`}
              >
                {date.getDate()}
              </div>

              {/* Tasks for this day */}
              <div className="flex-1 space-y-1 overflow-hidden">
                {/* Display up to 3 tasks total (prioritize todo tasks) */}
                {(() => {
                  const maxVisible = 3;
                  const visibleTodoTasks = dayTodoTasks.slice(0, maxVisible);
                  const remainingSlots = maxVisible - visibleTodoTasks.length;
                  const visibleCompletedTasks = dayCompletedTasks.slice(
                    0,
                    Math.max(0, remainingSlots)
                  );
                  const totalVisible =
                    visibleTodoTasks.length + visibleCompletedTasks.length;
                  const remainingTasks =
                    dayTodoTasks.length -
                    visibleTodoTasks.length +
                    dayCompletedTasks.length -
                    visibleCompletedTasks.length;

                  return (
                    <>
                      {/* Todo Tasks */}
                      {visibleTodoTasks.map((task) => (
                        <div
                          key={task.task_id}
                          onClick={() => onTaskClick(task)}
                          className={`text-[10px] md:text-xs p-1 md:p-1.5 rounded cursor-pointer transition hover:shadow-sm hover:scale-[1.02] ${
                            task.priority === "high"
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : task.priority === "medium"
                              ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                          title={`${task.title}${
                            task.description ? ` - ${task.description}` : ""
                          }`}
                        >
                          <div className="font-medium truncate">
                            {task.title}
                          </div>
                          {task.due_date && (
                            <div className="text-[9px] md:text-[10px] opacity-75 mt-0.5 hidden md:block">
                              {new Date(task.due_date).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Completed Tasks */}
                      {visibleCompletedTasks.map((task) => (
                        <div
                          key={task.task_id}
                          onClick={() => onTaskClick(task)}
                          className="text-[10px] md:text-xs p-1 md:p-1.5 rounded cursor-pointer bg-emerald-50 text-emerald-700 border border-emerald-200 line-through opacity-75 hover:opacity-100 transition"
                          title={task.title}
                        >
                          <div className="font-medium truncate">
                            {task.title}
                          </div>
                        </div>
                      ))}

                      {/* Show more indicator */}
                      {remainingTasks > 0 && (
                        <div className="text-[10px] text-slate-500 px-1 pt-1 font-medium">
                          +{remainingTasks} more
                        </div>
                      )}

                      {/* Empty state */}
                      {totalVisible === 0 && isCurrentMonth && (
                        <div className="text-[10px] text-slate-300 text-center py-2">
                          No tasks
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-rose-100 border border-rose-200"></div>
          <span className="hidden sm:inline">High Priority</span>
          <span className="sm:hidden">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-indigo-100 border border-indigo-200"></div>
          <span className="hidden sm:inline">Medium Priority</span>
          <span className="sm:hidden">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></div>
          <span className="hidden sm:inline">Low Priority / Completed</span>
          <span className="sm:hidden">Low / Done</span>
        </div>
      </div>
    </div>
  );
};

