import { useState, useEffect } from "react";
import { editTaskByIDAPI } from "../../services/task.service";
import { 
  X, 
  Calendar, 
  User, 
  Clock, 
  Flag, 
  FileText, 
  CheckCircle2,
  Circle
} from "lucide-react";

export const TaskDetail = ({ onClose = () => {}, task, onUpdate }) => {
  const [isEditing, setIsEditing] = useState({
    title: false,
    description: false,
    status: false,
    priority: false,
    startDate: false,
    dueDate: false,
  });

  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    start_date: task?.start_date || "",
    due_date: task?.due_date || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showApplyToModal, setShowApplyToModal] = useState(false);
  const [applyToOption, setApplyToOption] = useState("this");

  // Check if task is part of recurring series
  const isRecurringTask =
    task?.recurring_task_id !== null && task?.recurring_task_id !== undefined;

  // Fields that should trigger "Apply to" modal (theo ClickUp: không hỏi status)
  const fieldsThatTriggerModal = [
    "title",
    "description",
    "priority",
    "start_date",
    "due_date",
  ];

  // Update formData when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        start_date: task.start_date || "",
        due_date: task.due_date || "",
      });
    }
  }, [task]);

  const normalizeEnum = (value) => {
    if (!value) return "-";
    return String(value)
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatDate = (value, { withTime = false } = {}) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return withTime
      ? date.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : date.toLocaleDateString(undefined, { dateStyle: "medium" });
  };

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const parseDateTimeLocal = (dateTimeLocal) => {
    if (!dateTimeLocal) return null;
    return new Date(dateTimeLocal).toISOString();
  };

  const formatUser = (name, username) => {
    if (!name && !username) return "-";
    if (name && username) return `${name} (@${username})`;
    return name || `@${username}`;
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (applyTo = "this") => {
    if (!task?.task_id) return;

    setIsSaving(true);
    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.start_date
          ? parseDateTimeLocal(formData.start_date)
          : null,
        dueDate: formData.due_date
          ? parseDateTimeLocal(formData.due_date)
          : null,
        assignedUserId: task.assigned_to || null,
      };

      const updatedTask = await editTaskByIDAPI(
        task.task_id,
        updateData,
        applyTo
      );

      // Update local state
      setIsEditing({
        title: false,
        description: false,
        status: false,
        priority: false,
        startDate: false,
        dueDate: false,
      });

      // Notify parent component
      if (onUpdate) {
        onUpdate(updatedTask);
      }

      // Close modal
      setShowApplyToModal(false);
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldBlur = (field) => {
    // Map field names for comparison
    const taskFieldMap = {
      title: "title",
      description: "description",
      status: "status",
      priority: "priority",
      start_date: "start_date",
      due_date: "due_date",
    };

    const taskField = taskFieldMap[field] || field;
    const originalValue = task?.[taskField] || "";
    const currentValue = formData[field];

    let hasChanges = false;
    // For dates, compare ISO strings
    if (field === "start_date" || field === "due_date") {
      const originalISO = task?.[taskField]
        ? new Date(task[taskField]).toISOString()
        : "";
      const currentISO = currentValue ? parseDateTimeLocal(currentValue) : "";
      hasChanges = originalISO !== currentISO;
    } else {
      hasChanges = originalValue !== currentValue;
    }

    if (hasChanges) {
      // Check if should show modal (recurring task + field triggers modal)
      if (isRecurringTask && fieldsThatTriggerModal.includes(field)) {
        // Show modal, user will choose applyTo option
        setShowApplyToModal(true);
      } else {
        // Status changes hoặc non-recurring task → save directly
        handleSave("this");
      }
    }

    // Map editing state field names
    const editingFieldMap = {
      title: "title",
      description: "description",
      status: "status",
      priority: "priority",
      start_date: "startDate",
      due_date: "dueDate",
    };

    const editingField = editingFieldMap[field] || field;
    setIsEditing((prev) => ({
      ...prev,
      [editingField]: false,
    }));
  };

  const handleFieldFocus = (field) => {
    // Map field names for editing state
    const editingFieldMap = {
      title: "title",
      description: "description",
      status: "status",
      priority: "priority",
      startDate: "startDate",
      dueDate: "dueDate",
    };

    const editingField = editingFieldMap[field] || field;
    setIsEditing((prev) => ({
      ...prev,
      [editingField]: true,
    }));
  };

  const description =
    formData.description?.trim() || "No description provided.";

  // Status và Priority styling helpers
  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "text-rose-600 bg-rose-50 border-rose-200";
      case "in_progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "done":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-rose-600";
      case "medium":
        return "text-amber-600";
      case "low":
        return "text-emerald-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-2 py-2 backdrop-blur-sm">
        <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white sticky top-0 z-20">
            <div className="flex-1 min-w-0">
              {isEditing.title ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  onBlur={() => handleFieldBlur("title")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.target.blur();
                    }
                    if (e.key === "Escape") {
                      setFormData((prev) => ({
                        ...prev,
                        title: task?.title || "",
                      }));
                      setIsEditing((prev) => ({ ...prev, title: false }));
                    }
                  }}
                  className="text-xl font-semibold text-slate-900 w-full border-2 border-indigo-500 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  autoFocus
                />
              ) : (
                <h2
                  className="text-xl font-semibold text-slate-900 cursor-text hover:bg-slate-50 rounded px-2 py-1 -mx-2 transition truncate"
                  onClick={() => handleFieldFocus("title")}
                  title={formData.title || "Untitled Task"}
                >
                  {formData.title || "Untitled Task"}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              {isSaving && (
                <span className="text-xs text-slate-500">Saving...</span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Main Content - 6-4 Layout */}
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-10 h-full">
              {/* Left Side - Main Content (6 cols) */}
              <div className="col-span-10 md:col-span-6 p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto border-r-0 md:border-r border-slate-200">
                {/* Description Section */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Description
                    </h3>
                  </div>
                  <div className="min-h-[200px]">
                    {isEditing.description ? (
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleFieldChange("description", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("description")}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setFormData((prev) => ({
                              ...prev,
                              description: task?.description || "",
                            }));
                            setIsEditing((prev) => ({
                              ...prev,
                              description: false,
                            }));
                          }
                        }}
                        className="w-full min-h-[200px] text-sm leading-relaxed text-slate-700 border-2 border-indigo-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
                        autoFocus
                        placeholder="Add a description..."
                      />
                    ) : (
                      <div
                        className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap break-words cursor-text hover:bg-slate-50 rounded-md px-3 py-2 min-h-[200px] border border-transparent hover:border-slate-200 transition"
                        onClick={() => handleFieldFocus("description")}
                      >
                        {description}
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Sidebar - Details (4 cols) */}
              <div className="col-span-10 md:col-span-4 bg-slate-50 p-4 md:p-6 space-y-4 md:space-y-6 border-t md:border-t-0 border-slate-200 overflow-y-auto h-full">
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </label>
                  <div>
                    {isEditing.status ? (
                      <select
                        value={formData.status}
                        onChange={(e) => {
                          handleFieldChange("status", e.target.value);
                          handleSave();
                        }}
                        onBlur={() =>
                          setIsEditing((prev) => ({ ...prev, status: false }))
                        }
                        className="w-full border-2 border-indigo-500 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        autoFocus
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => handleFieldFocus("status")}
                        className={`w-full text-left px-3 py-2 rounded-md border text-sm font-medium cursor-pointer hover:opacity-80 transition ${getStatusColor(
                          formData.status
                        )}`}
                      >
                        <div className="flex items-center gap-2">
                          {formData.status === "done" ? (
                            <CheckCircle2 size={16} />
                          ) : formData.status === "in_progress" ? (
                            <Circle size={16} className="fill-current" />
                          ) : (
                            <Circle size={16} />
                          )}
                          <span>{normalizeEnum(formData.status)}</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200"></div>

                {/* Details Section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Details
                  </h4>

                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Flag size={14} />
                      Priority
                    </label>
                    <div>
                      {isEditing.priority ? (
                        <select
                          value={formData.priority}
                          onChange={(e) => {
                            handleFieldChange("priority", e.target.value);
                            handleSave();
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
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      ) : (
                        <button
                          onClick={() => handleFieldFocus("priority")}
                          className="w-full text-left px-3 py-2 rounded-md border border-slate-200 bg-white text-sm font-medium cursor-pointer hover:bg-slate-50 transition flex items-center gap-2"
                        >
                          <Flag
                            size={14}
                            className={getPriorityColor(formData.priority)}
                          />
                          <span className={getPriorityColor(formData.priority)}>
                            {normalizeEnum(formData.priority)}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-200"></div>

                  {/* Assignee */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <User size={14} />
                      Assignee
                    </label>
                    <div className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-700">
                      {formatUser(task?.assignee_name, task?.assignee_username)}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-200"></div>

                  {/* Start Date */}
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
                              setFormData((prev) => ({
                                ...prev,
                                start_date: task?.start_date || "",
                              }));
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

                  {/* Divider */}
                  <div className="border-t border-slate-200"></div>

                  {/* Due Date */}
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
                              setFormData((prev) => ({
                                ...prev,
                                due_date: task?.due_date || "",
                              }));
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

                  {/* Divider */}
                  <div className="border-t border-slate-200"></div>

                  {/* Reporter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <User size={14} />
                      Reporter
                    </label>
                    <div className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-700">
                      {formatUser(task?.creator_name, task?.creator_username)}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-200"></div>

                  {/* Dates Info */}
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
            </div>
          </div>
        </div>
      </div>

      {/* Apply To Modal - chỉ hiện khi edit recurring task */}
      {showApplyToModal && isRecurringTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Apply changes to
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              This task is part of a recurring series. How would you like to
              apply these changes?
            </p>

            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="applyTo"
                  value="this"
                  checked={applyToOption === "this"}
                  onChange={(e) => setApplyToOption(e.target.value)}
                  className="h-4 w-4 accent-indigo-500"
                />
                <div>
                  <div className="font-medium text-slate-900">
                    This task only
                  </div>
                  <div className="text-xs text-slate-500">
                    Only update this specific task
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="applyTo"
                  value="future"
                  checked={applyToOption === "future"}
                  onChange={(e) => setApplyToOption(e.target.value)}
                  className="h-4 w-4 accent-indigo-500"
                />
                <div>
                  <div className="font-medium text-slate-900">
                    This and future tasks
                  </div>
                  <div className="text-xs text-slate-500">
                    Update this task and all future tasks in the series
                  </div>
                </div>
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowApplyToModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave(applyToOption)}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Apply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

