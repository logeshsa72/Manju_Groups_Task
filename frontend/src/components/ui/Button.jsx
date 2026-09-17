import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "btn-ghost",
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  icon: Icon,
  className = "",
  type = "button",
  ...rest
}) {
  return (
    <button type={type} className={`${VARIANTS[variant]} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}
