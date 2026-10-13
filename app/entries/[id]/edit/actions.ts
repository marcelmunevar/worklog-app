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
import { requireWorklogId } from "@/lib/worklog-access";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { TableFieldUpdateResult } from "@/app/components/editable-table-cell";
import { type EditEntryFormState } from "./form-state";

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

export async function updateEntryField(
  entryId: string,
  field: "workDate" | "projectId" | "title" | "description" | "clientIds",
  value: string | string[],
): Promise<TableFieldUpdateResult> {
  const worklogId = await requireWorklogId();
  if (
    field !== "workDate" &&
    field !== "projectId" &&
    field !== "title" &&
    field !== "description" &&
    field !== "clientIds"
  ) {
    return { success: false, message: "Invalid entry field." };
  }

  if (field === "clientIds") {
    if (
      !Array.isArray(value) ||
      !value.every((clientId): clientId is string => typeof clientId === "string")
    ) {
      return { success: false, message: "Invalid client selection." };
    }

    const clientIds = [...new Set(value.map((id) => id.trim()).filter(Boolean))];
    const [entry] = await db
      .select({ projectId: dailyEntries.projectId })
      .from(dailyEntries)
      .where(
        and(
          eq(dailyEntries.id, entryId),
          eq(dailyEntries.worklogId, worklogId),
          isNull(dailyEntries.deletedAt),
        ),
      )
      .limit(1);

    if (!entry) {
      return { success: false, message: "Entry is no longer available." };
    }

    const supportsEntryClients = await ensureEntryClientsTable();
    if (!supportsEntryClients) {
      return {
        success: false,
        message: "Client assignments are unavailable. Please try again later.",
      };
    }

    let validClients: Array<{ id: string }> = [];
    if (clientIds.length > 0) {
      if (!entry.projectId) {
        return {
          success: false,
          message: "Choose a project before assigning clients.",
        };
      }

      validClients = await db
        .select({ id: projectClients.clientId })
        .from(projectClients)
        .innerJoin(
          clients,
          and(
            eq(projectClients.clientId, clients.id),
            eq(clients.worklogId, worklogId),
            isNull(clients.deletedAt),
          )
        )
        .where(
          and(
            eq(projectClients.projectId, entry.projectId),
            inArray(projectClients.clientId, clientIds),
          ),
        );
    }

    if (validClients.length !== clientIds.length) {
      return {
        success: false,
        message: "Selected clients must belong to the entry's project.",
      };
    }

    try {
      await db
        .delete(entryClients)
        .where(eq(entryClients.dailyEntryId, entryId));
      if (clientIds.length > 0) {
        await db.insert(entryClients).values(
          clientIds.map((clientId) => ({
            dailyEntryId: entryId,
            clientId,
          })),
        );
      }

      revalidatePath("/entries");
      return { success: true };
    } catch {
      return {
        success: false,
        message: "Could not save the entry clients. Please try again.",
      };
    }
  }

  if (typeof value !== "string") {
    return { success: false, message: "Invalid field value." };
  }

  const normalizedValue = value.trim();
  if (field === "workDate" && !normalizedValue) {
    return {
      success: false,
      message: "Entry date is required.",
    };
  }

  if (
    field === "workDate" &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue) ||
      Number.isNaN(new Date(`${normalizedValue}T00:00:00.000Z`).getTime()) ||
      new Date(`${normalizedValue}T00:00:00.000Z`)
        .toISOString()
        .slice(0, 10) !== normalizedValue)
  ) {
    return { success: false, message: "Enter a valid date." };
  }

  if (field === "projectId" && normalizedValue) {
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(
          eq(projects.id, normalizedValue),
          eq(projects.worklogId, worklogId),
          isNull(projects.deletedAt),
        ),
      )
      .limit(1);

    if (!project) {
      return { success: false, message: "Selected project is unavailable." };
    }
  }

  let retainedClientIds: string[] | undefined;
  if (
    field === "projectId" &&
    !normalizedValue &&
    (await entryClientsTableExists())
  ) {
    retainedClientIds = [];
  } else if (field === "projectId" && (await entryClientsTableExists())) {
    const [entry] = await db
      .select({ projectId: dailyEntries.projectId })
      .from(dailyEntries)
      .where(
        and(
          eq(dailyEntries.id, entryId),
          eq(dailyEntries.worklogId, worklogId),
          isNull(dailyEntries.deletedAt),
        ),
      )
      .limit(1);

    if (!entry) {
      return { success: false, message: "Entry is no longer available." };
    }

    const assignedClients = await db
      .select({ clientId: entryClients.clientId })
      .from(entryClients)
      .where(eq(entryClients.dailyEntryId, entryId));
    const assignedClientIds = assignedClients.map((client) => client.clientId);
    const validClients = assignedClientIds.length
      ? await db
          .select({ clientId: projectClients.clientId })
          .from(projectClients)
          .innerJoin(
            clients,
            and(
              eq(projectClients.clientId, clients.id),
              eq(clients.worklogId, worklogId),
              isNull(clients.deletedAt),
            ),
          )
          .where(
            and(
              eq(projectClients.projectId, normalizedValue),
              inArray(projectClients.clientId, assignedClientIds),
            ),
          )
      : [];
    retainedClientIds = validClients.map((client) => client.clientId);
  }

  try {
    const [updatedEntry] = await db
      .update(dailyEntries)
      .set(
        field === "title"
          ? { title: normalizedValue || null }
          : field === "description"
            ? { description: normalizedValue || null }
            : field === "workDate"
              ? { workDate: normalizedValue }
              : { projectId: normalizedValue || null },
      )
      .where(
        and(
          eq(dailyEntries.id, entryId),
          eq(dailyEntries.worklogId, worklogId),
          isNull(dailyEntries.deletedAt),
        ),
      )
      .returning({ id: dailyEntries.id });

    if (!updatedEntry) {
      return { success: false, message: "Entry is no longer available." };
    }

    if (retainedClientIds !== undefined) {
      await db
        .delete(entryClients)
        .where(eq(entryClients.dailyEntryId, entryId));
      if (retainedClientIds.length > 0) {
        await db.insert(entryClients).values(
          retainedClientIds.map((clientId) => ({
            dailyEntryId: entryId,
            clientId,
          })),
        );
      }
    }

    revalidatePath("/entries");
    revalidatePath("/projects");
    return { success: true };
  } catch {
    return { success: false, message: "Could not save the entry. Please try again." };
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

export async function updateEntry(
  entryId: string,
  _prevState: EditEntryFormState,
  formData: FormData,
): Promise<EditEntryFormState> {
  const worklogId = await requireWorklogId();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const workDate = String(formData.get("workDate") ?? "").trim();
  const clientIds = parseClientIds(formData);

  if (!workDate) {
    return {
      status: "error",
      message: "Entry date is required.",
    };
  }

  if (projectId) {
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.worklogId, worklogId),
          isNull(projects.deletedAt),
        ),
      )
      .limit(1);

    if (!project) {
      return {
        status: "error",
        message: "Selected project is no longer available.",
      };
    }
  } else if (clientIds.length > 0) {
    return {
      status: "error",
      message: "Choose a project before assigning clients.",
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
          eq(clients.worklogId, worklogId),
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
    const [updatedEntry] = await db
      .update(dailyEntries)
      .set({
        projectId: projectId || null,
        title: title || null,
        description: description || null,
        workDate,
      })
      .where(
        and(
          eq(dailyEntries.id, entryId),
          eq(dailyEntries.worklogId, worklogId),
        ),
      )
      .returning({ id: dailyEntries.id });

    if (!updatedEntry) {
      return { status: "error", message: "Entry is no longer available." };
    }

    if (supportsEntryClients) {
      await db
        .delete(entryClients)
        .where(eq(entryClients.dailyEntryId, entryId));

      if (clientIds.length > 0) {
        await db.insert(entryClients).values(
          clientIds.map((clientId) => ({
            dailyEntryId: entryId,
            clientId,
          })),
        );
      }
    }

    revalidatePath("/entries");
    revalidatePath("/projects");

    return {
      status: "success",
      message: "Entry saved successfully.",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? `Could not save the entry. ${error.message}`
        : "Could not save the entry. Please try again.";

    return {
      status: "error",
      message,
    };
  }
}

export async function deleteEntry(entryId: string) {
  const worklogId = await requireWorklogId();
  await db
    .update(dailyEntries)
    .set({ deletedAt: new Date() })
    .where(
      and(eq(dailyEntries.id, entryId), eq(dailyEntries.worklogId, worklogId)),
    );

  revalidatePath("/entries");
  revalidatePath("/projects");

  redirect("/entries");
}
