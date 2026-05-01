import { 
  X, 
  Calendar, 
  User, 
  Clock, 
  Flag, 
  FileText, 
  CheckCircle2,
  Circle,
  Star
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SubtaskList } from "./SubtaskList";
import { TaskComments } from "./TaskComments";
import { TagManager } from "./TagManager";
import { AttachmentManager } from "./AttachmentManager";
import { DependencyManager } from "./DependencyManager";
import { useTaskDetail } from "./hooks/useTaskDetail";
import { TaskApplyToModal } from "./components/TaskApplyToModal";
import { 
  normalizeEnum, 
  formatDate, 
  formatUser, 
  getStatusColor, 
  getPriorityColor 
} from "./utils/formatters";
import { formatDateTimeLocal } from "./hooks/useTaskForm";

export const TaskDetail = ({
  onClose = () => {},
  task,
  onUpdate,
  myDayTaskIdsSet,
  onToggleMyDay,
}) => {
  const {
    isEditing,
    setIsEditing,
    formData,
    isSaving,
    showApplyToModal,
    setShowApplyToModal,
    applyToOption,
    setApplyToOption,
    isRecurringTask,
    handleFieldChange,
    handleFieldBlur,
    handleFieldFocus,
    handleSave,
  } = useTaskDetail(task, onUpdate);

  const isInMyDay = myDayTaskIdsSet?.has(String(task?.task_id));
  const description = formData.description?.trim() || "No description provided.";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 px-2 py-4 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-2xl my-4 flex flex-col max-h-[calc(100vh-2rem)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 md:px-6 py-3 bg-white sticky top-0 z-20">
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
                      handleFieldChange("title", task?.title || "");
                      setIsEditing((prev) => ({ ...prev, title: false }));
                    }
                  }}
                  className="text-lg md:text-xl font-semibold text-slate-900 w-full border-2 border-indigo-500 rounded px-2 md:px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  autoFocus
                />
              ) : (
                <h2
                  className="text-lg md:text-xl font-semibold text-slate-900 cursor-text hover:bg-slate-50 rounded px-2 py-1 -mx-2 transition truncate"
                  onClick={() => handleFieldFocus("title")}
                  title={formData.title || "Untitled Task"}
                >
                  {formData.title || "Untitled Task"}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-2 ml-2 md:ml-4">
              {isSaving && (
                <span className="text-xs text-slate-500">Saving...</span>
              )}
              {onToggleMyDay && (
                <button
                  type="button"
                  onClick={() => onToggleMyDay?.(task?.task_id)}
                  className={`p-1.5 rounded-lg transition ${
                    isInMyDay
                      ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                      : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                  }`}
                  title={isInMyDay ? "Remove from My Day" : "Add to My Day"}
                >
                  <Star size={18} fill={isInMyDay ? "currentColor" : "none"} />
                </button>
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

          {/* Main Content - Flex Layout */}
          <div className="flex-1 overflow-hidden">
            <div className="flex flex-col lg:flex-row h-full max-h-[calc(100vh-8rem)]">
              {/* Left Side - Main Content */}
              <div className="flex-1 p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4 lg:space-y-6 overflow-y-auto min-h-0 custom-scrollbar">
                {/* Description Section */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-slate-500" />
                    <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Description
                    </h3>
                  </div>
                  <div className="min-h-[120px] md:min-h-[150px] lg:min-h-[200px]">
                    {isEditing.description ? (
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleFieldChange("description", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("description")}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            handleFieldChange("description", task?.description || "");
                            setIsEditing((prev) => ({
                              ...prev,
                              description: false,
                            }));
                          }
                        }}
                        className="w-full min-h-[120px] md:min-h-[150px] lg:min-h-[200px] text-sm leading-relaxed text-slate-700 border-2 border-indigo-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
                        autoFocus
                        placeholder="Add a description..."
                      />
                    ) : (
                      <div
                        className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap break-words cursor-text hover:bg-slate-50 rounded-xl px-3 md:px-4 py-2 md:py-3 min-h-[120px] md:min-h-[150px] lg:min-h-[200px] border border-transparent hover:border-indigo-100 transition-all bg-white/50 backdrop-blur-sm"
                        onClick={() => handleFieldFocus("description")}
                      >
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{description}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Subtasks Section */}
                <section className="pt-3 md:pt-4 border-t border-slate-100">
                  <SubtaskList taskId={task?.task_id} />
                </section>

                {/* Attachments Section */}
                <section className="pt-3 md:pt-4 border-t border-slate-100">
                  <AttachmentManager taskId={task?.task_id} />
                </section>

                {/* Dependencies Section */}
                <section className="pt-3 md:pt-4 border-t border-slate-100">
                  <DependencyManager taskId={task?.task_id} projectId={task?.project_id} />
                </section>

                {/* Comments Section */}
                <section className="pt-4 md:pt-6 border-t border-slate-100">
                  <TaskComments taskId={task?.task_id} />
                </section>
              </div>

              {/* Right Sidebar - Details */}
              <div className="w-full lg:w-[360px] xl:w-[400px] bg-slate-50 p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4 lg:space-y-6 border-t lg:border-t-0 border-slate-200 overflow-y-auto min-h-0 custom-scrollbar flex-shrink-0">
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
                          const newValue = e.target.value;
                          handleFieldChange("status", newValue);
                          setIsEditing((prev) => ({ ...prev, status: false }));
                          handleSave("this", { ...formData, status: newValue });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full border-2 border-indigo-500 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        autoFocus
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    ) : (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFieldFocus("status");
                        }}
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
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200"></div>

                {/* Details Section */}
                <div className="space-y-3 md:space-y-4">
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
                            const newValue = e.target.value;
                            handleFieldChange("priority", newValue);
                            setIsEditing((prev) => ({ ...prev, priority: false }));
                            handleSave("this", { ...formData, priority: newValue });
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full border-2 border-indigo-500 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          autoFocus
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      ) : (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFieldFocus("priority");
                          }}
                          className="w-full text-left px-3 py-2 rounded-md border border-slate-200 bg-white text-sm font-medium cursor-pointer hover:bg-slate-50 transition flex items-center gap-2"
                        >
                          <Flag
                            size={14}
                            className={getPriorityColor(formData.priority)}
                          />
                          <span className={getPriorityColor(formData.priority)}>
                            {normalizeEnum(formData.priority)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-200"></div>

                  {/* Tags */}
                  <div className="pt-1 md:pt-2">
                    <TagManager taskId={task?.task_id} />
                  </div>

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

                  <div className="border-t border-slate-200"></div>

                  {/* Dates Info */}
                  <div className="space-y-2 text-xs text-slate-500">
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

      <TaskApplyToModal 
        show={showApplyToModal && isRecurringTask}
        isSaving={isSaving}
        applyToOption={applyToOption}
        setApplyToOption={setApplyToOption}
        onCancel={() => setShowApplyToModal(false)}
        onSave={handleSave}
      />
    </>
  );
};
