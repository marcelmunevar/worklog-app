import { db } from "@/db";
import { clients, dailyEntries, projectClients, projects } from "@/db/schema";
import { requireWorklogId } from "@/lib/worklog-access";
import {
  getDateFilterState,
  toInclusiveTimestampBounds,
} from "@/app/components/date-filter-utils";
import NavButton from "@/app/components/nav-button";
import ShowDeletedToggle from "@/app/entries/show-deleted-toggle";
import {
  deleteProject,
  permanentlyDeleteProject,
  restoreProject,
} from "./[id]/edit/actions";
import ProjectsTable from "./projects-table";
import {
  Alert,
  Box,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  isNotNull,
  isNull,
  lte,
  ne,
  sql,
} from "drizzle-orm";

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
  const worklogId = await requireWorklogId();
  const resolvedSearchParams = await searchParams;
  const dateFilter = getDateFilterState(resolvedSearchParams);
  const showDeleted = resolvedSearchParams.showDeleted === "true";
  const showCompleted = resolvedSearchParams.showCompleted === "true";
  const statusFilter = showDeleted
    ? undefined
    : showCompleted
      ? eq(projects.status, "completed")
      : ne(projects.status, "completed");
  const whereClause = and(
    eq(projects.worklogId, worklogId),
    statusFilter,
    dateFilter.isActive
      ? (() => {
          const { from, to } = toInclusiveTimestampBounds(
            dateFilter.dateFrom,
            dateFilter.dateTo,
          );

          return and(
            showDeleted
              ? isNotNull(projects.deletedAt)
              : isNull(projects.deletedAt),
            gte(projects.createdAt, from),
            lte(projects.createdAt, to),
          );
        })()
      : showDeleted
        ? isNotNull(projects.deletedAt)
        : isNull(projects.deletedAt),
  );

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
        eq(dailyEntries.worklogId, worklogId),
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

  const clientAssignments = await db
    .select({
      projectId: projectClients.projectId,
      clientId: projectClients.clientId,
    })
    .from(projectClients)
    .innerJoin(
      projects,
      and(
        eq(projectClients.projectId, projects.id),
        eq(projects.worklogId, worklogId),
      ),
    )
    .innerJoin(
      clients,
      and(
        eq(projectClients.clientId, clients.id),
        eq(clients.worklogId, worklogId),
      ),
    )
    .where(and(eq(clients.worklogId, worklogId), isNull(clients.deletedAt)));

  const availableClients = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(and(eq(clients.worklogId, worklogId), isNull(clients.deletedAt)))
    .orderBy(asc(clients.name));

  const clientIdsByProjectId = clientAssignments.reduce<Record<string, string[]>>(
    (accumulator, assignment) => {
      if (!assignment.projectId) {
        return accumulator;
      }

      const currentIds = accumulator[assignment.projectId] ?? [];
      accumulator[assignment.projectId] = [
        ...currentIds,
        assignment.clientId,
      ];
      return accumulator;
    },
    {},
  );

  const projectRows = projectList.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description ?? "",
    clientIds: clientIdsByProjectId[project.id] ?? [],
    status: project.status,
    createdAtLabel: formatDate(project.createdAt),
    createdAtSortValue: project.createdAt?.getTime() ?? 0,
    entryCount: project.entryCount,
    isDeleted: project.deletedAt !== null,
    deleteAction: project.deletedAt
      ? undefined
      : deleteProject.bind(null, project.id),
    restoreAction: project.deletedAt
      ? restoreProject.bind(null, project.id)
      : undefined,
    permanentlyDeleteAction: project.deletedAt
      ? permanentlyDeleteProject.bind(null, project.id)
      : undefined,
  }));

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
          ></Box>
        </Stack>
      </Box>

      {resolvedSearchParams.trashError === "linked-entries" ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          This project still has entries. Move or remove those entries before
          permanently deleting the project.
        </Alert>
      ) : null}

      {projectList.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">
            {showDeleted
              ? "Trash is empty."
              : showCompleted
                ? "No completed projects."
                : "No projects yet."}
          </Typography>
        </Paper>
      ) : (
        <ProjectsTable rows={projectRows} availableClients={availableClients} />
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <ShowDeletedToggle
          checked={showCompleted}
          label="Show completed projects"
          param="showCompleted"
          clearParams={["showDeleted"]}
        />
        <ShowDeletedToggle
          checked={showDeleted}
          label="Show project trash"
          clearParams={["showCompleted"]}
        />
      </Stack>
    </Container>
  );
}
