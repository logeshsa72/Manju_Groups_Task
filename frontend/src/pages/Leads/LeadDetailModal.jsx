import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { FileText, Send, Paperclip, Download } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Textarea from "../../components/ui/Textarea";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import { useGetLeadQuery, useAddLeadNoteMutation, useUploadLeadAttachmentMutation } from "../../features/leads/leadsApiSlice";
import { STAGE_LABELS, STAGE_STYLES } from "../../utils/constants";
import { formatDateTime } from "../../utils/helpers";
import { BASE_URL } from "../../app/apiSlice";

export default function LeadDetailModal({ open, onClose, leadId }) {
  const { data: lead, isLoading } = useGetLeadQuery(leadId, { skip: !leadId });
  const [note, setNote] = useState("");
  const [addNote, { isLoading: addingNote }] = useAddLeadNoteMutation();
  const [uploadAttachment, { isLoading: uploading }] = useUploadLeadAttachmentMutation();
  const fileRef = useRef(null);

  async function handleAddNote() {
    if (!note.trim()) return;
    try {
      await addNote({ id: leadId, note }).unwrap();
      setNote("");
      toast.success("Note added.");
    } catch (err) {
      toast.error(err?.data?.message || "Could not add note.");
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await uploadAttachment({ id: leadId, formData }).unwrap();
      toast.success("File uploaded to lead.");
    } catch (err) {
      toast.error(err?.data?.message || "Upload failed — only PDF or Excel files are allowed.");
    }
    e.target.value = "";
  }

  return (
    <Modal open={open} onClose={onClose} title={lead ? lead.name : "Lead Details"} size="lg">
      {isLoading || !lead ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={STAGE_STYLES[lead.stage]}>{STAGE_LABELS[lead.stage]}</Badge>
            <span className="text-sm text-ink-500">{lead.phone}</span>
            {lead.email && <span className="text-sm text-ink-500">· {lead.email}</span>}
            {lead.assignedTo && <span className="text-sm text-ink-500">· Assigned to {lead.assignedTo.name}</span>}
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-ink-500">Attachments (PDF / Excel)</h4>
              <Button variant="secondary" icon={Paperclip} onClick={() => fileRef.current?.click()} loading={uploading}>
                Upload File
              </Button>
              <input ref={fileRef} type="file" accept=".pdf,.xls,.xlsx" className="hidden" onChange={handleFileChange} />
            </div>
            {lead.attachments?.length ? (
              <ul className="space-y-2">
                {lead.attachments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between text-sm bg-ink-50 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2 text-ink-700 truncate">
                      <FileText size={15} className="text-brand-600 shrink-0" /> {a.filename}
                    </span>
                    <a
                      href={`${BASE_URL.replace("/api", "")}/uploads/${a.filepath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-600 hover:text-brand-700 shrink-0"
                    >
                      <Download size={15} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-400">No files uploaded yet.</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-2">Follow-up Notes</h4>
            <div className="flex gap-2 mb-3">
              <Textarea
                className="flex-1"
                rows={2}
                placeholder="Add a note about this lead..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button icon={Send} onClick={handleAddNote} loading={addingNote} className="h-fit">
                Add
              </Button>
            </div>
            {lead.notes?.length ? (
              <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {lead.notes.map((n) => (
                  <li key={n.id} className="bg-ink-50 rounded-lg px-3 py-2">
                    <p className="text-sm text-ink-700">{n.note}</p>
                    <p className="text-xs text-ink-400 mt-1">{formatDateTime(n.createdAt)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-400">No notes yet.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
