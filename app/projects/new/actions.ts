"use server";

import { db } from "@/db";
import { clients, projectClients, projects } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type CreateProjectFormState } from "./form-state";

function parseClientIds(formData: FormData): string[] {
  const parsed = formData
    .getAll("clientIds")
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return [...new Set(parsed)];
}

export async function createProject(
  _prevState: CreateProjectFormState,
  formData: FormData,
): Promise<CreateProjectFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const clientIds = parseClientIds(formData);

  if (!name || !status) {
    return {
      status: "error",
      message: "Project name and status are required.",
    };
  }

  if (clientIds.length > 0) {
    const validClients = await db
      .select({ id: clients.id })
      .from(clients)
      .where(inArray(clients.id, clientIds));

    if (validClients.length !== clientIds.length) {
      return {
        status: "error",
        message: "One or more selected clients are invalid.",
      };
    }
  }

  try {
    const [project] = await db
      .insert(projects)
      .values({
        name,
        status,
        description: description || null,
      })
      .returning({ id: projects.id });

    if (!project) {
      throw new Error("Failed to create project.");
    }

    if (clientIds.length > 0) {
      await db.insert(projectClients).values(
        clientIds.map((clientId) => ({
          projectId: project.id,
          clientId,
        })),
      );
    }

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
