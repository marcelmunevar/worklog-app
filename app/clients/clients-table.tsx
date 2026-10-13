"use client";

import EditableTableCell from "@/app/components/editable-table-cell";
import TableRowAction from "@/app/components/table-row-action";
import { updateClientField } from "@/app/clients/[id]/edit/actions";
import {
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { useMemo, useState } from "react";

type ClientRow = {
  id: string;
  name: string;
  acronym: string;
  createdAtLabel: string;
  createdAtSortValue: number;
  projectCount: number;
  isDeleted: boolean;
  deleteAction?: () => Promise<void>;
  restoreAction?: () => Promise<void>;
  permanentlyDeleteAction?: () => Promise<void>;
};

type SortColumn = "name" | "acronym" | "createdAtSortValue" | "projectCount";
type SortOrder = "asc" | "desc";

type ClientsTableProps = {
  rows: ClientRow[];
};

function compareValues(a: string | number, b: string | number) {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b));
}

export default function ClientsTable({ rows }: ClientsTableProps) {
  const [sortColumn, setSortColumn] =
    useState<SortColumn>("createdAtSortValue");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const showFlags = rows.some((row) => row.isDeleted);


  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const direction = sortOrder === "asc" ? 1 : -1;
      return direction * compareValues(a[sortColumn], b[sortColumn]);
    });
  }, [rows, sortColumn, sortOrder]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortOrder((previousOrder) =>
        previousOrder === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortColumn(column);
    setSortOrder("asc");
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sortDirection={sortColumn === "name" ? sortOrder : false}
            >
              <TableSortLabel
                active={sortColumn === "name"}
                direction={sortColumn === "name" ? sortOrder : "asc"}
                onClick={() => handleSort("name")}
              >
                Name
              </TableSortLabel>
            </TableCell>
            <TableCell
              sortDirection={sortColumn === "acronym" ? sortOrder : false}
            >
              <TableSortLabel
                active={sortColumn === "acronym"}
                direction={sortColumn === "acronym" ? sortOrder : "asc"}
                onClick={() => handleSort("acronym")}
              >
                Acronym
              </TableSortLabel>
            </TableCell>
            <TableCell
              sortDirection={
                sortColumn === "createdAtSortValue" ? sortOrder : false
              }
            >
              <TableSortLabel
                active={sortColumn === "createdAtSortValue"}
                direction={
                  sortColumn === "createdAtSortValue" ? sortOrder : "asc"
                }
                onClick={() => handleSort("createdAtSortValue")}
              >
                Created
              </TableSortLabel>
            </TableCell>
            <TableCell
              sortDirection={sortColumn === "projectCount" ? sortOrder : false}
            >
              <TableSortLabel
                active={sortColumn === "projectCount"}
                direction={sortColumn === "projectCount" ? sortOrder : "asc"}
                onClick={() => handleSort("projectCount")}
              >
                Projects
              </TableSortLabel>
            </TableCell>
            {showFlags ? <TableCell>Flags</TableCell> : null}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((client) => (
            <TableRow
              key={client.id}
              sx={client.isDeleted ? { opacity: 0.7 } : undefined}
            >
              <TableCell sx={{ fontWeight: 500 }}>
                <EditableTableCell
                  value={client.name}
                  disabled={client.isDeleted}
                  onSave={(value) =>
                    updateClientField(client.id, "name", String(value))
                  }
                />
              </TableCell>
              <TableCell sx={{ color: "text.secondary" }}>
                <EditableTableCell
                  value={client.acronym}
                  disabled={client.isDeleted}
                  onSave={(value) =>
                    updateClientField(client.id, "acronym", String(value))
                  }
                />
              </TableCell>
              <TableCell>{client.createdAtLabel}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {client.projectCount}
              </TableCell>
              {showFlags ? (
                <TableCell>
                  {client.isDeleted ? (
                    <Chip color="default" label="In trash" size="small" />
                  ) : (
                    "-"
                  )}
                </TableCell>
              ) : null}
              <TableCell>
                {client.isDeleted ? (
                  <Stack direction="row" spacing={0.5}>
                    {client.restoreAction ? (
                      <TableRowAction
                        action={client.restoreAction}
                        entity="client"
                        type="restore"
                      />
                    ) : null}
                    {client.permanentlyDeleteAction ? (
                      <TableRowAction
                        action={client.permanentlyDeleteAction}
                        entity="client"
                        type="deletePermanently"
                      />
                    ) : null}
                  </Stack>
                ) : (
                  client.deleteAction ? (
                    <TableRowAction
                      action={client.deleteAction}
                      entity="client"
                      type="delete"
                    />
                  ) : null
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
