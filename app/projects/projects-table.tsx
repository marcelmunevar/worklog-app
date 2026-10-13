"use client";

import EditableTableCell from "@/app/components/editable-table-cell";
import TableRowAction from "@/app/components/table-row-action";
import { updateProjectField } from "@/app/projects/[id]/edit/actions";
import { PROJECT_STATUS_OPTIONS } from "@/app/projects/project-status";
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

type ProjectRow = {
  id: string;
  name: string;
  description: string;
  clientIds: string[];
  status: string;
  createdAtLabel: string;
  createdAtSortValue: number;
  entryCount: number;
  isDeleted: boolean;
  deleteAction?: () => Promise<void>;
  restoreAction?: () => Promise<void>;
  permanentlyDeleteAction?: () => Promise<void>;
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
  availableClients: Array<{ id: string; name: string }>;
};

function compareValues(a: string | number, b: string | number) {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b));
}

export default function ProjectsTable({
  rows,
  availableClients,
}: ProjectsTableProps) {
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
            <TableCell>Clients</TableCell>
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
            {showFlags ? <TableCell>Flags</TableCell> : null}
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
                <EditableTableCell
                  value={project.name}
                  disabled={project.isDeleted}
                  onSave={(value) =>
                    updateProjectField(project.id, "name", String(value))
                  }
                />
              </TableCell>
              <TableCell>
                <EditableTableCell
                  type="select"
                  options={PROJECT_STATUS_OPTIONS}
                  value={project.status}
                  disabled={project.isDeleted}
                  onSave={(value) =>
                    updateProjectField(project.id, "status", String(value))
                  }
                />
              </TableCell>
              <TableCell sx={{ color: "text.secondary" }}>
                <EditableTableCell
                  value={project.description}
                  disabled={project.isDeleted}
                  onSave={(value) =>
                    updateProjectField(
                      project.id,
                      "description",
                      String(value),
                    )
                  }
                />
              </TableCell>
              <TableCell>
                <EditableTableCell
                  type="multiple"
                  value={project.clientIds}
                  options={availableClients.map((client) => ({
                    value: client.id,
                    label: client.name,
                  }))}
                  disabled={project.isDeleted}
                  onSave={(value) =>
                    updateProjectField(
                      project.id,
                      "clientIds",
                      Array.isArray(value) ? value : [value],
                    )
                  }
                />
              </TableCell>
              <TableCell>{project.createdAtLabel}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {project.entryCount}
              </TableCell>
              {showFlags ? (
                <TableCell>
                  {project.isDeleted ? (
                    <Chip color="default" label="In trash" size="small" />
                  ) : (
                    "-"
                  )}
                </TableCell>
              ) : null}
              <TableCell>
                {project.isDeleted ? (
                  <Stack direction="row" spacing={0.5}>
                    {project.restoreAction ? (
                      <TableRowAction
                        action={project.restoreAction}
                        entity="project"
                        type="restore"
                      />
                    ) : null}
                    {project.permanentlyDeleteAction ? (
                      <TableRowAction
                        action={project.permanentlyDeleteAction}
                        entity="project"
                        type="deletePermanently"
                      />
                    ) : null}
                  </Stack>
                ) : (
                  project.deleteAction ? (
                    <TableRowAction
                      action={project.deleteAction}
                      entity="project"
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
