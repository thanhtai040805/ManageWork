import React, { useContext, useState, useMemo } from "react";
import { AuthContext } from "../../context/authContext";
import {
  createToDoTaskAPI,
  editTaskByIDAPI,
} from "../../services/task.service";
import { notificationService } from "../../services/notification.service";
import { useTaskForm, parseDateTimeLocal } from "./hooks/useTaskForm";
import { RecurrenceSection } from "./components/RecurrenceSection";
import { getStatusOptionsForDisplay, PRIORITY_OPTIONS } from "../../utils/taskColors";

export const AddTask = ({
  onClose = () => { },
  onAddSuccess = () => { },
  task,
  onEditSuccess = () => { },
  defaultProjectId = null,
  members = [],
}) => {
  const {
    auth: { user },
  } = useContext(AuthContext);

  const isEditMode = !!task;

  const {
    form,
    setForm,
    handleOnChange,
    toggleRepeatDay,
    taskCount,
    getMaxRepeatUntilDate,
    calculateTaskCount,
    isSameDayString,
  } = useTaskForm(task, isEditMode);

  const handleSubmit = async (event) => {
    event.preventDefault();

// Validation cho recurrence
      if (form.repeat_type !== "none" && !isEditMode) {
        // Kiểm tra start và due phải cùng ngày
        if (!isSameDayString(form.start_date, form.due_date)) {
          notificationService.warning("Để sử dụng tính năng lặp lại, Start date và Due date phải trong cùng một ngày");
          return;
        }
        if (!form.repeat_until) {
          notificationService.warning("Vui lòng chọn ngày kết thúc lặp lại");
          return;
        }
        if (form.repeat_type === "custom" && form.repeat_days?.length === 0) {
          notificationService.warning("Vui lòng chọn ít nhất một ngày trong tuần");
          return;
        }
        if (taskCount === 0) {
          notificationService.warning("Không có tasks nào được tạo. Vui lòng kiểm tra lại ngày bắt đầu và kết thúc");
          return;
        }
        if (taskCount > 100) {
          notificationService.warning("Số lượng tasks vượt quá giới hạn (tối đa 100 tasks)");
          return;
        }
        // Validate repeat_until không được quá 12 tuần
        const dueDate = new Date(form.due_date);
        const repeatUntil = new Date(form.repeat_until + "T23:59:59");
        const weeksDiff = (repeatUntil - dueDate) / (1000 * 60 * 60 * 24 * 7);
        if (weeksDiff > 12) {
          notificationService.warning("Khoảng thời gian lặp lại không được vượt quá 12 tuần");
          return;
        }
      }
    try {
      // Convert datetime-local to ISO string
      const startDateISO = form.start_date
        ? parseDateTimeLocal(form.start_date)
        : null;
      const dueDateISO = form.due_date
        ? parseDateTimeLocal(form.due_date)
        : null;
      // repeat_until chỉ cần date, không cần time
      const repeatUntilISO = form.repeat_until
        ? new Date(form.repeat_until + "T23:59:59").toISOString()
        : null;
      let response;
      if (isEditMode) {
        // Edit mode - không hỗ trợ recurrence
        response = await editTaskByIDAPI(task.task_id, {
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          startDate: startDateISO,
          dueDate: dueDateISO,
          assignedUserId: form.assigned_to || null,
        });
        console.log("Task edited successfully:", response);
        onEditSuccess(response);
      } else {
        // Create mode - hỗ trợ recurrence
        response = await createToDoTaskAPI(
          form.title,
          form.description,
          form.status,
          form.priority,
          startDateISO,
          dueDateISO,
          form.assigned_to || null,
          form.repeat_type !== "none" ? form.repeat_type : null,
          form.repeat_type !== "none" ? form.repeat_days : [],
          repeatUntilISO,
          defaultProjectId
        );
        setForm({
          title: "",
          description: "",
          priority: "medium",
          start_date: "",
          due_date: "",
          status: "todo",
          repeat_type: "none",
          repeat_days: [],
          repeat_until: "",
        });
      }
      // Đóng modal trước, sau đó gọi callback để refresh
      onClose();
      // Gọi callback sau khi đóng modal để refresh tasks list
      if (!isEditMode) {
        const { tasks } = response;
        // Chờ một chút để modal đóng hoàn toàn trước khi refresh
        console.log("ADD TASK DATA:", response);
        onAddSuccess(tasks);
      }
    } catch (error) {
      console.error("Error creating task:", error);
      notificationService.error("Có lỗi xảy ra khi tạo tasks: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-slate-900/40 px-4 py-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-8 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              New task
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              Add to your to-do list
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            &#10005;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 px-8 py-4">
          <div className="grid gap-2">
            <label
              htmlFor="title"
              className="text-sm font-medium text-slate-600"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              placeholder="Project kickoff meeting"
              onChange={handleOnChange}
              value={form.title}
              required
              className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-slate-600"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              onChange={handleOnChange}
              value={form.description}
              placeholder="Add details, action items, or links..."
              rows={4}
              className="resize-none h-24 rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <label
                htmlFor="status"
                className="text-sm font-medium text-slate-600"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleOnChange}
                className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                {getStatusOptionsForDisplay().map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-slate-600">
                Priority
              </span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
                {PRIORITY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium capitalize text-slate-600"
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={opt.value}
                      onChange={handleOnChange}
                      checked={form.priority === opt.value}
                      className="h-4 w-4 accent-indigo-500"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-600">
                Assignee
              </label>
              <AssigneeSelect
                members={members}
                value={form.assigned_to || ""}
                onChange={(userId) => setForm(prev => ({ ...prev, assigned_to: userId }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="start_date"
                className="text-sm font-medium text-slate-600"
              >
                Start date & time
              </label>
              <input
                id="start_date"
                type="datetime-local"
                name="start_date"
                onChange={handleOnChange}
                value={form.start_date}
                className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="due_date"
                className="text-sm font-medium text-slate-600"
              >
                Due date & time
              </label>
              <input
                id="due_date"
                type="datetime-local"
                name="due_date"
                onChange={handleOnChange}
                value={form.due_date}
                className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {form.repeat_type !== "none" &&
              !isSameDayString(form.start_date, form.due_date) && (
                <p className="text-xs text-rose-500">
                  ⚠️ Start and due dates must be on the same day to use
                  recurrence
                </p>
              )}
          </div>

          {/* Recurrence Section */}
          {!isEditMode && (
            <RecurrenceSection
              form={form}
              setForm={setForm}
              handleOnChange={handleOnChange}
              toggleRepeatDay={toggleRepeatDay}
              getMaxRepeatUntilDate={getMaxRepeatUntilDate}
              calculateTaskCount={calculateTaskCount}
              isSameDayString={isSameDayString}
            />
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {isEditMode ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssigneeSelect = ({ members, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredMembers = useMemo(() => {
    if (!search) return members;
    const query = search.toLowerCase();
    return members.filter(m => 
      (m.full_name || "").toLowerCase().includes(query) ||
      (m.username || "").toLowerCase().includes(query)
    );
  }, [members, search]);

  const selectedMember = members.find(m => m.user_id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      >
        {selectedMember ? (
          <span className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">
              {selectedMember.full_name?.[0] || selectedMember.username?.[0] || "?"}
            </div>
            <span className="text-slate-900">{selectedMember.full_name || selectedMember.username}</span>
          </span>
        ) : (
          <span className="text-slate-400">Select assignee...</span>
        )}
        <svg className={`w-4 h-4 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={() => { onChange(""); setIsOpen(false); setSearch(""); }}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 ${!value ? "bg-indigo-50 text-indigo-700" : "text-slate-600"}`}
              >
                Unassigned
              </button>
              {filteredMembers.map((member) => (
                <button
                  key={member.user_id}
                  type="button"
                  onClick={() => { onChange(member.user_id); setIsOpen(false); setSearch(""); }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${value === member.user_id ? "bg-indigo-50 text-indigo-700" : "text-slate-600"}`}
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">
                    {member.full_name?.[0] || member.username?.[0] || "?"}
                  </div>
                  {member.full_name || member.username || "Unknown"}
                </button>
              ))}
              {filteredMembers.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">No results found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
