"use client";

import { MenuItem, TextField } from "@mui/material";
import { useEffect, useRef, useState, useTransition } from "react";
import type { KeyboardEvent } from "react";

export type TableFieldUpdateResult =
  | { success: true }
  | { success: false; message: string };

export type EditableTableCellProps = {
  value: string | string[];
  onSave: (
    value: string | string[],
  ) => Promise<TableFieldUpdateResult>;
  disabled?: boolean;
  type?: "text" | "date" | "select" | "multiple";
  options?: Array<{ value: string; label: string }>;
  emptyLabel?: string;
};

function valuesEqual(left: string | string[], right: string | string[]) {
  return (
    Array.isArray(left) === Array.isArray(right) &&
    (Array.isArray(left) && Array.isArray(right)
      ? left.length === right.length &&
        left.every((value, index) => value === right[index])
      : left === right)
  );
}

export default function EditableTableCell({
  value,
  onSave,
  disabled = false,
  type = "text",
  options = [],
  emptyLabel = "-",
}: EditableTableCellProps) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();
  const isMultiple = type === "multiple";
  const draftRef = useRef(draft);
  const propValueRef = useRef(value);
  const savedValueRef = useRef(value);
  const onSaveRef = useRef(onSave);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef(0);
  const inFlightValueRef = useRef<string | string[] | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (valuesEqual(value, propValueRef.current)) {
      return;
    }

    const previousValue = propValueRef.current;
    propValueRef.current = value;
    savedValueRef.current = value;
    if (
      valuesEqual(draftRef.current, previousValue) ||
      valuesEqual(draftRef.current, value)
    ) {
      draftRef.current = value;
      setDraft(value);
    }
  }, [value]);

  const saveValue = (nextValue: string | string[]) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (
      valuesEqual(nextValue, savedValueRef.current) ||
      (inFlightValueRef.current !== null &&
        valuesEqual(nextValue, inFlightValueRef.current))
    ) {
      return;
    }

    const requestId = ++requestRef.current;
    inFlightValueRef.current = nextValue;
    setError("");
    startTransition(async () => {
      try {
        const result = await onSaveRef.current(nextValue);
        if (requestId !== requestRef.current) {
          return;
        }

        inFlightValueRef.current = null;
        if (!result.success) {
          setError(result.message);
          return;
        }

        savedValueRef.current = nextValue;
      } catch {
        if (requestId === requestRef.current) {
          inFlightValueRef.current = null;
          setError("Could not save changes. Please try again.");
        }
      }
    });
  };

  const updateDraft = (nextValue: string | string[]) => {
    draftRef.current = nextValue;
    setDraft(nextValue);
    setError("");

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (valuesEqual(nextValue, savedValueRef.current)) {
      return;
    }

    if (type === "text") {
      timerRef.current = setTimeout(() => saveValue(nextValue), 500);
    } else {
      saveValue(nextValue);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      draftRef.current = savedValueRef.current;
      setDraft(savedValueRef.current);
      setError("");
    } else if (event.key === "Enter" && !event.shiftKey && type === "text") {
      event.preventDefault();
      saveValue(draftRef.current);
    }
  };

  return (
    <TextField
      fullWidth
      disabled={disabled}
      size="small"
      type={type === "date" ? "date" : "text"}
      select={type === "select" || isMultiple}
      multiline={type === "text" && typeof value === "string" && value.length > 40}
      minRows={
        type === "text" && typeof value === "string" && value.length > 40
          ? 2
          : undefined
      }
      value={draft}
      onChange={(event) => {
        if (isMultiple) {
          const nextValue = event.target.value;
          updateDraft(
            typeof nextValue === "string"
              ? nextValue.split(",")
              : nextValue,
          );
        } else {
          updateDraft(event.target.value);
        }
      }}
      onBlur={() => {
        if (type === "text") {
          saveValue(draftRef.current);
        }
      }}
      onKeyDown={handleKeyDown}
      error={Boolean(error)}
      helperText={error || undefined}
      slotProps={{
        inputLabel: type === "date" ? { shrink: true } : undefined,
        select: isMultiple ? { multiple: true } : undefined,
        htmlInput:
          type === "date"
            ? { "aria-label": "Edit date" }
            : { "aria-label": "Edit field" },
        formHelperText: {
          sx: { minHeight: error ? undefined : 0, m: 0 },
        },
      }}
    >
      {(type === "select" || isMultiple) &&
        options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      {type === "select" &&
      typeof value === "string" &&
      !options.some((option) => option.value === value) ? (
        <MenuItem value={value}>
          {emptyLabel}
        </MenuItem>
      ) : null}
    </TextField>
  );
}
