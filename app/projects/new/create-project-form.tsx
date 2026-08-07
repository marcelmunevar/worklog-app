"use client";

import { Alert, Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import ModalCloseButton from "@/app/components/modal-close-button";
import {
  initialCreateProjectFormState,
  type CreateProjectFormState,
} from "./form-state";

type CreateProjectFormProps = {
  clients: ClientOption[];
  action: (
    state: CreateProjectFormState,
    formData: FormData,
  ) => Promise<CreateProjectFormState>;
  cancelHref?: string;
  cancelLabel?: string;
  cancelMode?: "link" | "back";
};

type ClientOption = {
  id: string;
  name: string;
};

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} variant="contained">
      {pending ? "Saving..." : "Create project"}
    </Button>
  );
}

export default function CreateProjectForm({
  clients,
  action,
  cancelHref = "/projects",
  cancelLabel = "Cancel",
  cancelMode = "link",
}: CreateProjectFormProps) {
  const [initialClientIds] = useState<string[]>([]);
  const [state, formAction] = useActionState(
    action,
    initialCreateProjectFormState,
  );

  return (
    <Box component="form" action={formAction}>
      <Stack spacing={2.5}>
        <TextField id="name" name="name" label="Name" type="text" required />

        <TextField
          id="status"
          name="status"
          label="Status"
          type="text"
          defaultValue="active"
          required
        />

        <TextField
          id="description"
          name="description"
          label="Description"
          multiline
          rows={5}
        />

        <TextField
          id="clientIds"
          name="clientIds"
          label="Clients"
          select
          slotProps={{ select: { multiple: true } }}
          defaultValue={initialClientIds}
          helperText={
            clients.length === 0
              ? "No clients available yet."
              : "Optional: assign one or more clients."
          }
        >
          {clients.map((client) => (
            <MenuItem key={client.id} value={client.id}>
              {client.name}
            </MenuItem>
          ))}
        </TextField>

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
