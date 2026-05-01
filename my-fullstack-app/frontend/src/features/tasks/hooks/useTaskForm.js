import { useState, useMemo } from "react";

// Helper function to convert ISO string to datetime-local format
export const formatDateTimeLocal = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper function to convert datetime-local format to ISO string
export const parseDateTimeLocal = (dateTimeLocal) => {
  if (!dateTimeLocal) return null;
  const [datePart, timePart] = dateTimeLocal.split("T");
  if (!datePart || !timePart) return null;

  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (Number.isNaN(localDate.getTime())) return null;

  return localDate.toISOString();
};

export const isSameDayString = (d1, d2) => {
  if (!d1 || !d2) return false;
  return d1.split("T")[0] === d2.split("T")[0];
};

export const getTodayDateTimeLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const useTaskForm = (task, isEditMode) => {
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
    repeat_type: "none",
    repeat_days: [],
    repeat_until: "",
  });

  const handleOnChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

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

  const toggleRepeatDay = (day) => {
    setForm((prev) => {
      const days = prev.repeat_days || [];
      const newDays = days.includes(day)
        ? days.filter((d) => d !== day)
        : [...days, day].sort();
      return { ...prev, repeat_days: newDays };
    });
  };

  const calculateTaskCount = () => {
    if (!form.due_date || !form.repeat_until) return 0;
    if (!isSameDayString(form.start_date, form.due_date)) return 0;

    const start = new Date(form.due_date);
    const end = new Date(form.repeat_until + "T23:59:59");
    if (end < start) return 0;

    let count = 0;
    const current = new Date(start);

    if (form.repeat_type === "weekly") {
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

  const getMaxRepeatUntilDate = () => {
    if (!form.due_date) return "";
    const dueDate = new Date(form.due_date);
    const maxDate = new Date(dueDate);
    maxDate.setDate(maxDate.getDate() + 12 * 7);
    return maxDate.toISOString().split("T")[0];
  };

  return {
    form,
    setForm,
    handleOnChange,
    toggleRepeatDay,
    taskCount,
    getMaxRepeatUntilDate,
    calculateTaskCount,
    isSameDayString,
  };
};
