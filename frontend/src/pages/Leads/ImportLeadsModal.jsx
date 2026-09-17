import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { FileSpreadsheet, UploadCloud } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useImportLeadsMutation } from "../../features/leads/leadsApiSlice";

export default function ImportLeadsModal({ open, onClose }) {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);
  const [importLeads, { isLoading }] = useImportLeadsMutation();

  function handleClose() {
    setFile(null);
    onClose();
  }

  async function handleImport() {
    if (!file) {
      toast.error("Please choose an Excel file first.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await importLeads(formData).unwrap();
      toast.success(res.message || "Leads imported successfully.");
      handleClose();
    } catch (err) {
      toast.error(err?.data?.message || "Import failed. Check the file format.");
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Import Leads from Excel" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-ink-500">
          Upload an <strong>.xlsx</strong> or <strong>.xls</strong> file with columns:{" "}
          <code className="text-xs bg-ink-100 px-1.5 py-0.5 rounded">Name, Phone, Email, Source, Stage</code>. Only
          Name and Phone are required.
        </p>

        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-ink-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/40 transition"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileSpreadsheet size={30} className="text-emerald-600" />
              <p className="text-sm font-semibold text-ink-700">{file.name}</p>
              <p className="text-xs text-ink-400">Click to choose a different file</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud size={30} className="text-ink-400" />
              <p className="text-sm font-semibold text-ink-600">Click to select an Excel file</p>
              <p className="text-xs text-ink-400">.xlsx or .xls, up to 10MB</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} loading={isLoading}>
            Import Leads
          </Button>
        </div>
      </div>
    </Modal>
  );
}
