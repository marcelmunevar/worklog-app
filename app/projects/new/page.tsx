import { db } from "@/db";
import { clients } from "@/db/schema";
import { Container, Paper, Typography } from "@mui/material";
import { asc, isNull } from "drizzle-orm";
import CreateProjectForm from "./create-project-form";
import { createProject } from "./actions";

export default async function NewProjectPage() {
  const allClients = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(isNull(clients.deletedAt))
    .orderBy(asc(clients.name));

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        New Project
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <CreateProjectForm clients={allClients} action={createProject} />
      </Paper>
    </Container>
  );
}
