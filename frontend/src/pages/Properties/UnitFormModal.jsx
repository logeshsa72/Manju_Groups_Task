import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { useCreateUnitMutation, useUpdateUnitMutation, useGetProjectsQuery } from "../../features/properties/propertiesApiSlice";
import { UNIT_TYPES, UNIT_STATUS } from "../../utils/constants";

const EMPTY = { unitNo: "", type: "APARTMENT", price: "", buildingId: "", status: "AVAILABLE" };

export default function UnitFormModal({ open, onClose, unit }) {
  const [form, setForm] = useState(EMPTY);
  const { data: projects = [] } = useGetProjectsQuery();
  const [createUnit, { isLoading: creating }] = useCreateUnitMutation();
  const [updateUnit, { isLoading: updating }] = useUpdateUnitMutation();

  const buildingOptions = projects.flatMap((p) =>
    p.buildings.map((b) => ({ value: b.id, label: `${p.name} — ${b.name}` }))
  );

  useEffect(() => {
    if (unit) {
      setForm({
        unitNo: unit.unitNo,
        type: unit.type,
        price: unit.price,
        buildingId: unit.buildingId,
        status: unit.status,
      });
    } else {
      setForm(EMPTY);
    }
  }, [unit, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.unitNo || !form.price || !form.buildingId) {
      toast.error("Unit number, price and building are required.");
      return;
    }
    try {
      if (unit) {
        await updateUnit({ id: unit.id, ...form }).unwrap();
        toast.success("Unit updated.");
      } else {
        await createUnit(form).unwrap();
        toast.success("Unit added.");
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Could not save unit.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={unit ? "Edit Unit" : "Add Unit"} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Building"
          required
          placeholder="Select building..."
          value={form.buildingId}
          onChange={(e) => setForm({ ...form, buildingId: e.target.value })}
          options={buildingOptions}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Unit No." required value={form.unitNo} onChange={(e) => setForm({ ...form, unitNo: e.target.value })} />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={UNIT_TYPES.map((t) => ({ value: t, label: t.charAt(0) + t.slice(1).toLowerCase() }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price (₹)"
            type="number"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={UNIT_STATUS.map((s) => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase() }))}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={creating || updating}>{unit ? "Save Changes" : "Add Unit"}</Button>
        </div>
      </form>
    </Modal>
  );
}
