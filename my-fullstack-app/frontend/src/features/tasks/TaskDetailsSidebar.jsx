import { Calendar, User, Clock, Flag, CheckCircle2, Circle } from "lucide-react";
import { TagManager } from "./TagManager";
import { normalizeEnum, formatDate, formatUser, getStatusColor, getPriorityColor, getPriorityBgColor } from "./utils/formatters";
import { getStatusLabel, getPriorityLabel, STATUS_OPTIONS, PRIORITY_OPTIONS } from "../../utils/taskColors";
import { formatDateTimeLocal } from "./hooks/useTaskForm";
import { editTaskByIDAPI } from "../../services/task.service";

export const TaskDetailsSidebar = ({
  task,
  formData,
  isEditing,
  handleFieldChange,
  handleFieldBlur,
  handleFieldFocus,
  handleSave,
  setIsEditing,
  onUpdate,
}) => {
  return (
    <div className="col-span-10 md:col-span-4 bg-slate-50 p-4 md:p-6 space-y-4 md:space-y-6 border-t md:border-t-0 border-slate-200 overflow-y-auto h-full">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Status
        </label>
        <div>
          {isEditing.status ? (
            <select
              value={formData.status}
              onChange={async (e) => {
                const newValue = e.target.value;
                handleFieldChange("status", newValue);
                // Save immediately with new value
                if (task?.task_id) {
                  try {
                    const updateData = {
                      status: newValue,
                      priority: formData.priority,
                      title: formData.title,
                      description: formData.description,
                      startDate: formData.start_date ? new Date(formData.start_date).toISOString() : null,
                      dueDate: formData.due_date ? new Date(formData.due_date).toISOString() : null,
                    };
                    const updatedTask = await editTaskByIDAPI(task.task_id, updateData);
                    setIsEditing((prev) => ({ ...prev, status: false }));
                    if (onUpdate) onUpdate(updatedTask);
                  } catch (error) {
                    console.error("Failed to update status:", error);
                  }
                }
              }}
              onBlur={() =>
                setIsEditing((prev) => ({ ...prev, status: false }))
              }
              className="w-full border-2 border-indigo-500 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              autoFocus
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => handleFieldFocus("status")}
              className={`w-full text-left px-3 py-2 rounded-md border text-sm font-medium cursor-pointer hover:opacity-80 transition flex items-center gap-2 ${getStatusColor(formData.status)}`}
            >
              {formData.status === "done" ? (
                <CheckCircle2 size={16} />
              ) : formData.status === "in_progress" ? (
                <Circle size={16} className="fill-current" />
              ) : (
                <Circle size={16} />
              )}
              <span>{normalizeEnum(formData.status)}</span>
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200"></div>

      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Details
        </h4>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
            <Flag size={14} />
            Priority
          </label>
          <div>
            {isEditing.priority ? (
              <select
                value={formData.priority}
                onChange={async (e) => {
                  const newValue = e.target.value;
                  handleFieldChange("priority", newValue);
                  if (task?.task_id) {
                    try {
                      const updateData = {
                        priority: newValue,
                        status: formData.status,
                        title: formData.title,
                        description: formData.description,
                        startDate: formData.start_date ? new Date(formData.start_date).toISOString() : null,
                        dueDate: formData.due_date ? new Date(formData.due_date).toISOString() : null,
                      };
                      const updatedTask = await editTaskByIDAPI(task.task_id, updateData);
                      setIsEditing((prev) => ({ ...prev, priority: false }));
                      if (onUpdate) onUpdate(updatedTask);
                    } catch (error) {
                      console.error("Failed to update priority:", error);
                    }
                  }
                }}
                onBlur={() =>
                  setIsEditing((prev) => ({
                    ...prev,
                    priority: false,
                  }))
                }
                className="w-full border-2 border-indigo-500 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <button
                onClick={() => handleFieldFocus("priority")}
                className={`w-full text-left px-3 py-2 rounded-md border text-sm font-medium cursor-pointer hover:opacity-80 transition flex items-center gap-2 ${getPriorityBgColor(formData.priority)} ${getPriorityColor(formData.priority)}`}
              >
                <Flag size={14} />
                <span>{normalizeEnum(formData.priority)}</span>
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200"></div>

        <div className="pt-2">
          <TagManager taskId={task?.task_id} />
        </div>

        <div className="border-t border-slate-200"></div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
            <User size={14} />
            Assignee
          </label>
          <div className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-700">
            {formatUser(task?.assignee_name, task?.assignee_username)}
          </div>
        </div>

        <div className="border-t border-slate-200"></div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
            <Calendar size={14} />
            Start Date
          </label>
          <div>
            {isEditing.startDate ? (
              <input
                type="datetime-local"
                value={
                  formData.start_date
                    ? formatDateTimeLocal(formData.start_date)
                    : ""
                }
                onChange={(e) =>
                  handleFieldChange("start_date", e.target.value)
                }
                onBlur={() => handleFieldBlur("start_date")}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleFieldChange("start_date", task?.start_date || "");
                    setIsEditing((prev) => ({
                      ...prev,
                      startDate: false,
                    }));
                  }
                }}
                className="w-full border-2 border-indigo-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
              />
            ) : (
              <button
                onClick={() => handleFieldFocus("startDate")}
                className="w-full text-left px-3 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-700 cursor-pointer hover:bg-slate-50 transition"
              >
                {formData.start_date
                  ? formatDate(formData.start_date, {
                    withTime: true,
                  })
                  : "None"}
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200"></div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
            <Clock size={14} />
            Due Date
          </label>
          <div>
            {isEditing.dueDate ? (
              <input
                type="datetime-local"
                value={
                  formData.due_date
                    ? formatDateTimeLocal(formData.due_date)
                    : ""
                }
                onChange={(e) =>
                  handleFieldChange("due_date", e.target.value)
                }
                onBlur={() => handleFieldBlur("due_date")}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleFieldChange("due_date", task?.due_date || "");
                    setIsEditing((prev) => ({
                      ...prev,
                      dueDate: false,
                    }));
                  }
                }}
                className="w-full border-2 border-indigo-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
              />
            ) : (
              <button
                onClick={() => handleFieldFocus("dueDate")}
                className="w-full text-left px-3 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-700 cursor-pointer hover:bg-slate-50 transition"
              >
                {formData.due_date
                  ? formatDate(formData.due_date, { withTime: true })
                  : "None"}
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200"></div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
            <User size={14} />
            Reporter
          </label>
          <div className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-700">
            {formatUser(task?.creator_name, task?.creator_username)}
          </div>
        </div>

        <div className="border-t border-slate-200"></div>

        <div className="space-y-3 text-xs text-slate-500">
          <div>
            <span className="font-medium">Created:</span>{" "}
            {formatDate(task?.created_at, { withTime: true })}
          </div>
          <div>
            <span className="font-medium">Updated:</span>{" "}
            {formatDate(task?.updated_at, { withTime: true })}
          </div>
        </div>
      </div>
    </div>
  );
};