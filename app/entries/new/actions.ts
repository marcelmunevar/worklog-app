"use server";

import { db } from "@/db";
import { dailyEntries } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { type CreateEntryFormState } from "./form-state";

export async function createEntry(
  _prevState: CreateEntryFormState,
  formData: FormData,
): Promise<CreateEntryFormState> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const workDate = String(formData.get("workDate") ?? "").trim();

  if (!projectId || !title || !workDate) {
    return {
      status: "error",
      message: "Project, title, and date are required.",
    };
  }

  try {
    await db.insert(dailyEntries).values({
      projectId,
      title,
      description: description || null,
      workDate,
    });

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
