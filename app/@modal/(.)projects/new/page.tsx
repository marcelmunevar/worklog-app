import { db } from "@/db";
import { clients } from "@/db/schema";
import { asc, isNull } from "drizzle-orm";
import ModalShell from "@/app/@modal/modal-shell";
import { createProject } from "@/app/projects/new/actions";
import CreateProjectForm from "@/app/projects/new/create-project-form";

export default async function NewProjectModalPage() {
  const allClients = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(isNull(clients.deletedAt))
    .orderBy(asc(clients.name));

  return (
    <ModalShell title="New Project">
      <CreateProjectForm
        clients={allClients}
        action={createProject}
        cancelLabel="Close"
        cancelMode="back"
      />
    </ModalShell>
  );
}
