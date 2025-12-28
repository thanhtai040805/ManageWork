import React, { useContext, useState, useMemo } from "react";
import { AuthContext } from "../../context/authContext";
import {
  createToDoTaskAPI,
  editTaskByIDAPI,
} from "../../services/task.service";

// Helper function to convert ISO string to datetime-local format
const formatDateTimeLocal = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  // Format: YYYY-MM-DDTHH:mm (datetime-local format)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper function to convert datetime-local format to ISO string
// datetime-local là local time của user, cần convert đúng sang UTC để lưu vào database
const parseDateTimeLocal = (dateTimeLocal) => {
  if (!dateTimeLocal) return null;
  // datetime-local format: YYYY-MM-DDTHH:mm
  const [datePart, timePart] = dateTimeLocal.split("T");
  if (!datePart || !timePart) return null;

  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  // Tạo Date object với local timezone constructor (không dùng UTC)
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (Number.isNaN(localDate.getTime())) return null;

  // toISOString() sẽ convert từ local time sang UTC
  return localDate.toISOString();
};

export const AddTask = ({
  onClose = () => {},
  onAddSuccess = () => {},
  task,
  onEditSuccess = () => {},
  defaultProjectId = null,
}) => {
  const {
    auth: { user },
  } = useContext(AuthContext);

  const isEditMode = !!task;

  // Get today's date and time in datetime-local format for default value
  const getTodayDateTimeLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "medium",
    start_date: task?.start_date ? formatDateTimeLocal(task.start_date) : "",
    due_date: task?.due_date
      ? formatDateTimeLocal(task.due_date)
      : isEditMode
      ? ""
      : getTodayDateTimeLocal(),
    status: task?.status || "todo",
    // Recurrence fields (chỉ weekly)
    repeat_type: "none", // 'none', 'weekly', 'custom'
    repeat_days: [], // [0,1,2,3,4,5,6] for custom (0=Sun, 1=Mon, ..., 6=Sat)
    repeat_until: "", // date format (YYYY-MM-DD) - ngày kết thúc
  });

  const handleOnChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Nếu due_date thay đổi và repeat_until nhỏ hơn due_date mới, reset repeat_until
      if (name === "due_date" && value && updated.repeat_until) {
        const dueDate = new Date(value);
        const repeatUntil = new Date(updated.repeat_until + "T23:59:59");
        if (repeatUntil < dueDate) {
          updated.repeat_until = "";
        }
      }

      return updated;
    });
  };

  // Helper để toggle day selection
  const toggleRepeatDay = (day) => {
    setForm((prev) => {
      const days = prev.repeat_days || [];
      const newDays = days.includes(day)
        ? days.filter((d) => d !== day)
        : [...days, day].sort();
      return { ...prev, repeat_days: newDays };
    });
  };

  // Helper function để kiểm tra start và due có cùng ngày không
  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.split("T")[0] === d2.split("T")[0];
  };

  // Helper function để tính số lượng tasks sẽ được tạo
  const calculateTaskCount = () => {
    if (!form.due_date || !form.repeat_until) return 0;
    if (!isSameDay(form.start_date, form.due_date)) return 0; // Chỉ tính nếu cùng ngày

    const start = new Date(form.due_date);
    const end = new Date(form.repeat_until + "T23:59:59");
    if (end < start) return 0;

    let count = 0;
    const current = new Date(start);

    if (form.repeat_type === "weekly") {
      // Lặp lại vào cùng ngày trong tuần với due_date
      const targetDayOfWeek = start.getDay();
      while (current <= end && count < 100) {
        if (current.getDay() === targetDayOfWeek) {
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
    } else if (form.repeat_type === "custom") {
      const days = form.repeat_days || [];
      if (days.length === 0) return 0;
      while (current <= end && count < 100) {
        if (days.includes(current.getDay())) {
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
    }

    return count;
  };

  const taskCount = useMemo(
    () => calculateTaskCount(),
    [
      form.repeat_type,
      form.repeat_days,
      form.due_date,
      form.repeat_until,
      form.start_date,
    ]
  );

  // Helper để get max date (tối đa 12 tuần từ due_date)
  const getMaxRepeatUntilDate = () => {
    if (!form.due_date) return "";
    const dueDate = new Date(form.due_date);
    const maxDate = new Date(dueDate);
    maxDate.setDate(maxDate.getDate() + 12 * 7); // 12 tuần = 84 ngày
    return maxDate.toISOString().split("T")[0]; // Chỉ lấy date YYYY-MM-DD
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation cho recurrence
    if (form.repeat_type !== "none" && !isEditMode) {
      // Kiểm tra start và due phải cùng ngày
      if (!isSameDay(form.start_date, form.due_date)) {
        alert(
          "Để sử dụng tính năng lặp lại, Start date và Due date phải trong cùng một ngày"
        );
        return;
      }
      if (!form.repeat_until) {
        alert("Vui lòng chọn ngày kết thúc lặp lại");
        return;
      }
      if (form.repeat_type === "custom" && form.repeat_days?.length === 0) {
        alert("Vui lòng chọn ít nhất một ngày trong tuần");
        return;
      }
      if (taskCount === 0) {
        alert(
          "Không có tasks nào được tạo. Vui lòng kiểm tra lại ngày bắt đầu và kết thúc, đảm bảo Start date và Due date trong cùng một ngày"
        );
        return;
      }
      if (taskCount > 100) {
        alert(
          "Số lượng tasks vượt quá giới hạn (tối đa 100 tasks). Vui lòng chọn khoảng thời gian ngắn hơn"
        );
        return;
      }
      // Validate repeat_until không được quá 12 tuần
      const dueDate = new Date(form.due_date);
      const repeatUntil = new Date(form.repeat_until + "T23:59:59");
      const weeksDiff = (repeatUntil - dueDate) / (1000 * 60 * 60 * 24 * 7);
      if (weeksDiff > 12) {
        alert("Khoảng thời gian lặp lại không được vượt quá 12 tuần");
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
          assignedUserId: user.uid,
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
          user.uid,
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
      alert(
        "Có lỗi xảy ra khi tạo tasks: " +
          (error.response?.data?.error || error.message)
      );
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

          <div className="grid gap-4 md:grid-cols-2">
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
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-slate-600">
                Priority
              </span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
                {["low", "medium", "high"].map((priority) => (
                  <label
                    key={priority}
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium capitalize text-slate-600"
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      onChange={handleOnChange}
                      checked={form.priority === priority}
                      className="h-4 w-4 accent-indigo-500"
                    />
                    {priority}
                  </label>
                ))}
              </div>
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
              !isSameDay(form.start_date, form.due_date) && (
                <p className="text-xs text-rose-500">
                  ⚠️ Start and due dates must be on the same day to use
                  recurrence
                </p>
              )}
          </div>

          {/* Recurrence Section - Chỉ hiển thị khi không phải edit mode */}
          {!isEditMode && (
            <div className="grid gap-4">
              {/* Repeat Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enable_repeat"
                  checked={form.repeat_type !== "none"}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      repeat_type: e.target.checked ? "weekly" : "none",
                      repeat_days:
                        e.target.checked && prev.repeat_type === "custom"
                          ? prev.repeat_days
                          : [],
                      repeat_until: e.target.checked ? prev.repeat_until : "",
                    }));
                  }}
                  className="h-4 w-4 accent-indigo-500"
                />
                <label
                  htmlFor="enable_repeat"
                  className="text-sm font-medium text-slate-600"
                >
                  Repeat this task
                </label>
              </div>

              {/* Repeat Options */}
              {form.repeat_type !== "none" && (
                <div className="grid gap-4 pl-7 border-l-2 border-indigo-200">
                  {/* Repeat Type Selection */}
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-600">
                      Repeat frequency
                    </label>
                    <select
                      name="repeat_type"
                      value={form.repeat_type}
                      onChange={(e) => {
                        setForm((prev) => ({
                          ...prev,
                          repeat_type: e.target.value,
                          repeat_days:
                            e.target.value === "custom" ? prev.repeat_days : [],
                        }));
                      }}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="weekly">Weekly (same weekday)</option>
                      <option value="custom">Custom (select weekdays)</option>
                    </select>
                  </div>

                  {/* Custom Day Selection */}
                  {form.repeat_type === "custom" && (
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-slate-600">
                        Select weekdays
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 0, label: "Sun" },
                          { value: 1, label: "Mon" },
                          { value: 2, label: "Tue" },
                          { value: 3, label: "Wed" },
                          { value: 4, label: "Thu" },
                          { value: 5, label: "Fri" },
                          { value: 6, label: "Sat" },
                        ].map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleRepeatDay(day.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                              form.repeat_days?.includes(day.value)
                                ? "bg-indigo-500 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                      {form.repeat_days?.length === 0 && (
                        <p className="text-xs text-rose-500">
                          Please select at least one weekday
                        </p>
                      )}
                    </div>
                  )}

                  {/* Repeat Until Date */}
                  <div className="grid gap-2">
                    <label
                      htmlFor="repeat_until"
                      className="text-sm font-medium text-slate-600"
                    >
                      Repeat until <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="repeat_until"
                      type="date"
                      name="repeat_until"
                      value={form.repeat_until}
                      onChange={handleOnChange}
                      min={form.due_date ? form.due_date.split("T")[0] : ""}
                      max={getMaxRepeatUntilDate()}
                      required={form.repeat_type !== "none"}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <p className="text-xs text-slate-500">
                      Tasks will be created from the due date until the end date
                      (maximum 12 weeks, up to 100 tasks)
                    </p>
                    {form.repeat_until && form.due_date && (
                      <p className="text-xs text-slate-400">
                        Duration:{" "}
                        {Math.ceil(
                          (new Date(form.repeat_until + "T23:59:59") -
                            new Date(form.due_date)) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </p>
                    )}
                  </div>

                  {/* Preview number of tasks */}
                  {form.repeat_type !== "none" &&
                    form.repeat_until &&
                    form.due_date &&
                    isSameDay(form.start_date, form.due_date) && (
                      <div
                        className={`p-3 rounded-lg border ${
                          calculateTaskCount() > 100
                            ? "bg-rose-50 border-rose-200"
                            : "bg-indigo-50 border-indigo-200"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            calculateTaskCount() > 100
                              ? "text-rose-900"
                              : "text-indigo-900"
                          }`}
                        >
                          Approximately {calculateTaskCount()} tasks will be
                          created
                          {calculateTaskCount() > 100 && (
                            <span className="block text-xs text-rose-600 mt-1">
                              ⚠️ Exceeds the limit of 100 tasks. Please choose a
                              shorter time range.
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>
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
