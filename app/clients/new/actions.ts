"use server";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { type CreateClientFormState } from "./form-state";

export async function createClient(
  _prevState: CreateClientFormState,
  formData: FormData,
): Promise<CreateClientFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const acronym = String(formData.get("acronym") ?? "").trim();

  if (!name) {
    return {
      status: "error",
      message: "Client name is required.",
    };
  }

  try {
    await db.insert(clients).values({
      name,
      acronym: acronym || null,
    });

    revalidatePath("/clients");

    return {
      status: "success",
      message: "Client created successfully.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not create client. The name may already exist.",
    };
  }
}
