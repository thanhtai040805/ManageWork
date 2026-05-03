import { getStatusLabel, STATUS_COLORS } from "../../utils/taskColors";

const formatRelativeTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const CompletedTaskCard = ({ task }) => {
  const colors = STATUS_COLORS[task.status] || STATUS_COLORS.done;
  const toneClass = colors.tone || "text-emerald-500";

  return (
    <div className="group relative flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${toneClass}`}
        />
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-700 line-through">
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{getStatusLabel(task.status)}</span>
        <span>Completed {formatRelativeTime(task.completed_at)}</span>
      </div>
    </div>
  );
};

export { CompletedTaskCard };