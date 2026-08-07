"use server";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { type CreateProjectFormState } from "./form-state";

export async function createProject(
  _prevState: CreateProjectFormState,
  formData: FormData,
): Promise<CreateProjectFormState> {
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
    await db.insert(projects).values({
      name,
      status,
      description: description || null,
    });

    revalidatePath("/projects");
    revalidatePath("/entries");

    return {
      status: "success",
      message: "Project created successfully.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not create project. Please try again.",
    };
  }
}
