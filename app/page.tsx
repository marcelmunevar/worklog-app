import { db } from "@/db";
import { dailyEntries, projects } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

export default async function Home() {
  const entries = await db
    .select({
      id: dailyEntries.id,
      title: dailyEntries.title,
      description: dailyEntries.description,
      workDate: dailyEntries.workDate,
      projectName: projects.name,
      createdAt: dailyEntries.createdAt,
    })
    .from(dailyEntries)
    .innerJoin(projects, eq(dailyEntries.projectId, projects.id))
    .orderBy(desc(dailyEntries.workDate), desc(dailyEntries.createdAt));

  return (
    <main className="mx-auto w-full max-w-4xl p-6 md:p-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Daily Entries</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-semibold text-background"
          >
            Entries
          </Link>
          <Link
            href="/projects"
            className="rounded-md border border-(--border) px-3 py-1.5 text-sm font-semibold hover:bg-(--surface-muted)"
          >
            Projects
          </Link>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-(--border) p-6 text-(--muted-foreground)">
          No entries yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-(--border) bg-(--surface)">
          <table className="min-w-full divide-y divide-(--border)">
            <thead className="bg-(--surface-muted)">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Project
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border) bg-(--surface)">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {entry.workDate}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                    {entry.projectName}
                  </td>
                  <td className="px-4 py-3 text-sm">{entry.title}</td>
                  <td className="px-4 py-3 text-sm text-(--muted-foreground)">
                    {entry.description || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/entries/${entry.id}/edit`}
                      className="inline-flex rounded-md border border-(--border) px-3 py-1.5 font-medium hover:bg-(--surface-muted)"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
