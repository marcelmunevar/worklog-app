"use server";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type EditClientFormState } from "./form-state";

export async function updateClient(
  clientId: string,
  _prevState: EditClientFormState,
  formData: FormData,
): Promise<EditClientFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const acronym = String(formData.get("acronym") ?? "").trim();

  if (!name) {
    return {
      status: "error",
      message: "Client name is required.",
    };
  }

  try {
    await db
      .update(clients)
      .set({
        name,
        acronym: acronym || null,
      })
      .where(eq(clients.id, clientId));

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
  await db
    .update(clients)
    .set({ deletedAt: new Date() })
    .where(eq(clients.id, clientId));

  revalidatePath("/clients");
  revalidatePath("/projects");

  redirect("/clients");
}
