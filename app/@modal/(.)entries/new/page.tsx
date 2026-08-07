import { db } from "@/db";
import { projects } from "@/db/schema";
import { asc } from "drizzle-orm";
import Link from "next/link";
import ModalShell from "@/app/@modal/modal-shell";
import ModalCloseButton from "@/app/components/modal-close-button";
import { createEntry } from "@/app/entries/new/actions";
import CreateEntryForm from "@/app/entries/new/create-entry-form";

export default async function NewEntryModalPage() {
  const allProjects = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .orderBy(asc(projects.name));

  return (
    <ModalShell title="New Entry">
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
            <ModalCloseButton label="Close" />
          </div>
        </div>
      ) : (
        <CreateEntryForm
          projects={allProjects}
          action={createEntry}
          cancelLabel="Close"
          cancelMode="back"
        />
      )}
    </ModalShell>
  );
}
