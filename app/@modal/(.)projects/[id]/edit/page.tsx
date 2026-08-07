import { db } from "@/db";
import { clients, projectClients, projects } from "@/db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import ModalShell from "@/app/@modal/modal-shell";
import { deleteProject, updateProject } from "@/app/projects/[id]/edit/actions";
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
    .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) {
    notFound();
  }

  const allClients = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(isNull(clients.deletedAt))
    .orderBy(asc(clients.name));

  const assignedClients = await db
    .select({ clientId: projectClients.clientId })
    .from(projectClients)
    .innerJoin(
      clients,
      and(eq(projectClients.clientId, clients.id), isNull(clients.deletedAt)),
    )
    .where(eq(projectClients.projectId, id));

  const assignedClientIds = assignedClients.map((row) => row.clientId);

  const updateProjectWithId = updateProject.bind(null, id);
  const deleteProjectWithId = deleteProject.bind(null, id);

  return (
    <ModalShell title="Edit Project">
      <EditProjectForm
        project={project}
        clients={allClients}
        assignedClientIds={assignedClientIds}
        action={updateProjectWithId}
        deleteAction={deleteProjectWithId}
        cancelLabel="Close"
        cancelMode="back"
      />
    </ModalShell>
  );
}
