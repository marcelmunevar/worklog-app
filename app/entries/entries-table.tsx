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
import { Fragment, useMemo, useState } from "react";

type EntryRow = {
  id: string;
  workDate: string;
  projectName: string;
  title: string;
  description: string;
  clientsLabel: string;
  isDeleted: boolean;
  isProjectDeleted: boolean;
  deleteAction?: () => Promise<void>;
};

type SortColumn =
  | "workDate"
  | "projectName"
  | "title"
  | "description"
  | "clientsLabel";
type SortOrder = "asc" | "desc";

type EntriesTableProps = {
  rows: EntryRow[];
};

function compareValues(a: string, b: string) {
  return a.localeCompare(b);
}

function formatEntryDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return `${month.toString().padStart(2, "0")}/${day
    .toString()
    .padStart(2, "0")}/${year}`;
}

function formatDateHeader(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "numeric",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
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

  const groupedRows = useMemo(() => {
    const groups = new Map<string, EntryRow[]>();

    sortedRows.forEach((entry) => {
      if (!groups.has(entry.workDate)) {
        groups.set(entry.workDate, []);
      }

      groups.get(entry.workDate)!.push(entry);
    });

    if (groups.size === 0) {
      return groups;
    }

    const dates = Array.from(groups.keys()).sort();

    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);

    const allDates = new Map<string, EntryRow[]>();

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const date = currentDate.toISOString().split("T")[0];

      allDates.set(date, groups.get(date) ?? []);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return allDates;
  }, [sortedRows]);

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
            <TableCell
              sortDirection={sortColumn === "clientsLabel" ? sortOrder : false}
            >
              <TableSortLabel
                active={sortColumn === "clientsLabel"}
                direction={sortColumn === "clientsLabel" ? sortOrder : "asc"}
                onClick={() => handleSort("clientsLabel")}
              >
                Clients
              </TableSortLabel>
            </TableCell>
            <TableCell>Flags</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from(groupedRows.entries()).map(([date, entries]) => (
            <Fragment key={date}>
              <TableRow
                sx={{
                  backgroundColor: "action.hover",
                }}
              >
                <TableCell
                  colSpan={7}
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {formatDateHeader(date)}
                  {entries.length === 0 && " — no items"}
                </TableCell>
              </TableRow>

              {entries.map((entry) => (
                <TableRow
                  key={entry.id}
                  sx={
                    entry.isDeleted || entry.isProjectDeleted
                      ? { opacity: 0.7 }
                      : undefined
                  }
                >
                  <TableCell>{formatEntryDate(entry.workDate)}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {entry.projectName}
                  </TableCell>
                  <TableCell>{entry.title}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {entry.description || "-"}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {entry.clientsLabel || "-"}
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
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
