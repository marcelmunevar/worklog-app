import { db } from "@/db";
import { dailyEntries, projects } from "@/db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { deleteEntry, updateEntry } from "@/app/entries/[id]/edit/actions";
import EditEntryForm from "@/app/entries/[id]/edit/edit-entry-form";
import ModalShell from "@/app/@modal/modal-shell";

type EditEntryModalPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEntryModalPage({
  params,
}: EditEntryModalPageProps) {
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
    <ModalShell title="Edit Entry">
      <EditEntryForm
        entry={entry}
        projects={allProjects}
        action={updateEntryWithId}
        deleteAction={deleteEntryWithId}
        cancelLabel="Close"
        cancelMode="back"
      />
    </ModalShell>
  );
}
