import DateRangeFilter from "@/app/components/date-range-filter";
import { getDateFilterState } from "@/app/components/date-filter-utils";
import NavButton from "@/app/components/nav-button";
import { db } from "@/db";
import { dailyEntries, projects } from "@/db/schema";
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
import { and, desc, eq, gte, lte } from "drizzle-orm";

type EntriesPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EntriesPage({ searchParams }: EntriesPageProps) {
  const resolvedSearchParams = await searchParams;
  const dateFilter = getDateFilterState(resolvedSearchParams);
  const whereClause = dateFilter.isActive
    ? and(
        gte(dailyEntries.workDate, dateFilter.dateFrom),
        lte(dailyEntries.workDate, dateFilter.dateTo),
      )
    : undefined;

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
    .where(whereClause)
    .orderBy(desc(dailyEntries.workDate), desc(dailyEntries.createdAt));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Daily Entries
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
          <NavButton href="/entries/new" variant="contained">
            Add entry
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
                    <NavButton
                      href={`/entries/${entry.id}/edit`}
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
