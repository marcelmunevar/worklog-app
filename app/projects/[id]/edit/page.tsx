import { db } from "@/db";
import { clients, projectClients, projects } from "@/db/schema";
import { Container, Paper, Typography } from "@mui/material";
import { and, asc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { deleteProject, updateProject } from "./actions";
import EditProjectForm from "./edit-project-form";

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Edit Project
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <EditProjectForm
          project={project}
          clients={allClients}
          assignedClientIds={assignedClientIds}
          action={updateProjectWithId}
          deleteAction={deleteProjectWithId}
        />
      </Paper>
    </Container>
  );
}
