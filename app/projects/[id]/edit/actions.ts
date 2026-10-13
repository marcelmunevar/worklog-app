"use server";

import { db } from "@/db";
import { clients, dailyEntries, projectClients, projects } from "@/db/schema";
import { and, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { requireWorklogId } from "@/lib/worklog-access";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { TableFieldUpdateResult } from "@/app/components/editable-table-cell";
import { type EditProjectFormState } from "./form-state";
import { isProjectStatus } from "@/app/projects/project-status";

function parseClientIds(formData: FormData): string[] {
  const parsed = formData
    .getAll("clientIds")
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return [...new Set(parsed)];
}

export async function updateProjectField(
  projectId: string,
  field: "name" | "status" | "description" | "clientIds",
  value: string | string[],
): Promise<TableFieldUpdateResult> {
  const worklogId = await requireWorklogId();
  if (
    field !== "name" &&
    field !== "status" &&
    field !== "description" &&
    field !== "clientIds"
  ) {
    return { success: false, message: "Invalid project field." };
  }

  if (field === "clientIds") {
    if (
      !Array.isArray(value) ||
      !value.every((clientId): clientId is string => typeof clientId === "string")
    ) {
      return { success: false, message: "Invalid client selection." };
    }

    const clientIds = [...new Set(value.map((id) => id.trim()).filter(Boolean))];
    const validClients = clientIds.length
      ? await db
          .select({ id: clients.id })
          .from(clients)
          .where(
            and(
              eq(clients.worklogId, worklogId),
              inArray(clients.id, clientIds),
              isNull(clients.deletedAt),
            ),
          )
      : [];

    if (validClients.length !== clientIds.length) {
      return {
        success: false,
        message: "One or more selected clients are invalid.",
      };
    }

    try {
      const [project] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(
          and(
            eq(projects.id, projectId),
            eq(projects.worklogId, worklogId),
            isNull(projects.deletedAt),
          ),
        )
        .limit(1);

      if (!project) {
        return { success: false, message: "Project is no longer available." };
      }

      await db.delete(projectClients).where(eq(projectClients.projectId, projectId));
      if (clientIds.length > 0) {
        await db.insert(projectClients).values(
          clientIds.map((clientId) => ({ projectId, clientId })),
        );
      }

      revalidatePath("/projects");
      revalidatePath("/entries");
      return { success: true };
    } catch {
      return {
        success: false,
        message: "Could not save the project clients. Please try again.",
      };
    }
  }

  if (typeof value !== "string") {
    return { success: false, message: "Invalid field value." };
  }

  const normalizedValue = value.trim();
  if ((field === "name" || field === "status") && !normalizedValue) {
    return {
      success: false,
      message: field === "name" ? "Project name is required." : "Status is required.",
    };
  }

  if (field === "status" && !isProjectStatus(normalizedValue)) {
    return { success: false, message: "Select a valid status." };
  }

  try {
    const [updatedProject] = await db
      .update(projects)
      .set(
        field === "name"
          ? { name: normalizedValue }
          : field === "status"
            ? { status: normalizedValue }
            : { description: normalizedValue || null },
      )
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.worklogId, worklogId),
          isNull(projects.deletedAt),
        ),
      )
      .returning({ id: projects.id });

    if (!updatedProject) {
      return { success: false, message: "Project is no longer available." };
    }

    revalidatePath("/projects");
    revalidatePath("/entries");
    return { success: true };
  } catch {
    return { success: false, message: "Could not save the project. Please try again." };
  }
}

export async function updateProject(
  projectId: string,
  _prevState: EditProjectFormState,
  formData: FormData,
): Promise<EditProjectFormState> {
  const worklogId = await requireWorklogId();
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
      .where(
        and(
          eq(clients.worklogId, worklogId),
          inArray(clients.id, clientIds),
          isNull(clients.deletedAt),
        ),
      );

    if (validClients.length !== clientIds.length) {
      return {
        status: "error",
        message: "One or more selected clients are invalid.",
      };
    }
  }

  try {
    const [updatedProject] = await db
      .update(projects)
      .set({
        name,
        status,
        description: description || null,
      })
      .where(and(eq(projects.id, projectId), eq(projects.worklogId, worklogId)))
      .returning({ id: projects.id });

    if (!updatedProject) {
      return { status: "error", message: "Project is no longer available." };
    }

    await db
      .delete(projectClients)
      .where(eq(projectClients.projectId, projectId));

    if (clientIds.length > 0) {
      await db.insert(projectClients).values(
        clientIds.map((clientId) => ({
          projectId,
          clientId,
        })),
      );
    }

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

export async function deleteProject(projectId: string) {
  const worklogId = await requireWorklogId();
  await db
    .update(projects)
    .set({ deletedAt: new Date() })
    .where(and(eq(projects.id, projectId), eq(projects.worklogId, worklogId)));

  revalidatePath("/projects");
  revalidatePath("/entries");
  revalidatePath("/clients");

  redirect("/projects");
}

export async function restoreProject(projectId: string) {
  const worklogId = await requireWorklogId();
  const [restoredProject] = await db
    .update(projects)
    .set({ deletedAt: null })
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.worklogId, worklogId),
        isNotNull(projects.deletedAt),
      ),
    )
    .returning({ id: projects.id });

  if (!restoredProject) {
    throw new Error("Project in trash is no longer available to restore.");
  }

  revalidatePath("/projects");
  revalidatePath("/entries");
  revalidatePath("/clients");
}

export async function permanentlyDeleteProject(projectId: string) {
  const worklogId = await requireWorklogId();
  const [projectInTrash] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.worklogId, worklogId),
        isNotNull(projects.deletedAt),
      ),
    )
    .limit(1);

  if (!projectInTrash) {
    throw new Error("Only projects in the trash can be permanently deleted.");
  }

  const [linkedEntry] = await db
    .select({ id: dailyEntries.id })
    .from(dailyEntries)
    .where(
      and(
        eq(dailyEntries.projectId, projectId),
        eq(dailyEntries.worklogId, worklogId),
      ),
    )
    .limit(1);

  if (linkedEntry) {
    redirect("/projects?showDeleted=true&trashError=linked-entries");
  }

  await db
    .delete(projectClients)
    .where(eq(projectClients.projectId, projectId));
  const [removedProject] = await db
    .delete(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.worklogId, worklogId),
        isNotNull(projects.deletedAt),
      ),
    )
    .returning({ id: projects.id });

  if (!removedProject) {
    throw new Error("Project in trash is no longer available to remove.");
  }

  revalidatePath("/projects");
  revalidatePath("/entries");
  revalidatePath("/clients");
}
