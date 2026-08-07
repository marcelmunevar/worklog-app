"use server";

import { db } from "@/db";
import { dailyEntries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateEntry(entryId: string, formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const workDate = String(formData.get("workDate") ?? "").trim();

  if (!projectId || !title || !workDate) {
    throw new Error("Project, title, and date are required.");
  }

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
  redirect("/");
}
