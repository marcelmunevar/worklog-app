import { db } from "@/db";
import { dailyEntries, projects } from "@/db/schema";
import {
  Button,
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
import { desc, eq } from "drizzle-orm";

export default async function EntriesPage() {
  const entries = await db
    .select({
      id: dailyEntries.id,
      title: dailyEntries.title,
      description: dailyEntries.description,
      workDate: dailyEntries.workDate,
      projectName: projects.name,
      createdAt: dailyEntries.createdAt,
    })
    .from(dailyEntries)
    .innerJoin(projects, eq(dailyEntries.projectId, projects.id))
    .orderBy(desc(dailyEntries.workDate), desc(dailyEntries.createdAt));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1">
          Daily Entries
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button href="/entries/new" variant="contained">
            Add entry
          </Button>
          <Button href="/entries" variant="outlined">
            Entries
          </Button>
          <Button href="/projects" variant="outlined">
            Projects
          </Button>
          <Button href="/clients" variant="outlined">
            Clients
          </Button>
        </Stack>
      </Stack>

      {entries.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">No entries yet.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.workDate}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {entry.projectName}
                  </TableCell>
                  <TableCell>{entry.title}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {entry.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      href={`/entries/${entry.id}/edit`}
                      variant="outlined"
                      size="small"
                    >
                      Edit
                    </Button>
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
