import React from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { formatDateRange } from "../utils/dateHelpers";

export const MyTasksHeader = ({
  viewType,
  onViewTypeChange,
  currentDate,
  dateRange,
  onPrevious,
  onNext,
  onToday,
  onAddTask,
}) => {
  return (
    <div className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-lg shadow-slate-100">
      <div className="flex items-center gap-4">
        {/* View Type Toggle */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-1">
          <button
            type="button"
            onClick={() => onViewTypeChange("week")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              viewType === "week"
                ? "bg-indigo-500 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => onViewTypeChange("month")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              viewType === "month"
                ? "bg-indigo-500 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Month
          </button>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevious}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNext}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Date Range Display */}
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar size={18} />
          <span className="text-sm font-medium">
            {formatDateRange(dateRange.start, dateRange.end, viewType)}
          </span>
        </div>
      </div>

      {/* Add Task Button */}
      <button
        type="button"
        onClick={onAddTask}
        className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      >
        <Plus size={16} />
        Add Task
      </button>
    </div>
  );
};

