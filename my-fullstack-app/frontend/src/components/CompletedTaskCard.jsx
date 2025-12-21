const STATUS_META = {
  todo: {
    label: "Not Started",
    tone: "text-rose-500",
  },
  in_progress: {
    label: "In Progress",
    tone: "text-blue-500",
  },
  done: {
    label: "Completed",
    tone: "text-emerald-500",
  },
};

const formatRelativeTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Completed just now.";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Completed ${minutes} minute(s) ago.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Completed ${hours} hour(s) ago.`;
  const days = Math.floor(hours / 24);
  return `Completed ${days} day(s) ago.`;
};

const CompletedTaskCard = ({ task }) => {
  const status = STATUS_META[task.status] || STATUS_META.done;

  return (
    <article className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-1 items-start gap-3">
        <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full border border-emerald-400 bg-emerald-50" />
        <div>
          <h4 className="text-base font-semibold text-slate-900">
            {task.title}
          </h4>
          <p className="mt-1 text-sm text-slate-500">{task.description}</p>
          <p className="mt-3 text-xs font-semibold text-slate-400">
            Status: <span className={status.tone}>{status.label}</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {formatRelativeTime(task.updated_at)}
          </p>
        </div>
      </div>
    </article>
  );
};

export default CompletedTaskCard;

