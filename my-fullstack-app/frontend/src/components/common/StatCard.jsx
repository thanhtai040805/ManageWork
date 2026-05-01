export const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-slate-500 font-medium">{title}</h3>
      <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon className={colorClass} size={20} />
      </div>
    </div>
    <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
    {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
  </div>
);