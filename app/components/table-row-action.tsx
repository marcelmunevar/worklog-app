"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import { Box, IconButton, Tooltip } from "@mui/material";
import type { FormEvent } from "react";

type TableRowActionProps = {
  action: () => Promise<void>;
  entity: "entry" | "project" | "client";
  type: "delete" | "restore" | "deletePermanently";
};

const actionDetails = {
  delete: {
    color: "error",
    Icon: DeleteIcon,
  },
  restore: {
    color: "primary",
    Icon: RestoreFromTrashIcon,
  },
  deletePermanently: {
    color: "error",
    Icon: DeleteForeverIcon,
  },
} as const;

export default function TableRowAction({
  action,
  entity,
  type,
}: TableRowActionProps) {
  const details = actionDetails[type];
  const label =
    type === "deletePermanently"
      ? `Delete ${entity} permanently`
      : type === "restore"
        ? `Restore ${entity}`
        : `Move ${entity} to trash`;
  const confirmBeforeSubmit =
    type === "deletePermanently"
      ? (event: FormEvent<HTMLFormElement>) => {
          if (
            !window.confirm(
              `Permanently delete this ${entity}? This cannot be undone.`,
            )
          ) {
            event.preventDefault();
          }
        }
      : undefined;

  return (
    <Box component="form" action={action} onSubmit={confirmBeforeSubmit}>
      <Tooltip title={label}>
        <IconButton
          aria-label={label}
          color={details.color}
          size="small"
          type="submit"
        >
          <details.Icon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
