export const normalizeEnum = (value) => {
  if (!value) return "-";
  return String(value)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatDate = (value, { withTime = false } = {}) => {
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

export const formatUser = (name, username) => {
  if (!name && !username) return "-";
  if (name && username) return `${name} (@${username})`;
  return name || `@${username}`;
};

export const getStatusColor = (status) => {
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

export const getPriorityColor = (priority) => {
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
