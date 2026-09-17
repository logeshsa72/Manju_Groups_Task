import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({ open, onClose, onConfirm, title = "Are you sure?", description, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <AlertTriangle size={20} />
        </div>
        <p className="text-sm text-ink-600 pt-1.5">{description}</p>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
