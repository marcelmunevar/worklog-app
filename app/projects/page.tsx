import { db } from "@/db";
import { dailyEntries, projects } from "@/db/schema";
import DateRangeFilter from "@/app/components/date-range-filter";
import {
  getDateFilterState,
  toInclusiveTimestampBounds,
} from "@/app/components/date-filter-utils";
import NavButton from "@/app/components/nav-button";
import {
  Box,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

type ProjectsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function formatDate(dateValue: Date | null) {
  if (!dateValue) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(dateValue);
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const resolvedSearchParams = await searchParams;
  const dateFilter = getDateFilterState(resolvedSearchParams);
  const whereClause = dateFilter.isActive
    ? (() => {
        const { from, to } = toInclusiveTimestampBounds(
          dateFilter.dateFrom,
          dateFilter.dateTo,
        );

        return and(gte(projects.createdAt, from), lte(projects.createdAt, to));
      })()
    : undefined;

  const projectList = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      createdAt: projects.createdAt,
      entryCount: sql<number>`count(${dailyEntries.id})`.mapWith(Number),
    })
    .from(projects)
    .leftJoin(dailyEntries, eq(dailyEntries.projectId, projects.id))
    .where(whereClause)
    .groupBy(
      projects.id,
      projects.name,
      projects.description,
      projects.status,
      projects.createdAt,
    )
    .orderBy(desc(projects.createdAt));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Projects
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "flex-start" },
            width: 1,
            mt: 1.5,
          }}
        >
          <NavButton href="/projects/new" variant="contained">
            Add project
          </NavButton>

          <Box
            sx={{
              minWidth: 0,
              flexGrow: { sm: 1 },
              display: "flex",
              justifyContent: { sm: "flex-end" },
            }}
          >
            <DateRangeFilter
              key={`${dateFilter.preset}:${dateFilter.dateFrom}:${dateFilter.dateTo}`}
              preset={dateFilter.preset}
              dateFrom={dateFilter.dateFrom}
              dateTo={dateFilter.dateTo}
            />
          </Box>
        </Stack>
      </Box>

      {projectList.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">No projects yet.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Entries</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectList.map((project) => (
                <TableRow key={project.id}>
                  <TableCell sx={{ fontWeight: 500 }}>{project.name}</TableCell>
                  <TableCell>{project.status}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {project.description || "-"}
                  </TableCell>
                  <TableCell>{formatDate(project.createdAt)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {project.entryCount}
                  </TableCell>
                  <TableCell>
                    <NavButton
                      href={`/projects/${project.id}/edit`}
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
      )}
    </Container>
  );
}
