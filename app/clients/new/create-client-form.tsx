"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import ModalCloseButton from "@/app/components/modal-close-button";
import {
  initialCreateClientFormState,
  type CreateClientFormState,
} from "./form-state";

type CreateClientFormProps = {
  action: (
    state: CreateClientFormState,
    formData: FormData,
  ) => Promise<CreateClientFormState>;
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
      {pending ? "Saving..." : "Create client"}
    </button>
  );
}

export default function CreateClientForm({
  action,
  cancelHref = "/clients",
  cancelLabel = "Cancel",
  cancelMode = "link",
}: CreateClientFormProps) {
  const [state, formAction] = useActionState(
    action,
    initialCreateClientFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="acronym" className="block text-sm font-medium">
          Acronym
        </label>
        <input
          id="acronym"
          name="acronym"
          type="text"
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
