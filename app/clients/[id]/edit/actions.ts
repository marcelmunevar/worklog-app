"use server";

import { db } from "@/db";
import { clients, entryClients, projectClients } from "@/db/schema";
import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { requireWorklogId } from "@/lib/worklog-access";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { TableFieldUpdateResult } from "@/app/components/editable-table-cell";
import { type EditClientFormState } from "./form-state";

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

export async function updateClientField(
  clientId: string,
  field: "name" | "acronym",
  value: string,
): Promise<TableFieldUpdateResult> {
  const worklogId = await requireWorklogId();
  if (field !== "name" && field !== "acronym") {
    return { success: false, message: "Invalid client field." };
  }
  if (typeof value !== "string") {
    return { success: false, message: "Invalid field value." };
  }

  const normalizedValue = value.trim();

  if (field === "name" && !normalizedValue) {
    return { success: false, message: "Client name is required." };
  }

  try {
    const [updatedClient] = await db
      .update(clients)
      .set(
        field === "name"
          ? { name: normalizedValue }
          : { acronym: normalizedValue || null },
      )
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.worklogId, worklogId),
          isNull(clients.deletedAt),
        ),
      )
      .returning({ id: clients.id });

    if (!updatedClient) {
      return { success: false, message: "Client is no longer available." };
    }

    revalidatePath("/clients");
    revalidatePath("/projects");
    revalidatePath("/entries");
    return { success: true };
  } catch {
    return {
      success: false,
      message:
        field === "name"
          ? "Could not save the client. The name may already exist."
          : "Could not save the client. Please try again.",
    };
  }
}

export async function updateClient(
  clientId: string,
  _prevState: EditClientFormState,
  formData: FormData,
): Promise<EditClientFormState> {
  const worklogId = await requireWorklogId();
  const name = String(formData.get("name") ?? "").trim();
  const acronym = String(formData.get("acronym") ?? "").trim();

  if (!name) {
    return {
      status: "error",
      message: "Client name is required.",
    };
  }

  try {
    const [updatedClient] = await db
      .update(clients)
      .set({
        name,
        acronym: acronym || null,
      })
      .where(and(eq(clients.id, clientId), eq(clients.worklogId, worklogId)))
      .returning({ id: clients.id });

    if (!updatedClient) {
      return { status: "error", message: "Client is no longer available." };
    }

    revalidatePath("/clients");

    return {
      status: "success",
      message: "Client saved successfully.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not save the client. The name may already exist.",
    };
  }
}

export async function deleteClient(clientId: string) {
  const worklogId = await requireWorklogId();
  await db
    .update(clients)
    .set({ deletedAt: new Date() })
    .where(and(eq(clients.id, clientId), eq(clients.worklogId, worklogId)));

  revalidatePath("/clients");
  revalidatePath("/projects");

  redirect("/clients");
}

export async function restoreClient(clientId: string) {
  const worklogId = await requireWorklogId();
  const [restoredClient] = await db
    .update(clients)
    .set({ deletedAt: null })
    .where(
      and(
        eq(clients.id, clientId),
        eq(clients.worklogId, worklogId),
        isNotNull(clients.deletedAt),
      ),
    )
    .returning({ id: clients.id });

  if (!restoredClient) {
    throw new Error("Client in trash is no longer available to restore.");
  }

  revalidatePath("/clients");
  revalidatePath("/projects");
  revalidatePath("/entries");
}

export async function permanentlyDeleteClient(clientId: string) {
  const worklogId = await requireWorklogId();
  const [clientInTrash] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(
      and(
        eq(clients.id, clientId),
        eq(clients.worklogId, worklogId),
        isNotNull(clients.deletedAt),
      ),
    )
    .limit(1);

  if (!clientInTrash) {
    throw new Error("Only clients in the trash can be permanently deleted.");
  }

  if (await entryClientsTableExists()) {
    await db
      .delete(entryClients)
      .where(eq(entryClients.clientId, clientId));
  }
  await db
    .delete(projectClients)
    .where(eq(projectClients.clientId, clientId));

  const [removedClient] = await db
    .delete(clients)
    .where(
      and(
        eq(clients.id, clientId),
        eq(clients.worklogId, worklogId),
        isNotNull(clients.deletedAt),
      ),
    )
    .returning({ id: clients.id });

  if (!removedClient) {
    throw new Error("Client in trash is no longer available to remove.");
  }

  revalidatePath("/clients");
  revalidatePath("/projects");
  revalidatePath("/entries");
}
