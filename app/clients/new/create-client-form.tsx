"use client";

import { Alert, Box, Button, Stack, TextField } from "@mui/material";
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
    <Button type="submit" disabled={pending} variant="contained">
      {pending ? "Saving..." : "Create client"}
    </Button>
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
    <Box component="form" action={formAction}>
      <Stack spacing={2.5}>
        <TextField id="name" name="name" label="Name" type="text" required />

        <TextField id="acronym" name="acronym" label="Acronym" type="text" />

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
