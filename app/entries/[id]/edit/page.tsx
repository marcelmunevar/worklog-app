import { db } from "@/db";
import { dailyEntries, projects } from "@/db/schema";
import { Container, Paper, Typography } from "@mui/material";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateEntry } from "./actions";
import EditEntryForm from "./edit-entry-form";

type EditEntryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEntryPage({ params }: EditEntryPageProps) {
  const { id } = await params;

  const [entry] = await db
    .select({
      id: dailyEntries.id,
      projectId: dailyEntries.projectId,
      title: dailyEntries.title,
      workDate: dailyEntries.workDate,
      description: dailyEntries.description,
    })
    .from(dailyEntries)
    .where(eq(dailyEntries.id, id))
    .limit(1);

  if (!entry) {
    notFound();
  }

  const allProjects = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .orderBy(asc(projects.name));

  const updateEntryWithId = updateEntry.bind(null, id);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Edit Entry
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <EditEntryForm
          entry={entry}
          projects={allProjects}
          action={updateEntryWithId}
        />
      </Paper>
    </Container>
  );
}
