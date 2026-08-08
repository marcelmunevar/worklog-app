import { db } from "@/db";
import {
  clients,
  dailyEntries,
  entryClients,
  projectClients,
  projects,
} from "@/db/schema";
import { and, asc, eq, isNull, sql } from "drizzle-orm";

export type EntryClientOption = {
  id: string;
  name: string;
};

export type EntryProjectOption = {
  id: string;
  name: string;
  clients: EntryClientOption[];
};

async function entryClientsTableExists(): Promise<boolean> {
  try {
    const result = await db.execute(
      sql`select to_regclass('public.entry_clients') as table_name`,
    );
    const rows = result.rows as Array<{ table_name: string | null }>;
    const tableName = rows[0]?.table_name;

    return (
      tableName === "entry_clients" || tableName === "public.entry_clients"
    );
  } catch {
    return false;
  }
}

export async function getEntryProjectOptions(): Promise<EntryProjectOption[]> {
  const rows = await db
    .select({
      projectId: projects.id,
      projectName: projects.name,
      clientId: clients.id,
      clientName: clients.name,
    })
    .from(projects)
    .leftJoin(projectClients, eq(projectClients.projectId, projects.id))
    .leftJoin(
      clients,
      and(eq(projectClients.clientId, clients.id), isNull(clients.deletedAt)),
    )
    .where(isNull(projects.deletedAt))
    .orderBy(asc(projects.name), asc(clients.name));

  const projectMap = new Map<string, EntryProjectOption>();

  for (const row of rows) {
    let project = projectMap.get(row.projectId);

    if (!project) {
      project = {
        id: row.projectId,
        name: row.projectName,
        clients: [],
      };

      projectMap.set(row.projectId, project);
    }

    if (row.clientId && row.clientName) {
      project.clients.push({
        id: row.clientId,
        name: row.clientName,
      });
    }
  }

  return [...projectMap.values()];
}

export async function getEntryAssignedClientIds(
  entryId: string,
): Promise<string[]> {
  const supportsEntryClients = await entryClientsTableExists();

  if (!supportsEntryClients) {
    return [];
  }

  const assignedClients = await db
    .select({ clientId: entryClients.clientId })
    .from(entryClients)
    .innerJoin(
      clients,
      and(eq(entryClients.clientId, clients.id), isNull(clients.deletedAt)),
    )
    .innerJoin(
      dailyEntries,
      and(
        eq(entryClients.dailyEntryId, dailyEntries.id),
        isNull(dailyEntries.deletedAt),
      ),
    )
    .where(eq(entryClients.dailyEntryId, entryId));

  return assignedClients.map((row) => row.clientId);
}
