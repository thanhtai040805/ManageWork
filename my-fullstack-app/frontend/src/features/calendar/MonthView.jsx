import React from "react";
import { getMonthDays, isSameDay } from "../../utils/dateHelpers";
import { getStatusBadgeClass, getPriorityLabel, getAutoStatus } from "../../utils/taskColors";

export const MonthView = ({
  currentDate,
  tasks,
  onTaskClick,
}) => {
  const monthDays = getMonthDays(currentDate);

  return (
    <div className="rounded-3xl bg-white p-4 md:p-6 shadow-lg shadow-slate-100 overflow-x-auto">
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4 min-w-[700px]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs md:text-sm font-semibold text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 min-w-[700px]">
        {monthDays.map((dayObj, index) => {
          const day = dayObj.date;
          const dayKey = day.toISOString().split("T")[0];
          const dayTasks = tasks.filter((task) => isSameDay(task.due_date, day));
          const isToday = day.toDateString() === new Date().toDateString();
          const isCurrentMonth = dayObj.isCurrentMonth;

          return (
            <div key={index} className={`min-h-[80px] p-2 rounded-lg border ${isToday ? "border-indigo-500 bg-indigo-50" : "border-slate-200"} ${!isCurrentMonth ? "opacity-40" : ""}`}>
              <div className={`text-xs md:text-sm font-medium mb-1 ${isToday ? "text-indigo-600" : "text-slate-600"}`}>{day.getDate()}</div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <div key={task.task_id} onClick={() => onTaskClick(task)} className={`text-xs p-1 rounded truncate cursor-pointer font-medium ${getStatusBadgeClass(getAutoStatus(task))}`}>
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && <div className="text-xs text-slate-400">+{dayTasks.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};