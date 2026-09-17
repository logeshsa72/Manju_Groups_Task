import { Inbox } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-full bg-ink-100 text-ink-400 flex items-center justify-center mb-4">
        <Icon size={26} />
      </div>
      <h4 className="text-sm font-semibold text-ink-700">{title}</h4>
      {description && <p className="text-sm text-ink-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
