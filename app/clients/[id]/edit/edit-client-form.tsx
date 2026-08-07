"use client";

import { Alert, Box, Button, Stack, TextField } from "@mui/material";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import ModalCloseButton from "./modal-close-button";
import {
  initialEditClientFormState,
  type EditClientFormState,
} from "./form-state";

type ClientData = {
  name: string;
  acronym: string | null;
};

type EditClientFormProps = {
  client: ClientData;
  action: (
    state: EditClientFormState,
    formData: FormData,
  ) => Promise<EditClientFormState>;
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

export default function EditClientForm({
  client,
  action,
  cancelHref = "/clients",
  cancelLabel = "Cancel",
  cancelMode = "link",
}: EditClientFormProps) {
  const [state, formAction] = useActionState(
    action,
    initialEditClientFormState,
  );

  return (
    <Box component="form" action={formAction}>
      <Stack spacing={2.5}>
        <TextField
          id="name"
          name="name"
          label="Name"
          type="text"
          defaultValue={client.name}
          required
        />

        <TextField
          id="acronym"
          name="acronym"
          label="Acronym"
          type="text"
          defaultValue={client.acronym ?? ""}
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
