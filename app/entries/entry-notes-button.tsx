"use client";

import { updateEntryField } from "@/app/entries/[id]/edit/actions";
import NotesIcon from "@mui/icons-material/Notes";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import { useState, useTransition } from "react";

type EntryNotesButtonProps = {
  entryId: string;
  notes: string;
  disabled?: boolean;
};

export default function EntryNotesButton({
  entryId,
  notes,
  disabled = false,
}: EntryNotesButtonProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(notes);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasNotes = notes.trim().length > 0;

  function handleOpen() {
    setDraft(notes);
    setError(null);
    setOpen(true);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateEntryField(entryId, "notes", draft);
      if (result.success) {
        setOpen(false);
      } else {
        setError(result.message ?? "Could not save notes.");
      }
    });
  }

  return (
    <>
      <Tooltip title={hasNotes ? "Edit notes" : "Add notes"}>
        <span>
          <IconButton
            aria-label={hasNotes ? "Edit entry notes" : "Add entry notes"}
            color={hasNotes ? "primary" : "default"}
            disabled={disabled}
            onClick={handleOpen}
            size="small"
          >
            {hasNotes ? <StickyNote2Icon /> : <NotesIcon />}
          </IconButton>
        </span>
      </Tooltip>
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setOpen(false)}
        open={open}
      >
        <DialogTitle>Notes</DialogTitle>
        <DialogContent>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={14}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Additional notes"
            sx={{ mt: 1 }}
            value={draft}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={isPending} onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
