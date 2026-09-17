export default function StatCard({ label, value, icon: Icon, tint = "brand", trend }) {
  const tints = {
    brand: "bg-brand-50 text-brand-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
  };

  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-ink-900 mt-2">{value}</p>
        {trend && <p className="text-xs text-emerald-600 font-medium mt-1">{trend}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tints[tint]}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}
