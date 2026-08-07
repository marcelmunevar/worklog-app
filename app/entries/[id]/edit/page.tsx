import { db } from "@/db";
import { dailyEntries, projects } from "@/db/schema";
import { Container, Paper, Typography } from "@mui/material";
import { and, asc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { deleteEntry, updateEntry } from "./actions";
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
    .where(and(eq(dailyEntries.id, id), isNull(dailyEntries.deletedAt)))
    .limit(1);

  if (!entry) {
    notFound();
  }

  const allProjects = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(isNull(projects.deletedAt))
    .orderBy(asc(projects.name));

  if (!allProjects.some((project) => project.id === entry.projectId)) {
    notFound();
  }

  const updateEntryWithId = updateEntry.bind(null, id);
  const deleteEntryWithId = deleteEntry.bind(null, id);

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
          deleteAction={deleteEntryWithId}
        />
      </Paper>
    </Container>
  );
}
