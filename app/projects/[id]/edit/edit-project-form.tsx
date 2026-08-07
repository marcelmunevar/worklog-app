"use client";

import { Alert, Box, Button, Stack, TextField } from "@mui/material";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import ModalCloseButton from "./modal-close-button";
import {
  initialEditProjectFormState,
  type EditProjectFormState,
} from "./form-state";

type ProjectData = {
  name: string;
  status: string;
  description: string | null;
};

type EditProjectFormProps = {
  project: ProjectData;
  action: (
    state: EditProjectFormState,
    formData: FormData,
  ) => Promise<EditProjectFormState>;
  cancelHref?: string;
  cancelLabel?: string;
  cancelMode?: "link" | "back";
};

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} variant="contained">
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export default function EditProjectForm({
  project,
  action,
  cancelHref = "/projects",
  cancelLabel = "Cancel",
  cancelMode = "link",
}: EditProjectFormProps) {
  const [state, formAction] = useActionState(
    action,
    initialEditProjectFormState,
  );

  return (
    <Box component="form" action={formAction}>
      <Stack spacing={2.5}>
        <TextField
          id="name"
          name="name"
          label="Name"
          type="text"
          defaultValue={project.name}
          required
        />

        <TextField
          id="status"
          name="status"
          label="Status"
          type="text"
          defaultValue={project.status}
          required
        />

        <TextField
          id="description"
          name="description"
          label="Description"
          defaultValue={project.description ?? ""}
          multiline
          rows={5}
        />

        <Stack direction="row" spacing={1.5}>
          <SaveButton />
          {cancelMode === "back" ? (
            <ModalCloseButton label={cancelLabel} />
          ) : (
            <Button href={cancelHref} variant="outlined">
              {cancelLabel}
            </Button>
          )}
        </Stack>

        {state.status !== "idle" ? (
          <Alert severity={state.status === "success" ? "success" : "error"}>
            {state.message}
          </Alert>
        ) : null}
      </Stack>
    </Box>
  );
}
