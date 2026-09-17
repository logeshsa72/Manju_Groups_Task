import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { useCreateLeadMutation, useUpdateLeadMutation } from "../../features/leads/leadsApiSlice";
import { useGetUsersQuery } from "../../features/auth/authApiSlice";
import { LEAD_STAGES, STAGE_LABELS } from "../../utils/constants";

const EMPTY = { name: "", phone: "", email: "", source: "", stage: "NEW", assignedToId: "", followUpDate: "" };

export default function LeadFormModal({ open, onClose, lead }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const { data: users = [] } = useGetUsersQuery();
  const [createLead, { isLoading: creating }] = useCreateLeadMutation();
  const [updateLead, { isLoading: updating }] = useUpdateLeadMutation();

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || "",
        phone: lead.phone || "",
        email: lead.email || "",
        source: lead.source || "",
        stage: lead.stage || "NEW",
        assignedToId: lead.assignedToId || "",
        followUpDate: lead.followUpDate ? lead.followUpDate.slice(0, 10) : "",
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [lead, open]);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.phone.trim()) e.phone = "Phone is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;

    const payload = { ...form, assignedToId: form.assignedToId || null, followUpDate: form.followUpDate || null };

    try {
      if (lead) {
        await updateLead({ id: lead.id, ...payload }).unwrap();
        toast.success("Lead updated successfully.");
      } else {
        await createLead(payload).unwrap();
        toast.success("Lead added successfully.");
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={lead ? "Edit Lead" : "Add New Lead"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Full Name"
            required
            error={errors.name}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Phone"
            required
            error={errors.phone}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Source"
            placeholder="Website, Referral..."
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Stage"
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value })}
            options={LEAD_STAGES.map((s) => ({ value: s, label: STAGE_LABELS[s] }))}
          />
          <Select
            label="Assign To"
            value={form.assignedToId}
            onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
            placeholder="Unassigned"
            options={users.map((u) => ({ value: u.id, label: u.name }))}
          />
        </div>
        <Input
          label="Follow-up Date"
          type="date"
          value={form.followUpDate}
          onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={creating || updating}>
            {lead ? "Save Changes" : "Add Lead"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
