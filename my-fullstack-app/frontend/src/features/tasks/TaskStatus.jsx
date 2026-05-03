import { TrendingUp } from "lucide-react";
import { getStatusTone, getStatusOptionsForDisplay, STATUS_COLORS } from "../../utils/taskColors";

const TaskStatus = ({ stats }) => {
  const counts = {
    done: stats?.done ?? 0,
    in_progress: stats?.in_progress ?? 0,
    todo: stats?.todo ?? 0,
  };
  const statusOptions = getStatusOptionsForDisplay();

  const total =
    stats?.total ??
    Object.values(counts).reduce((accumulator, value) => accumulator + value, 0);

  const getPercentage = (value) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-100">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Task Status
          </p>
          <h4 className="mt-2 text-lg font-semibold text-slate-900">
            Team progress
          </h4>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          <TrendingUp size={14} /> Weekly
        </span>
      </header>
      <div className="mt-6 grid gap-4">
        {statusOptions.map((item) => {
          const percent = getPercentage(counts[item.value] || 0);
          const tone = item.tone || "text-slate-500";
          const bgClass = item.bg || "bg-slate-100";
          return (
            <div key={item.value} className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-current ${tone} bg-white`}
              >
                <span className="text-lg font-semibold">{percent}%</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                  <span>{item.label}</span>
                  <span className={tone}>{counts[item.value] || 0}</span>
                </div>
                <div className={`mt-2 h-2 rounded-full ${bgClass}`}>
                  <div
                    className={`h-2 rounded-full ${tone.replace("text", "bg")}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export { TaskStatus };