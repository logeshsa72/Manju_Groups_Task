import { useState } from "react";
import { toast } from "react-toastify";
import { Plus, FileSpreadsheet, Search, Pencil, Trash2, Eye } from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import LeadFormModal from "./LeadFormModal";
import ImportLeadsModal from "./ImportLeadsModal";
import LeadDetailModal from "./LeadDetailModal";
import { useGetLeadsQuery, useDeleteLeadMutation } from "../../features/leads/leadsApiSlice";
import { LEAD_STAGES, STAGE_LABELS, STAGE_STYLES } from "../../utils/constants";
import { formatDate } from "../../utils/helpers";

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetLeadsQuery({ search, stage, page, limit: 10 });
  const [deleteLead, { isLoading: deleting }] = useDeleteLeadMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [viewingLeadId, setViewingLeadId] = useState(null);
  const [deletingLead, setDeletingLead] = useState(null);

  function openAdd() {
    setEditingLead(null);
    setFormOpen(true);
  }
  function openEdit(lead) {
    setEditingLead(lead);
    setFormOpen(true);
  }

  async function confirmDelete() {
    try {
      await deleteLead(deletingLead.id).unwrap();
      toast.success("Lead deleted.");
      setDeletingLead(null);
    } catch (err) {
      toast.error(err?.data?.message || "Could not delete lead.");
    }
  }

  const columns = [
    {
      header: "Lead",
      accessor: (row) => (
        <button onClick={() => setViewingLeadId(row.id)} className="text-left group">
          <p className="font-semibold text-ink-800 group-hover:text-brand-600 transition">{row.name}</p>
          <p className="text-xs text-ink-400">{row.phone}</p>
        </button>
      ),
    },
    { header: "Source", accessor: (row) => <span className="text-ink-500">{row.source || "—"}</span> },
    {
      header: "Stage",
      accessor: (row) => <Badge className={STAGE_STYLES[row.stage]}>{STAGE_LABELS[row.stage]}</Badge>,
    },
    { header: "Assigned To", accessor: (row) => <span className="text-ink-500">{row.assignedTo?.name || "Unassigned"}</span> },
    { header: "Follow-up", accessor: (row) => <span className="text-ink-500">{formatDate(row.followUpDate)}</span> },
    {
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      accessor: (row) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => setViewingLeadId(row.id)} className="btn-ghost p-1.5"><Eye size={15} /></button>
          <button onClick={() => openEdit(row)} className="btn-ghost p-1.5"><Pencil size={15} /></button>
          <button onClick={() => setDeletingLead(row)} className="btn-ghost p-1.5 hover:text-red-600"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title="Leads"
        subtitle={data ? `${data.total} total lead(s)` : ""}
        actions={
          <>
            <Button variant="secondary" icon={FileSpreadsheet} onClick={() => setImportOpen(true)}>
              Import Excel
            </Button>
            <Button icon={Plus} onClick={openAdd}>
              Add Lead
            </Button>
          </>
        }
      />

      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="card p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              className="input-base pl-9"
              placeholder="Search by name, phone or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            className="w-48"
            value={stage}
            onChange={(e) => {
              setStage(e.target.value);
              setPage(1);
            }}
            placeholder="All Stages"
            options={[{ value: "", label: "All Stages" }, ...LEAD_STAGES.map((s) => ({ value: s, label: STAGE_LABELS[s] }))]}
          />
        </div>

        <div className="card p-6">
          <DataTable
            columns={columns}
            data={data?.leads}
            loading={isLoading}
            emptyTitle="No leads found"
            emptyDesc="Try adjusting your filters, or add your first lead."
          />

          {data && data.pages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-ink-100">
              <p className="text-xs text-ink-400">
                Page {data.page} of {data.pages}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <LeadFormModal open={formOpen} onClose={() => setFormOpen(false)} lead={editingLead} />
      <ImportLeadsModal open={importOpen} onClose={() => setImportOpen(false)} />
      <LeadDetailModal open={!!viewingLeadId} onClose={() => setViewingLeadId(null)} leadId={viewingLeadId} />
      <ConfirmDialog
        open={!!deletingLead}
        onClose={() => setDeletingLead(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Lead"
        description={`Are you sure you want to delete "${deletingLead?.name}"? This cannot be undone.`}
      />
    </>
  );
}
