// Priority colors for tasks
export const PRIORITY_COLORS = {
  high: {
    bg: "bg-rose-100",
    text: "text-rose-600",
    hoverBg: "hover:bg-rose-200",
    badge: "bg-rose-500 text-white",
    label: "High",
  },
  medium: {
    bg: "bg-indigo-100",
    text: "text-indigo-600",
    hoverBg: "hover:bg-indigo-200",
    badge: "bg-indigo-500 text-white",
    label: "Medium",
  },
  low: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    hoverBg: "hover:bg-emerald-200",
    badge: "bg-emerald-500 text-white",
    label: "Low",
  },
};

// Status colors for tasks
export const STATUS_COLORS = {
  todo: {
    bg: "bg-rose-100",
    text: "text-rose-600",
    hoverBg: "hover:bg-rose-200",
    badge: "bg-rose-500 text-white",
    label: "Not Started",
    labelCompleted: "Not Started",
    tone: "text-rose-500",
  },
  in_progress: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    hoverBg: "hover:bg-blue-200",
    badge: "bg-blue-500 text-white",
    label: "In Progress",
    labelCompleted: "In Progress",
    tone: "text-blue-500",
  },
  done: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    hoverBg: "hover:bg-emerald-200",
    badge: "bg-emerald-500 text-white",
    label: "Done",
    labelCompleted: "Completed",
    tone: "text-emerald-500",
  },
  review: {
    bg: "bg-amber-100",
    text: "text-amber-600",
    hoverBg: "hover:bg-amber-200",
    badge: "bg-amber-500 text-white",
    label: "Review",
    labelCompleted: "Review",
    tone: "text-amber-500",
  },
  on_hold: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    hoverBg: "hover:bg-slate-200",
    badge: "bg-slate-500 text-white",
    label: "On Hold",
    labelCompleted: "On Hold",
    tone: "text-slate-500",
  },
  overdue: {
    bg: "bg-red-100",
    text: "text-red-600",
    hoverBg: "hover:bg-red-200",
    badge: "bg-red-500 text-white",
    label: "Overdue",
    labelCompleted: "Overdue",
    tone: "text-red-500",
  },
  cancelled: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    hoverBg: "hover:bg-gray-200",
    badge: "bg-gray-500 text-white",
    label: "Cancelled",
    labelCompleted: "Cancelled",
    tone: "text-gray-500",
  },
};

// Get priority badge classes (for display)
export const getPriorityBadgeClass = (priority) => {
  const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.low;
  return `${colors.bg} ${colors.text}`;
};

// Get status badge classes (for display)
export const getStatusBadgeClass = (status) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.todo;
  return `${colors.bg} ${colors.text}`;
};

// Get status dropdown classes (includes hover)
export const getStatusSelectClass = (status) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.todo;
  return `${colors.bg} ${colors.text} ${colors.hoverBg}`;
};

// Get priority label
export const getPriorityLabel = (priority) => {
  return PRIORITY_COLORS[priority]?.label || "Low";
};

// Get status label
export const getStatusLabel = (status) => {
  if (status === "overdue") return "Overdue";
  return STATUS_COLORS[status]?.label || "Not Started";
};

// Get priority badge (solid color)
export const getPriorityBadge = (priority) => {
  const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.low;
  return `${colors.badge}`;
};

// Get status badge (solid color)
export const getStatusBadge = (status) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.todo;
  return `${colors.badge}`;
};

// Get status tone for circular progress
export const getStatusTone = (status) => {
  return STATUS_COLORS[status]?.tone || STATUS_COLORS.todo.tone;
};

// Status options array for dropdowns (excludes overdue - it's auto-calculated)
export const STATUS_OPTIONS = Object.entries(STATUS_COLORS)
  .filter(([key]) => key !== "overdue")
  .map(([key, value]) => ({
    value: key,
    label: value.label,
    ...value,
  }));

// Get status options for display (uses labelCompleted for done, excludes overdue)
export const getStatusOptionsForDisplay = () => {
  return [
    { value: "done", label: "Completed", ...STATUS_COLORS.done },
    { value: "in_progress", label: "In Progress", ...STATUS_COLORS.in_progress },
    { value: "todo", label: "Not Started", ...STATUS_COLORS.todo },
    { value: "review", label: "Review", ...STATUS_COLORS.review },
    { value: "on_hold", label: "On Hold", ...STATUS_COLORS.on_hold },
    { value: "cancelled", label: "Cancelled", ...STATUS_COLORS.cancelled },
  ];
};

// Auto-detect status based on due_date
export const getAutoStatus = (task) => {
  if (task.status === "done") return "done";
  if (!task.due_date) return task.status || "todo";
  
  const now = new Date();
  const dueDate = new Date(task.due_date);
  
  if (dueDate < now && task.status !== "done") {
    return "overdue";
  }
  return task.status || "todo";
};

// Priority options array for dropdowns
export const PRIORITY_OPTIONS = Object.entries(PRIORITY_COLORS).map(([key, value]) => ({
  value: key,
  label: value.label,
  ...value,
}));