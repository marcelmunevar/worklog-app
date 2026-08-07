import { db } from "@/db";
import { projects } from "@/db/schema";
import { asc } from "drizzle-orm";
import Link from "next/link";
import { createEntry } from "./actions";
import CreateEntryForm from "./create-entry-form";

export default async function NewEntryPage() {
  const allProjects = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .orderBy(asc(projects.name));

  return (
    <main className="mx-auto w-full max-w-2xl p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">New Entry</h1>
      {allProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--border) bg-(--surface) p-6">
          <p className="text-(--muted-foreground)">
            You need at least one project before creating an entry.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/projects/new"
              className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
            >
              Create project
            </Link>
            <Link
              href="/entries"
              className="rounded-md border border-(--border) px-4 py-2 text-sm font-medium hover:bg-(--surface-muted)"
            >
              Back to entries
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-(--border) bg-(--surface) p-6">
          <CreateEntryForm projects={allProjects} action={createEntry} />
        </div>
      )}
    </main>
  );
}
