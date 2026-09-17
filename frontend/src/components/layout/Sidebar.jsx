import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users2, Building2, ClipboardCheck, Building } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/leads", label: "Leads", icon: Users2 },
  { to: "/properties", label: "Properties", icon: Building2 },
  { to: "/bookings", label: "Bookings", icon: ClipboardCheck },
];

export default function Sidebar() {
  const user = useSelector(selectCurrentUser);

  return (
    <aside className="w-64 shrink-0 bg-ink-950 text-white flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
          <Building size={17} />
        </div>
        <span className="font-extrabold text-[15px] tracking-tight">Estate CRM</span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive ? "bg-brand-600 text-white shadow-sm" : "text-ink-300 hover:bg-white/5 hover:text-white"}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-ink-400 truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
