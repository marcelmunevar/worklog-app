"use client";

import { Alert, Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import ModalCloseButton from "./modal-close-button";
import {
  initialEditEntryFormState,
  type EditEntryFormState,
} from "./form-state";

type ProjectOption = {
  id: string;
  name: string;
};

type EntryData = {
  projectId: string;
  title: string;
  workDate: string;
  description: string | null;
};

type EditEntryFormProps = {
  entry: EntryData;
  projects: ProjectOption[];
  action: (
    state: EditEntryFormState,
    formData: FormData,
  ) => Promise<EditEntryFormState>;
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

export default function EditEntryForm({
  entry,
  projects,
  action,
  cancelHref = "/entries",
  cancelLabel = "Cancel",
  cancelMode = "link",
}: EditEntryFormProps) {
  const [state, formAction] = useActionState(action, initialEditEntryFormState);

  return (
    <Box component="form" action={formAction}>
      <Stack spacing={2.5}>
        <TextField
          id="projectId"
          name="projectId"
          label="Project"
          select
          defaultValue={entry.projectId}
          required
        >
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          id="title"
          name="title"
          label="Title"
          type="text"
          defaultValue={entry.title}
          required
        />

        <TextField
          id="workDate"
          name="workDate"
          label="Date"
          type="date"
          defaultValue={entry.workDate}
          required
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          id="description"
          name="description"
          label="Description"
          defaultValue={entry.description ?? ""}
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
