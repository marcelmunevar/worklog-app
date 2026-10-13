"use client";

import { Alert, Box, Button } from "@mui/material";
import { useState, useTransition } from "react";
import { createBlankEntry } from "./new/actions";

function getLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AddEntryButton() {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const addEntry = () => {
    setError("");
    startTransition(async () => {
      try {
        const result = await createBlankEntry(getLocalDate());
        if (!result.success) {
          setError(result.message);
        }
      } catch {
        setError("Could not add the entry. Please try again.");
      }
    });
  };

  return (
    <Box>
      <Button onClick={addEntry} variant="contained" disabled={pending}>
        Add entry
      </Button>
      {error ? (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      ) : null}
    </Box>
  );
}
