"use server";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { requireWorklogId } from "@/lib/worklog-access";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { TableFieldUpdateResult } from "@/app/components/editable-table-cell";
import { type EditClientFormState } from "./form-state";

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
