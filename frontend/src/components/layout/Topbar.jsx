import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";
import { toast } from "react-toastify";

export default function Topbar({ title, subtitle, actions }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(logout());
    toast.info("You've been logged out.");
    navigate("/login");
  }

  return (
    <header className="h-16 sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-ink-100 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-bold text-ink-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-ink-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button
          onClick={handleLogout}
          className="btn-ghost text-ink-500"
          title="Log out"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
