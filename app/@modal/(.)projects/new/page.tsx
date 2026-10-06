import { db } from "@/db";
import { clients } from "@/db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";
import { requireWorklogId } from "@/lib/worklog-access";
import ModalShell from "@/app/@modal/modal-shell";
import { createProject } from "@/app/projects/new/actions";
import CreateProjectForm from "@/app/projects/new/create-project-form";

export const dynamic = "force-dynamic";

export default async function NewProjectModalPage() {
  const worklogId = await requireWorklogId();
  const allClients = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(and(eq(clients.worklogId, worklogId), isNull(clients.deletedAt)))
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
