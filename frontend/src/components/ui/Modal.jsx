import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, size = "md" }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${sizes[size]} bg-white rounded-xl2 shadow-popover border border-ink-200/60
          max-h-[88vh] flex flex-col animate-[fadeIn_0.15s_ease-out]`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 shrink-0">
          <h3 className="text-base font-bold text-ink-900">{title}</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700 hover:bg-ink-100 rounded-lg p-1.5 transition">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
