"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import ModalCloseButton from "@/app/components/modal-close-button";
import {
  initialCreateEntryFormState,
  type CreateEntryFormState,
} from "./form-state";

type ProjectOption = {
  id: string;
  name: string;
};

type CreateEntryFormProps = {
  projects: ProjectOption[];
  action: (
    state: CreateEntryFormState,
    formData: FormData,
  ) => Promise<CreateEntryFormState>;
  cancelHref?: string;
  cancelLabel?: string;
  cancelMode?: "link" | "back";
};

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving..." : "Create entry"}
    </button>
  );
}

export default function CreateEntryForm({
  projects,
  action,
  cancelHref = "/entries",
  cancelLabel = "Cancel",
  cancelMode = "link",
}: CreateEntryFormProps) {
  const [state, formAction] = useActionState(
    action,
    initialCreateEntryFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="projectId" className="block text-sm font-medium">
          Project
        </label>
        <select
          id="projectId"
          name="projectId"
          required
          className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Select a project
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="workDate" className="block text-sm font-medium">
          Date
        </label>
        <input
          id="workDate"
          name="workDate"
          type="date"
          required
          className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <SaveButton />
        {cancelMode === "back" ? (
          <ModalCloseButton label={cancelLabel} />
        ) : (
          <Link
            href={cancelHref}
            className="rounded-md border border-(--border) px-4 py-2 text-sm font-medium hover:bg-(--surface-muted)"
          >
            {cancelLabel}
          </Link>
        )}
      </div>

      {state.status !== "idle" ? (
        <p
          aria-live="polite"
          className={
            state.status === "success"
              ? "rounded-md border border-emerald-600/50 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
              : "rounded-md border border-red-600/50 bg-red-600/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
