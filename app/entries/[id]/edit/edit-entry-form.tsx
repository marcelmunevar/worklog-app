"use client";

import type { EntryProjectOption } from "@/app/entries/entry-form-data";
import { Alert, Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import { useEffect, useRef } from "react";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import ModalCloseButton from "./modal-close-button";
import {
  initialEditEntryFormState,
  type EditEntryFormState,
} from "./form-state";

type EntryData = {
  projectId: string;
  clientIds: string[];
  title: string;
  workDate: string;
  description: string | null;
};

type EditEntryFormProps = {
  entry: EntryData;
  projects: EntryProjectOption[];
  action: (
    state: EditEntryFormState,
    formData: FormData,
  ) => Promise<EditEntryFormState>;
  deleteAction?: () => Promise<void>;
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
  deleteAction,
  cancelHref = "/entries",
  cancelLabel = "Cancel",
  cancelMode = "link",
}: EditEntryFormProps) {
  const [selectedProjectId, setSelectedProjectId] = useState(entry.projectId);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(
    entry.clientIds,
  );
  const hiddenClientIdsRef = useRef<HTMLInputElement | null>(null);
  const [state, formAction] = useActionState(action, initialEditEntryFormState);

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );
  const availableClients = selectedProject?.clients ?? [];

  const syncHiddenClientIds = (nextClientIds: string[]) => {
    setSelectedClientIds(nextClientIds);

    if (hiddenClientIdsRef.current) {
      hiddenClientIdsRef.current.value = nextClientIds.join(",");
    }
  };

  const handleProjectChange = (event: SelectChangeEvent<string>) => {
    const nextProjectId = event.target.value;
    const nextAvailableClientIds = new Set(
      projects
        .find((project) => project.id === nextProjectId)
        ?.clients.map((client) => client.id) ?? [],
    );

    setSelectedProjectId(nextProjectId);
    syncHiddenClientIds(
      selectedClientIds.filter((clientId) =>
        nextAvailableClientIds.has(clientId),
      ),
    );
  };

  const handleClientChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const nextClientIds =
      typeof value === "string"
        ? value.split(",").filter((clientId) => clientId.length > 0)
        : value;

    syncHiddenClientIds(nextClientIds);
  };

  useEffect(() => {
    if (hiddenClientIdsRef.current) {
      hiddenClientIdsRef.current.value = selectedClientIds.join(",");
    }
  }, [selectedClientIds]);

  return (
    <Box component="form" action={formAction}>
      <Stack spacing={2.5}>
        <TextField
          id="projectId"
          name="projectId"
          label="Project"
          select
          value={selectedProjectId}
          onChange={handleProjectChange}
          required
        >
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </TextField>

        <input
          ref={hiddenClientIdsRef}
          id="edit-entry-client-ids"
          name="clientIds"
          type="hidden"
        />

        <TextField
          id="clientIds"
          label="Clients"
          select
          value={selectedClientIds}
          onChange={handleClientChange}
          disabled={availableClients.length === 0}
          helperText={
            availableClients.length === 0
              ? "No clients are assigned to this project."
              : "Optional: choose any clients assigned to this project."
          }
          slotProps={{
            select: {
              multiple: true,
              renderValue: (selected) => {
                const selectedIds = Array.isArray(selected)
                  ? selected
                  : String(selected).split(",");

                return availableClients
                  .filter((client) => selectedIds.includes(client.id))
                  .map((client) => client.name)
                  .join(", ");
              },
            },
          }}
        >
          {availableClients.map((client) => (
            <MenuItem key={client.id} value={client.id}>
              {client.name}
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
          slotProps={{ inputLabel: { shrink: true } }}
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
          {deleteAction ? (
            <Button
              color="error"
              formAction={deleteAction}
              type="submit"
              variant="outlined"
            >
              Delete entry
            </Button>
          ) : null}
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
