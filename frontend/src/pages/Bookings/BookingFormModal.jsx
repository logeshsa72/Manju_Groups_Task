import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useCreateBookingMutation } from "../../features/bookings/bookingsApiSlice";
import { useGetLeadsQuery } from "../../features/leads/leadsApiSlice";
import { useGetUnitsQuery } from "../../features/properties/propertiesApiSlice";
import { formatCurrency } from "../../utils/helpers";

export default function BookingFormModal({ open, onClose }) {
  const [form, setForm] = useState({ leadId: "", unitId: "", amount: "" });
  const { data: leadsData } = useGetLeadsQuery({ limit: 100 }, { skip: !open });
  const { data: units = [] } = useGetUnitsQuery({ status: "AVAILABLE" }, { skip: !open });
  const [createBooking, { isLoading }] = useCreateBookingMutation();

  const selectedUnit = units.find((u) => String(u.id) === String(form.unitId));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.leadId || !form.unitId) {
      toast.error("Please select both a lead and a unit.");
      return;
    }
    try {
      await createBooking({
        leadId: Number(form.leadId),
        unitId: Number(form.unitId),
        amount: form.amount || selectedUnit?.price,
      }).unwrap();
      toast.success("Booking confirmed! Unit marked as booked.");
      setForm({ leadId: "", unitId: "", amount: "" });
      onClose();
    } catch (err) {
      // This is the double-booking case surfaced from the backend transaction
      toast.error(err?.data?.message || "Could not create booking.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Booking" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Lead / Customer"
          required
          placeholder="Select a lead..."
          value={form.leadId}
          onChange={(e) => setForm({ ...form, leadId: e.target.value })}
          options={(leadsData?.leads || []).map((l) => ({ value: l.id, label: `${l.name} (${l.phone})` }))}
        />
        <Select
          label="Available Unit"
          required
          placeholder={units.length ? "Select a unit..." : "No available units"}
          value={form.unitId}
          onChange={(e) => setForm({ ...form, unitId: e.target.value })}
          options={units.map((u) => ({
            value: u.id,
            label: `${u.unitNo} — ${u.building.project.name} (${formatCurrency(u.price)})`,
          }))}
        />
        <Input
          label="Booking Amount (₹)"
          type="number"
          placeholder={selectedUnit ? String(selectedUnit.price) : "Defaults to unit price"}
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading} disabled={!units.length}>Confirm Booking</Button>
        </div>
      </form>
    </Modal>
  );
}
