"use client";

import NavButton from "@/app/components/nav-button";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
} from "@mui/material";
import { useMemo, useState } from "react";

type ClientRow = {
  id: string;
  name: string;
  acronym: string;
  createdAtLabel: string;
  createdAtSortValue: number;
  projectCount: number;
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
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((client) => (
            <TableRow key={client.id}>
              <TableCell sx={{ fontWeight: 500 }}>{client.name}</TableCell>
              <TableCell sx={{ color: "text.secondary" }}>
                {client.acronym || "-"}
              </TableCell>
              <TableCell>{client.createdAtLabel}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {client.projectCount}
              </TableCell>
              <TableCell>
                <NavButton
                  href={`/clients/${client.id}/edit`}
                  variant="outlined"
                  size="small"
                >
                  Edit
                </NavButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
