import { db } from "@/db";
import { dailyEntries, projects } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";

function formatDate(dateValue: Date | null) {
  if (!dateValue) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(dateValue);
}

export default async function ProjectsPage() {
  const projectList = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      createdAt: projects.createdAt,
      entryCount: sql<number>`count(${dailyEntries.id})`.mapWith(Number),
    })
    .from(projects)
    .leftJoin(dailyEntries, eq(dailyEntries.projectId, projects.id))
    .groupBy(
      projects.id,
      projects.name,
      projects.description,
      projects.status,
      projects.createdAt,
    )
    .orderBy(desc(projects.createdAt));

  return (
    <main className="mx-auto w-full max-w-5xl p-6 md:p-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/entries"
            className="rounded-md border border-(--border) px-3 py-1.5 text-sm font-semibold hover:bg-(--surface-muted)"
          >
            Entries
          </Link>
          <Link
            href="/projects"
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-semibold text-background"
          >
            Projects
          </Link>
        </div>
      </div>

      {projectList.length === 0 ? (
        <p className="rounded-lg border border-dashed border-(--border) p-6 text-(--muted-foreground)">
          No projects yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-(--border) bg-(--surface)">
          <table className="min-w-full divide-y divide-(--border)">
            <thead className="bg-(--surface-muted)">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Entries
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border) bg-(--surface)">
              {projectList.map((project) => (
                <tr key={project.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                    {project.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {project.status}
                  </td>
                  <td className="px-4 py-3 text-sm text-(--muted-foreground)">
                    {project.description || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {formatDate(project.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold">
                    {project.entryCount}
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
