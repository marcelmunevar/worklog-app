import { db } from "@/db";
import { clients, projectClients, projects } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ModalShell from "@/app/@modal/modal-shell";
import { updateProject } from "@/app/projects/[id]/edit/actions";
import EditProjectForm from "@/app/projects/[id]/edit/edit-project-form";

type EditProjectModalPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectModalPage({
  params,
}: EditProjectModalPageProps) {
  const { id } = await params;

  const [project] = await db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      description: projects.description,
    })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  if (!project) {
    notFound();
  }

  const allClients = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .orderBy(asc(clients.name));

  const assignedClients = await db
    .select({ clientId: projectClients.clientId })
    .from(projectClients)
    .where(eq(projectClients.projectId, id));

  const assignedClientIds = assignedClients.map((row) => row.clientId);

  const updateProjectWithId = updateProject.bind(null, id);

  return (
    <ModalShell title="Edit Project">
      <EditProjectForm
        project={project}
        clients={allClients}
        assignedClientIds={assignedClientIds}
        action={updateProjectWithId}
        cancelLabel="Close"
        cancelMode="back"
      />
    </ModalShell>
  );
}
