import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Building2, Mail, Lock } from "lucide-react";
import { toast } from "react-toastify";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useLoginMutation } from "../features/auth/authApiSlice";
import { setCredentials, selectCurrentToken } from "../features/auth/authSlice";

export default function Login() {
  const token = useSelector(selectCurrentToken);
  const [form, setForm] = useState({ email: "admin@crm.com", password: "Admin@123" });
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (token) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await login(form).unwrap();
      dispatch(setCredentials(res));
      toast.success(`Welcome back, ${res.user.name.split(" ")[0]}!`);
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || "Login failed. Check your credentials.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center mb-4">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Estate CRM</h1>
          <p className="text-ink-400 text-sm mt-1">Sign in to manage leads &amp; bookings</p>
        </div>

        <form onSubmit={handleSubmit} className="card bg-white p-7 space-y-4">
          <Input
            label="Email address"
            type="email"
            required
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" className="w-full justify-center" loading={isLoading}>
            Sign In
          </Button>

          <div className="pt-3 border-t border-ink-100 text-xs text-ink-400 space-y-1">
            <p className="flex items-center gap-1.5"><Mail size={12} /> Admin: admin@crm.com / Admin@123</p>
            <p className="flex items-center gap-1.5"><Lock size={12} /> Sales: sales@crm.com / Sales@123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
