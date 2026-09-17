import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useCreateProjectMutation } from "../../features/properties/propertiesApiSlice";

export default function ProjectFormModal({ open, onClose }) {
  const [form, setForm] = useState({ name: "", location: "" });
  const [createProject, { isLoading }] = useCreateProjectMutation();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Project name is required.");
    try {
      await createProject(form).unwrap();
      toast.success("Project created.");
      setForm({ name: "", location: "" });
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Could not create project.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Project" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Project Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading}>Create Project</Button>
        </div>
      </form>
    </Modal>
  );
}
