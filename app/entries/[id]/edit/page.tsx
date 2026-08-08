import { db } from "@/db";
import { dailyEntries } from "@/db/schema";
import { Container, Paper, Typography } from "@mui/material";
import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  getEntryAssignedClientIds,
  getEntryProjectOptions,
} from "@/app/entries/entry-form-data";
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

  const [allProjects, assignedClientIds] = await Promise.all([
    getEntryProjectOptions(),
    getEntryAssignedClientIds(id),
  ]);

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
          entry={{ ...entry, clientIds: assignedClientIds }}
          projects={allProjects}
          action={updateEntryWithId}
          deleteAction={deleteEntryWithId}
        />
      </Paper>
    </Container>
  );
}
