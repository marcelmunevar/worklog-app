import { db } from "@/db";
import { dailyEntries, projects } from "@/db/schema";
import NavButton from "@/app/components/nav-button";
import {
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
import { desc, eq, sql } from "drizzle-orm";

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

export default async function ProjectsPage() {
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", mb: 3 }}
      >
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <NavButton href="/projects/new" variant="contained">
            Add project
          </NavButton>
          <NavButton href="/entries" variant="outlined">
            Entries
          </NavButton>
          <NavButton href="/projects" variant="outlined">
            Projects
          </NavButton>
          <NavButton href="/clients" variant="outlined">
            Clients
          </NavButton>
        </Stack>
      </Stack>

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
