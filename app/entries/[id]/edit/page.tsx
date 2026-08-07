import { db } from "@/db";
import { dailyEntries, projects } from "@/db/schema";
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
    <main className="mx-auto w-full max-w-2xl p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Edit Entry</h1>
      <div className="rounded-xl border border-(--border) bg-(--surface) p-6">
        <EditEntryForm
          entry={entry}
          projects={allProjects}
          action={updateEntryWithId}
        />
      </div>
    </main>
  );
}
