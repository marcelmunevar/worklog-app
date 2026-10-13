"use client";

import EditableTableCell from "@/app/components/editable-table-cell";
import {
  permanentlyDeleteEntry,
  restoreEntry,
  updateEntryField,
} from "@/app/entries/[id]/edit/actions";
import TableRowAction from "@/app/components/table-row-action";
import type { EntryProjectOption } from "@/app/entries/entry-form-data";
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
import { Fragment, useMemo, useState } from "react";

type EntryRow = {
  id: string;
  projectId: string | null;
  workDate: string;
  projectName: string;
  title: string;
  description: string;
  clientsLabel: string;
  clientsAcronym: string;
  clientIds: string[];
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
  projects: EntryProjectOption[];
};

function compareValues(a: string, b: string) {
  return a.localeCompare(b);
}

function formatDateHeader(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "numeric",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

export default function EntriesTable({ rows, projects }: EntriesTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("workDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const showFlags = rows.some((row) => row.isDeleted);


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

    return groups;
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
            {showFlags ? <TableCell>Flags</TableCell> : null}
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
                  colSpan={showFlags ? 7 : 6}
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {formatDateHeader(date)}
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
                  <TableCell>
                    <EditableTableCell
                      type="date"
                      value={entry.workDate}
                      disabled={entry.isDeleted || entry.isProjectDeleted}
                      onSave={(value) =>
                        updateEntryField(
                          entry.id,
                          "workDate",
                          String(value),
                        )
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    <EditableTableCell
                      type="select"
                      value={entry.projectId ?? ""}
                      emptyLabel="No project"
                      options={[
                        { value: "", label: "No project" },
                        ...projects.map((project) => ({
                          value: project.id,
                          label: project.name,
                        })),
                      ]}
                      disabled={entry.isDeleted || entry.isProjectDeleted}
                      onSave={(value) =>
                        updateEntryField(
                          entry.id,
                          "projectId",
                          String(value),
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <EditableTableCell
                      value={entry.title}
                      disabled={entry.isDeleted || entry.isProjectDeleted}
                      onSave={(value) =>
                        updateEntryField(entry.id, "title", String(value))
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    <EditableTableCell
                      value={entry.description}
                      disabled={entry.isDeleted || entry.isProjectDeleted}
                      onSave={(value) =>
                        updateEntryField(
                          entry.id,
                          "description",
                          String(value),
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <EditableTableCell
                      type="multiple"
                      value={entry.clientIds}
                      emptyLabel={
                        entry.clientsLabel
                          ? `${entry.clientsLabel}${
                              entry.clientsAcronym
                                ? ` (${entry.clientsAcronym})`
                                : ""
                            }`
                          : "-"
                      }
                      options={
                        projects
                          .find((project) => project.id === entry.projectId)
                          ?.clients.map((client) => ({
                            value: client.id,
                            label: client.name,
                          })) ?? []
                      }
                      disabled={
                        entry.isDeleted ||
                        entry.isProjectDeleted ||
                        !projects.some(
                          (project) => project.id === entry.projectId,
                        )
                      }
                      onSave={(value) =>
                        updateEntryField(
                          entry.id,
                          "clientIds",
                          Array.isArray(value) ? value : [value],
                        )
                      }
                    />
                  </TableCell>
                  {showFlags ? (
                  <TableCell>
                    {entry.isDeleted || entry.isProjectDeleted ? (
                      <Stack direction="row" spacing={1}>
                        {entry.isDeleted ? (
                          <Chip color="default" label="In trash" size="small" />
                        ) : null}
                        {entry.isProjectDeleted ? (
                          <Chip
                            color="default"
                            label="Project in trash"
                            size="small"
                            variant="outlined"
                          />
                        ) : null}
                      </Stack>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  ) : null}
                  <TableCell>
                    {entry.isDeleted ? (
                      <Stack direction="row" spacing={0.5}>
                        <TableRowAction
                          action={restoreEntry.bind(null, entry.id)}
                          entity="entry"
                          type="restore"
                        />
                        <TableRowAction
                          action={permanentlyDeleteEntry.bind(
                            null,
                            entry.id,
                          )}
                          entity="entry"
                          type="deletePermanently"
                        />
                      </Stack>
                    ) : entry.deleteAction ? (
                      <TableRowAction
                        action={entry.deleteAction}
                        entity="entry"
                        type="delete"
                      />
                    ) : (
                      "-"
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
