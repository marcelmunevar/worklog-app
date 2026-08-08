"use server";

import { db } from "@/db";
import {
  clients,
  dailyEntries,
  entryClients,
  projectClients,
  projects,
} from "@/db/schema";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type CreateEntryFormState } from "./form-state";

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

async function ensureEntryClientsTable(): Promise<boolean> {
  if (await entryClientsTableExists()) {
    return true;
  }

  try {
    await db.execute(sql`
      create table if not exists public.entry_clients (
        daily_entry_id uuid not null,
        client_id uuid not null,
        constraint entry_clients_daily_entry_id_client_id_pk primary key (daily_entry_id, client_id),
        constraint entry_clients_daily_entry_id_daily_entries_id_fk foreign key (daily_entry_id) references public.daily_entries(id),
        constraint entry_clients_client_id_clients_id_fk foreign key (client_id) references public.clients(id)
      )
    `);

    return await entryClientsTableExists();
  } catch {
    return false;
  }
}

function parseClientIds(formData: FormData): string[] {
  const parsed = formData
    .getAll("clientIds")
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return [...new Set(parsed)];
}

export async function createEntry(
  _prevState: CreateEntryFormState,
  formData: FormData,
): Promise<CreateEntryFormState> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const workDate = String(formData.get("workDate") ?? "").trim();
  const clientIds = parseClientIds(formData);

  if (!projectId || !title || !workDate) {
    return {
      status: "error",
      message: "Project, title, and date are required.",
    };
  }

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) {
    return {
      status: "error",
      message: "Selected project is no longer available.",
    };
  }

  const supportsEntryClients = await ensureEntryClientsTable();

  if (clientIds.length > 0 && supportsEntryClients) {
    const validClients = await db
      .select({ id: projectClients.clientId })
      .from(projectClients)
      .innerJoin(
        clients,
        and(eq(projectClients.clientId, clients.id), isNull(clients.deletedAt)),
      )
      .where(
        and(
          eq(projectClients.projectId, projectId),
          inArray(projectClients.clientId, clientIds),
        ),
      );

    if (validClients.length !== clientIds.length) {
      return {
        status: "error",
        message: "Selected clients must belong to the chosen project.",
      };
    }
  }

  try {
    const [entry] = await db
      .insert(dailyEntries)
      .values({
        projectId,
        title,
        description: description || null,
        workDate,
      })
      .returning({ id: dailyEntries.id });

    if (!entry) {
      throw new Error("Failed to create entry.");
    }

    if (clientIds.length > 0 && supportsEntryClients) {
      try {
        await db.insert(entryClients).values(
          clientIds.map((clientId) => ({
            dailyEntryId: entry.id,
            clientId,
          })),
        );
      } catch (error) {
        if (
          error instanceof Error &&
          /relation\s+"[^"]+"\s+does not exist/i.test(error.message)
        ) {
          return {
            status: "success",
            message: "Entry created successfully.",
          };
        }

        throw error;
      }
    }

    revalidatePath("/entries");
    revalidatePath("/projects");

    return {
      status: "success",
      message: "Entry created successfully.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not create entry. Please try again.",
    };
  }
}
