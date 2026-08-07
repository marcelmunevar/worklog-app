import ModalShell from "@/app/@modal/modal-shell";
import { createProject } from "@/app/projects/new/actions";
import CreateProjectForm from "@/app/projects/new/create-project-form";

export default function NewProjectModalPage() {
  return (
    <ModalShell title="New Project">
      <CreateProjectForm
        action={createProject}
        cancelLabel="Close"
        cancelMode="back"
      />
    </ModalShell>
  );
}
