import { db } from "@/db";
import { projects } from "@/db/schema";
import { Button, Container, Paper, Stack, Typography } from "@mui/material";
import { asc } from "drizzle-orm";
import { createEntry } from "./actions";
import CreateEntryForm from "./create-entry-form";

export default async function NewEntryPage() {
  const allProjects = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .orderBy(asc(projects.name));

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        New Entry
      </Typography>
      {allProjects.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">
            You need at least one project before creating an entry.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            <Button href="/projects/new" variant="contained">
              Create project
            </Button>
            <Button href="/entries" variant="outlined">
              Back to entries
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <CreateEntryForm projects={allProjects} action={createEntry} />
        </Paper>
      )}
    </Container>
  );
}
