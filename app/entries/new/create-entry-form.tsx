"use client";

import type { EntryProjectOption } from "@/app/entries/entry-form-data";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import ModalCloseButton from "@/app/components/modal-close-button";
import {
  initialCreateEntryFormState,
  type CreateEntryFormState,
} from "./form-state";

type CreateEntryFormProps = {
  projects: EntryProjectOption[];
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
    <Button type="submit" variant="contained" disabled={pending}>
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
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const hiddenClientIdsRef = useRef<HTMLInputElement | null>(null);

  const [state, formAction] = useActionState(
    action,
    initialCreateEntryFormState,
  );

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

  const handleProjectChange = (event: SelectChangeEvent) => {
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
    <Box component="form" action={formAction} sx={{ width: "100%" }}>
      <Stack spacing={2}>
        <FormControl fullWidth>
          <InputLabel id="create-entry-project-label">Project</InputLabel>

          <Select
            labelId="create-entry-project-label"
            id="projectId"
            name="projectId"
            value={selectedProjectId}
            label="Project"
            onChange={handleProjectChange}
            required
          >
            <MenuItem value="">Select a project</MenuItem>

            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <input
          ref={hiddenClientIdsRef}
          id="create-entry-client-ids"
          name="clientIds"
          type="hidden"
        />

        <FormControl
          fullWidth
          disabled={!selectedProjectId || availableClients.length === 0}
        >
          <InputLabel id="create-entry-client-label">Clients</InputLabel>

          <Select
            labelId="create-entry-client-label"
            id="clientIds"
            value={selectedClientIds}
            onChange={handleClientChange}
            multiple
            label="Clients"
            renderValue={(selected) =>
              availableClients
                .filter((client) => selected.includes(client.id))
                .map((client) => client.name)
                .join(", ")
            }
          >
            {availableClients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.name}
              </MenuItem>
            ))}
          </Select>

          <FormHelperText>
            {!selectedProjectId
              ? "Choose a project before selecting clients."
              : availableClients.length === 0
                ? "No clients are assigned to this project."
                : "Optional: choose any clients assigned to this project."}
          </FormHelperText>
        </FormControl>

        <TextField id="title" name="title" label="Title" type="text" required />

        <TextField
          id="workDate"
          name="workDate"
          label="Date"
          type="date"
          required
          slotProps={{ inputLabel: { shrink: true } }}
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
