"use server";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireWorklogId } from "@/lib/worklog-access";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type EditClientFormState } from "./form-state";

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
