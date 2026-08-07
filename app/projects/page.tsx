import { db } from "@/db";
import { dailyEntries, projects } from "@/db/schema";
import DateRangeFilter from "@/app/components/date-range-filter";
import {
  getDateFilterState,
  toInclusiveTimestampBounds,
} from "@/app/components/date-filter-utils";
import NavButton from "@/app/components/nav-button";
import ShowDeletedToggle from "@/app/entries/show-deleted-toggle";
import { deleteProject } from "./[id]/edit/actions";
import ProjectsTable from "./projects-table";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { and, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";

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
  const showDeleted = resolvedSearchParams.showDeleted === "true";
  const whereClause = dateFilter.isActive
    ? (() => {
        const { from, to } = toInclusiveTimestampBounds(
          dateFilter.dateFrom,
          dateFilter.dateTo,
        );

        return and(
          showDeleted ? undefined : isNull(projects.deletedAt),
          gte(projects.createdAt, from),
          lte(projects.createdAt, to),
        );
      })()
    : showDeleted
      ? undefined
      : isNull(projects.deletedAt);

  const projectList = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      createdAt: projects.createdAt,
      deletedAt: projects.deletedAt,
      entryCount: sql<number>`count(${dailyEntries.id})`.mapWith(Number),
    })
    .from(projects)
    .leftJoin(
      dailyEntries,
      and(
        eq(dailyEntries.projectId, projects.id),
        isNull(dailyEntries.deletedAt),
      ),
    )
    .where(whereClause)
    .groupBy(
      projects.id,
      projects.name,
      projects.description,
      projects.status,
      projects.createdAt,
    )
    .orderBy(desc(projects.createdAt));

  const projectRows = projectList.map((project) => ({
    id: project.id,
    name: project.name,
    status: project.status,
    description: project.description ?? "",
    createdAtLabel: formatDate(project.createdAt),
    createdAtSortValue: project.createdAt?.getTime() ?? 0,
    entryCount: project.entryCount,
    isDeleted: project.deletedAt !== null,
    deleteAction: project.deletedAt
      ? undefined
      : deleteProject.bind(null, project.id),
  }));

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
        <ProjectsTable rows={projectRows} />
      )}

      <Box sx={{ mt: 1.5 }}>
        <ShowDeletedToggle
          checked={showDeleted}
          label="Show soft deleted projects"
        />
      </Box>
    </Container>
  );
}
