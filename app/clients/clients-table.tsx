"use client";

import NavButton from "@/app/components/nav-button";
import {
  Box,
  Button,
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
            <TableCell>Flags</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((client) => (
            <TableRow
              key={client.id}
              sx={client.isDeleted ? { opacity: 0.7 } : undefined}
            >
              <TableCell sx={{ fontWeight: 500 }}>{client.name}</TableCell>
              <TableCell sx={{ color: "text.secondary" }}>
                {client.acronym || "-"}
              </TableCell>
              <TableCell>{client.createdAtLabel}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {client.projectCount}
              </TableCell>
              <TableCell>
                {client.isDeleted ? (
                  <Chip color="default" label="Deleted" size="small" />
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {client.isDeleted ? (
                  "-"
                ) : (
                  <Stack direction="row" spacing={1}>
                    <NavButton
                      href={`/clients/${client.id}/edit`}
                      variant="outlined"
                      size="small"
                    >
                      Edit
                    </NavButton>
                    {client.deleteAction ? (
                      <Box component="form" action={client.deleteAction}>
                        <Button
                          color="error"
                          size="small"
                          type="submit"
                          variant="outlined"
                        >
                          Delete
                        </Button>
                      </Box>
                    ) : null}
                  </Stack>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
