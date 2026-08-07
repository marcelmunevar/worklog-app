import { db } from "@/db";
import { projects } from "@/db/schema";
import { Container, Paper, Typography } from "@mui/material";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateProject } from "./actions";
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
    .where(eq(projects.id, id))
    .limit(1);

  if (!project) {
    notFound();
  }

  const updateProjectWithId = updateProject.bind(null, id);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Edit Project
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <EditProjectForm project={project} action={updateProjectWithId} />
      </Paper>
    </Container>
  );
}
