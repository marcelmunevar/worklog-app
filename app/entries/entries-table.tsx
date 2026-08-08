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

type EntryRow = {
  id: string;
  workDate: string;
  projectName: string;
  title: string;
  description: string;
  isDeleted: boolean;
  isProjectDeleted: boolean;
  deleteAction?: () => Promise<void>;
};

type SortColumn = "workDate" | "projectName" | "title" | "description";
type SortOrder = "asc" | "desc";

type EntriesTableProps = {
  rows: EntryRow[];
};

function compareValues(a: string, b: string) {
  return a.localeCompare(b);
}

export default function EntriesTable({ rows }: EntriesTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("workDate");
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
              sortDirection={sortColumn === "workDate" ? sortOrder : false}
            >
              <TableSortLabel
                active={sortColumn === "workDate"}
                direction={sortColumn === "workDate" ? sortOrder : "asc"}
                onClick={() => handleSort("workDate")}
              >
                Date
              </TableSortLabel>
            </TableCell>
            <TableCell
              sortDirection={sortColumn === "projectName" ? sortOrder : false}
            >
              <TableSortLabel
                active={sortColumn === "projectName"}
                direction={sortColumn === "projectName" ? sortOrder : "asc"}
                onClick={() => handleSort("projectName")}
              >
                Project
              </TableSortLabel>
            </TableCell>
            <TableCell
              sortDirection={sortColumn === "title" ? sortOrder : false}
            >
              <TableSortLabel
                active={sortColumn === "title"}
                direction={sortColumn === "title" ? sortOrder : "asc"}
                onClick={() => handleSort("title")}
              >
                Title
              </TableSortLabel>
            </TableCell>
            <TableCell
              sortDirection={sortColumn === "description" ? sortOrder : false}
            >
              <TableSortLabel
                active={sortColumn === "description"}
                direction={sortColumn === "description" ? sortOrder : "asc"}
                onClick={() => handleSort("description")}
              >
                Description
              </TableSortLabel>
            </TableCell>
            <TableCell>Flags</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((entry) => (
            <TableRow
              key={entry.id}
              sx={
                entry.isDeleted || entry.isProjectDeleted
                  ? { opacity: 0.7 }
                  : undefined
              }
            >
              <TableCell>{entry.workDate}</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>{entry.projectName}</TableCell>
              <TableCell>{entry.title}</TableCell>
              <TableCell sx={{ color: "text.secondary" }}>
                {entry.description || "-"}
              </TableCell>
              <TableCell>
                {entry.isDeleted || entry.isProjectDeleted ? (
                  <Stack direction="row" spacing={1}>
                    {entry.isDeleted ? (
                      <Chip color="default" label="Deleted" size="small" />
                    ) : null}
                    {entry.isProjectDeleted ? (
                      <Chip
                        color="default"
                        label="Project deleted"
                        size="small"
                        variant="outlined"
                      />
                    ) : null}
                  </Stack>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {entry.isDeleted ? (
                  "-"
                ) : entry.isProjectDeleted ? (
                  <Stack direction="row" spacing={1}>
                    {entry.deleteAction ? (
                      <Box component="form" action={entry.deleteAction}>
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
                ) : (
                  <Stack direction="row" spacing={1}>
                    <NavButton
                      href={`/entries/${entry.id}/edit`}
                      variant="outlined"
                      size="small"
                    >
                      Edit
                    </NavButton>
                    {entry.deleteAction ? (
                      <Box component="form" action={entry.deleteAction}>
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
