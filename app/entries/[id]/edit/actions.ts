"use server";

import { db } from "@/db";
import { dailyEntries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type EditEntryFormState } from "./form-state";

export async function updateEntry(
  entryId: string,
  _prevState: EditEntryFormState,
  formData: FormData,
): Promise<EditEntryFormState> {
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
    await db
      .update(dailyEntries)
      .set({
        projectId,
        title,
        description: description || null,
        workDate,
      })
      .where(eq(dailyEntries.id, entryId));

    revalidatePath("/");

    return {
      status: "success",
      message: "Entry saved successfully.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not save the entry. Please try again.",
    };
  }
}
