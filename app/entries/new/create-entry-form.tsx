"use client";

import { Alert, Box, Button, MenuItem, Stack, TextField } from "@mui/material";
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
    <Button type="submit" disabled={pending} variant="contained">
      {pending ? "Saving..." : "Create entry"}
    </Button>
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
    <Box component="form" action={formAction}>
      <Stack spacing={2.5}>
        <TextField
          id="projectId"
          name="projectId"
          label="Project"
          select
          required
          defaultValue=""
        >
          <MenuItem value="" disabled>
            Select a project
          </MenuItem>
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField id="title" name="title" label="Title" type="text" required />

        <TextField
          id="workDate"
          name="workDate"
          label="Date"
          type="date"
          required
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          id="description"
          name="description"
          label="Description"
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
