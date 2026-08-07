"use server";

import { db } from "@/db";
import { dailyEntries, projects } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

    revalidatePath("/entries");
    revalidatePath("/projects");

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

export async function deleteEntry(entryId: string) {
  await db
    .update(dailyEntries)
    .set({ deletedAt: new Date() })
    .where(eq(dailyEntries.id, entryId));

  revalidatePath("/entries");
  revalidatePath("/projects");

  redirect("/entries");
}
