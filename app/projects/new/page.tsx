import { db } from "@/db";
import { clients } from "@/db/schema";
import { requireWorklogId } from "@/lib/worklog-access";
import { Container, Paper, Typography } from "@mui/material";
import { and, asc, eq, isNull } from "drizzle-orm";
import CreateProjectForm from "./create-project-form";
import { createProject } from "./actions";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const worklogId = await requireWorklogId();
  const allClients = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(and(eq(clients.worklogId, worklogId), isNull(clients.deletedAt)))
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
