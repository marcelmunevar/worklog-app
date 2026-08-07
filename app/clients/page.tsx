import { db } from "@/db";
import { clients, projectClients } from "@/db/schema";
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

export default async function ClientsPage() {
  const clientList = await db
    .select({
      id: clients.id,
      name: clients.name,
      acronym: clients.acronym,
      createdAt: clients.createdAt,
      projectCount: sql<number>`count(${projectClients.projectId})`.mapWith(
        Number,
      ),
    })
    .from(clients)
    .leftJoin(projectClients, eq(projectClients.clientId, clients.id))
    .groupBy(clients.id, clients.name, clients.acronym, clients.createdAt)
    .orderBy(desc(clients.createdAt));

  return (
    <main className="mx-auto w-full max-w-5xl p-6 md:p-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/clients/new"
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-semibold text-background"
          >
            Add client
          </Link>
          <Link
            href="/entries"
            className="rounded-md border border-(--border) px-3 py-1.5 text-sm font-semibold hover:bg-(--surface-muted)"
          >
            Entries
          </Link>
          <Link
            href="/projects"
            className="rounded-md border border-(--border) px-3 py-1.5 text-sm font-semibold hover:bg-(--surface-muted)"
          >
            Projects
          </Link>
          <Link
            href="/clients"
            className="rounded-md border border-(--border) px-3 py-1.5 text-sm font-semibold hover:bg-(--surface-muted)"
          >
            Clients
          </Link>
        </div>
      </div>

      {clientList.length === 0 ? (
        <p className="rounded-lg border border-dashed border-(--border) p-6 text-(--muted-foreground)">
          No clients yet.
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
                  Acronym
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Projects
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border) bg-(--surface)">
              {clientList.map((client) => (
                <tr key={client.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                    {client.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-(--muted-foreground)">
                    {client.acronym || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {formatDate(client.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold">
                    {client.projectCount}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <Link
                      href={`/clients/${client.id}/edit`}
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
