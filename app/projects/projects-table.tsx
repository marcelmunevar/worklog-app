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

type ProjectRow = {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAtLabel: string;
  createdAtSortValue: number;
  entryCount: number;
  isDeleted: boolean;
  deleteAction?: () => Promise<void>;
};

type SortColumn =
  | "name"
  | "status"
  | "description"
  | "createdAtSortValue"
  | "entryCount";
type SortOrder = "asc" | "desc";

type ProjectsTableProps = {
  rows: ProjectRow[];
};

function compareValues(a: string | number, b: string | number) {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b));
}

export default function ProjectsTable({ rows }: ProjectsTableProps) {
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
              sortDirection={sortColumn === "status" ? sortOrder : false}
            >
              <TableSortLabel
                active={sortColumn === "status"}
                direction={sortColumn === "status" ? sortOrder : "asc"}
                onClick={() => handleSort("status")}
              >
                Status
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
              sortDirection={sortColumn === "entryCount" ? sortOrder : false}
            >
              <TableSortLabel
                active={sortColumn === "entryCount"}
                direction={sortColumn === "entryCount" ? sortOrder : "asc"}
                onClick={() => handleSort("entryCount")}
              >
                Entries
              </TableSortLabel>
            </TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((project) => (
            <TableRow
              key={project.id}
              sx={project.isDeleted ? { opacity: 0.7 } : undefined}
            >
              <TableCell sx={{ fontWeight: 500 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Box component="span">{project.name}</Box>
                  {project.isDeleted ? (
                    <Chip color="default" label="Deleted" size="small" />
                  ) : null}
                </Stack>
              </TableCell>
              <TableCell>{project.status}</TableCell>
              <TableCell sx={{ color: "text.secondary" }}>
                {project.description || "-"}
              </TableCell>
              <TableCell>{project.createdAtLabel}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {project.entryCount}
              </TableCell>
              <TableCell>
                {project.isDeleted ? (
                  <Chip
                    color="default"
                    label="Soft deleted"
                    size="small"
                    variant="outlined"
                  />
                ) : (
                  <Stack direction="row" spacing={1}>
                    <NavButton
                      href={`/projects/${project.id}/edit`}
                      variant="outlined"
                      size="small"
                    >
                      Edit
                    </NavButton>
                    {project.deleteAction ? (
                      <Box component="form" action={project.deleteAction}>
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
