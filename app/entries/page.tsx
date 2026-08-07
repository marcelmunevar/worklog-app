import DateRangeFilter from "@/app/components/date-range-filter";
import { getDateFilterState } from "@/app/components/date-filter-utils";
import NavButton from "@/app/components/nav-button";
import { deleteEntry } from "./[id]/edit/actions";
import EntriesTable from "./entries-table";
import ShowDeletedToggle from "./show-deleted-toggle";
import { db } from "@/db";
import { dailyEntries, projects } from "@/db/schema";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { and, desc, eq, gte, isNull, lte } from "drizzle-orm";

type EntriesPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EntriesPage({ searchParams }: EntriesPageProps) {
  const resolvedSearchParams = await searchParams;
  const dateFilter = getDateFilterState(resolvedSearchParams);
  const showDeleted = resolvedSearchParams.showDeleted === "true";
  const whereClause = dateFilter.isActive
    ? and(
        showDeleted ? undefined : isNull(dailyEntries.deletedAt),
        gte(dailyEntries.workDate, dateFilter.dateFrom),
        lte(dailyEntries.workDate, dateFilter.dateTo),
      )
    : showDeleted
      ? undefined
      : isNull(dailyEntries.deletedAt);

  const entries = await db
    .select({
      id: dailyEntries.id,
      title: dailyEntries.title,
      description: dailyEntries.description,
      workDate: dailyEntries.workDate,
      projectName: projects.name,
      createdAt: dailyEntries.createdAt,
      deletedAt: dailyEntries.deletedAt,
      projectDeletedAt: projects.deletedAt,
    })
    .from(dailyEntries)
    .innerJoin(projects, eq(dailyEntries.projectId, projects.id))
    .where(whereClause)
    .orderBy(desc(dailyEntries.workDate), desc(dailyEntries.createdAt));

  const entryRows = entries.map((entry) => ({
    id: entry.id,
    workDate: entry.workDate,
    projectName: entry.projectName,
    title: entry.title,
    description: entry.description ?? "",
    isDeleted: entry.deletedAt !== null,
    isProjectDeleted: entry.projectDeletedAt !== null,
    deleteAction: entry.deletedAt
      ? undefined
      : deleteEntry.bind(null, entry.id),
  }));

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
        <EntriesTable rows={entryRows} />
      )}

      <Box sx={{ mt: 1.5 }}>
        <ShowDeletedToggle checked={showDeleted} />
      </Box>
    </Container>
  );
}
