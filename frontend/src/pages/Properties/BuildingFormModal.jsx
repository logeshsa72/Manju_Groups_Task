import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useCreateBuildingMutation } from "../../features/properties/propertiesApiSlice";

export default function BuildingFormModal({ open, onClose, projectId }) {
  const [name, setName] = useState("");
  const [createBuilding, { isLoading }] = useCreateBuildingMutation();

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Building name is required.");
    try {
      await createBuilding({ name, projectId }).unwrap();
      toast.success("Building added.");
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Could not add building.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Building / Block" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Building Name" required placeholder="e.g. Tower B" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading}>Add Building</Button>
        </div>
      </form>
    </Modal>
  );
}
