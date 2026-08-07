"use server";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type EditProjectFormState } from "./form-state";

export async function updateProject(
  projectId: string,
  _prevState: EditProjectFormState,
  formData: FormData,
): Promise<EditProjectFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name || !status) {
    return {
      status: "error",
      message: "Project name and status are required.",
    };
  }

  try {
    await db
      .update(projects)
      .set({
        name,
        status,
        description: description || null,
      })
      .where(eq(projects.id, projectId));

    revalidatePath("/projects");
    revalidatePath("/entries");

    return {
      status: "success",
      message: "Project saved successfully.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not save the project. Please try again.",
    };
  }
}
