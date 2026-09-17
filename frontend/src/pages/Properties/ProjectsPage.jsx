import { useState } from "react";
import { toast } from "react-toastify";
import { Plus, Building2, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import ProjectFormModal from "./ProjectFormModal";
import BuildingFormModal from "./BuildingFormModal";
import UnitFormModal from "./UnitFormModal";
import {
  useGetProjectsQuery,
  useGetUnitsQuery,
  useDeleteUnitMutation,
  useDeleteProjectMutation,
} from "../../features/properties/propertiesApiSlice";
import { UNIT_STATUS_STYLES } from "../../utils/constants";
import { formatCurrency } from "../../utils/helpers";

export default function ProjectsPage() {
  const { data: projects = [], isLoading: loadingProjects } = useGetProjectsQuery();
  const { data: units = [], isLoading: loadingUnits } = useGetUnitsQuery();
  const [deleteUnit] = useDeleteUnitMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [projectModal, setProjectModal] = useState(false);
  const [buildingModal, setBuildingModal] = useState(null); // projectId or null
  const [unitModal, setUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [deletingUnit, setDeletingUnit] = useState(null);
  const [expanded, setExpanded] = useState({});

  function toggleExpand(id) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }

  async function confirmDeleteUnit() {
    try {
      await deleteUnit(deletingUnit.id).unwrap();
      toast.success("Unit deleted.");
      setDeletingUnit(null);
    } catch (err) {
      toast.error(err?.data?.message || "Could not delete unit.");
    }
  }

  async function handleDeleteProject(id) {
    try {
      await deleteProject(id).unwrap();
      toast.success("Project deleted.");
    } catch (err) {
      toast.error(err?.data?.message || "Could not delete project — it may still have units.");
    }
  }

  const unitColumns = [
    { header: "Unit No.", accessor: (u) => <span className="font-semibold text-ink-800">{u.unitNo}</span> },
    { header: "Project / Building", accessor: (u) => <span className="text-ink-500">{u.building.project.name} — {u.building.name}</span> },
    { header: "Type", accessor: (u) => <span className="text-ink-500 capitalize">{u.type.toLowerCase()}</span> },
    { header: "Price", accessor: (u) => <span className="font-medium text-ink-700">{formatCurrency(u.price)}</span> },
    { header: "Status", accessor: (u) => <Badge className={UNIT_STATUS_STYLES[u.status]}>{u.status}</Badge> },
    {
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      accessor: (u) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => { setEditingUnit(u); setUnitModal(true); }} className="btn-ghost p-1.5"><Pencil size={15} /></button>
          <button onClick={() => setDeletingUnit(u)} className="btn-ghost p-1.5 hover:text-red-600"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title="Properties"
        subtitle="Projects, buildings and units"
        actions={
          <>
            <Button variant="secondary" icon={Building2} onClick={() => setProjectModal(true)}>New Project</Button>
            <Button icon={Plus} onClick={() => { setEditingUnit(null); setUnitModal(true); }}>Add Unit</Button>
          </>
        }
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Projects tree */}
        <div className="card p-6">
          <h3 className="font-bold text-ink-900 text-sm mb-4">Projects</h3>
          {loadingProjects ? (
            <p className="text-sm text-ink-400">Loading…</p>
          ) : projects.length === 0 ? (
            <EmptyState title="No projects yet" description="Create your first project to start adding units." />
          ) : (
            <ul className="space-y-2">
              {projects.map((p) => (
                <li key={p.id} className="border border-ink-100 rounded-lg">
                  <div className="flex items-center justify-between px-4 py-3">
                    <button onClick={() => toggleExpand(p.id)} className="flex items-center gap-2 text-left">
                      {expanded[p.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="font-semibold text-ink-800 text-sm">{p.name}</span>
                      <span className="text-xs text-ink-400">{p.location}</span>
                    </button>
                    <div className="flex gap-1">
                      <Button variant="secondary" className="!py-1.5 !px-3 text-xs" onClick={() => setBuildingModal(p.id)}>+ Building</Button>
                      <button onClick={() => handleDeleteProject(p.id)} className="btn-ghost p-1.5 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  {expanded[p.id] && (
                    <div className="px-4 pb-3 space-y-1.5">
                      {p.buildings.length === 0 ? (
                        <p className="text-xs text-ink-400 pl-6">No buildings added yet.</p>
                      ) : (
                        p.buildings.map((b) => (
                          <div key={b.id} className="flex items-center justify-between pl-6 py-1.5 text-sm">
                            <span className="text-ink-600">{b.name}</span>
                            <span className="text-xs text-ink-400">{b._count.units} unit(s)</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Units table */}
        <div className="card p-6">
          <h3 className="font-bold text-ink-900 text-sm mb-4">All Units</h3>
          <DataTable columns={unitColumns} data={units} loading={loadingUnits} emptyTitle="No units yet" emptyDesc="Add a unit to a building above." />
        </div>
      </div>

      <ProjectFormModal open={projectModal} onClose={() => setProjectModal(false)} />
      <BuildingFormModal open={!!buildingModal} onClose={() => setBuildingModal(null)} projectId={buildingModal} />
      <UnitFormModal open={unitModal} onClose={() => setUnitModal(false)} unit={editingUnit} />
      <ConfirmDialog
        open={!!deletingUnit}
        onClose={() => setDeletingUnit(null)}
        onConfirm={confirmDeleteUnit}
        title="Delete Unit"
        description={`Delete unit "${deletingUnit?.unitNo}"? This cannot be undone.`}
      />
    </>
  );
}
