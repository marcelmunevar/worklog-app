import DateRangeFilter from "@/app/components/date-range-filter";
import { getDateFilterState } from "@/app/components/date-filter-utils";
import NavButton from "@/app/components/nav-button";
import { deleteEntry } from "./[id]/edit/actions";
import EntriesTable from "./entries-table";
import ShowDeletedToggle from "./show-deleted-toggle";
import { db } from "@/db";
import { clients, dailyEntries, entryClients, projects } from "@/db/schema";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { and, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";

type EntriesPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

async function entryClientsTableExists(): Promise<boolean> {
  try {
    const result = await db.execute(
      sql`select to_regclass('public.entry_clients') as table_name`,
    );

    const rows = result.rows as Array<{
      table_name: string | null;
    }>;

    const tableName = rows[0]?.table_name;

    return (
      tableName === "entry_clients" || tableName === "public.entry_clients"
    );
  } catch {
    return false;
  }
}

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

  const supportsEntryClients = await entryClientsTableExists();

  const entries = supportsEntryClients
    ? await db
        .select({
          id: dailyEntries.id,
          title: dailyEntries.title,
          description: dailyEntries.description,
          workDate: dailyEntries.workDate,
          projectName: projects.name,
          createdAt: dailyEntries.createdAt,
          deletedAt: dailyEntries.deletedAt,
          projectDeletedAt: projects.deletedAt,
          clientName: clients.name,
          clientAcronym: clients.acronym,
        })
        .from(dailyEntries)
        .innerJoin(projects, eq(dailyEntries.projectId, projects.id))
        .leftJoin(entryClients, eq(entryClients.dailyEntryId, dailyEntries.id))
        .leftJoin(clients, eq(entryClients.clientId, clients.id))
        .where(whereClause)
        .orderBy(
          desc(dailyEntries.workDate),
          desc(dailyEntries.createdAt),
          clients.name,
        )
    : await db
        .select({
          id: dailyEntries.id,
          title: dailyEntries.title,
          description: dailyEntries.description,
          workDate: dailyEntries.workDate,
          projectName: projects.name,
          createdAt: dailyEntries.createdAt,
          deletedAt: dailyEntries.deletedAt,
          projectDeletedAt: projects.deletedAt,
          clientName: sql<string | null>`NULL`,
          clientAcronym: sql<string | null>`NULL`,
        })
        .from(dailyEntries)
        .innerJoin(projects, eq(dailyEntries.projectId, projects.id))
        .where(whereClause)
        .orderBy(desc(dailyEntries.workDate), desc(dailyEntries.createdAt));

  const entryMap = new Map<
    string,
    {
      id: string;
      workDate: string;
      projectName: string;
      title: string;
      description: string;
      clientsLabel: string;
      clientsAcronym: string;
      isDeleted: boolean;
      isProjectDeleted: boolean;
      deleteAction?: () => Promise<void>;
      clientNames: string[];
      clientAcronyms: string[];
    }
  >();

  for (const entry of entries) {
    const existingEntry = entryMap.get(entry.id);

    if (existingEntry) {
      if (
        entry.clientName &&
        !existingEntry.clientNames.includes(entry.clientName)
      ) {
        existingEntry.clientNames.push(entry.clientName);
        existingEntry.clientsLabel = existingEntry.clientNames.join(", ");
      }

      if (
        entry.clientAcronym &&
        !existingEntry.clientAcronyms.includes(entry.clientAcronym)
      ) {
        existingEntry.clientAcronyms.push(entry.clientAcronym);
        existingEntry.clientsAcronym = existingEntry.clientAcronyms.join(", ");
      }

      continue;
    }

    entryMap.set(entry.id, {
      id: entry.id,
      workDate: entry.workDate,
      projectName: entry.projectName,
      title: entry.title,
      description: entry.description ?? "",
      clientsLabel: entry.clientName ?? "",
      clientsAcronym: entry.clientAcronym ?? "",
      clientNames: entry.clientName ? [entry.clientName] : [],
      clientAcronyms: entry.clientAcronym ? [entry.clientAcronym] : [],
      isDeleted: entry.deletedAt !== null,
      isProjectDeleted: entry.projectDeletedAt !== null,
      deleteAction: entry.deletedAt
        ? undefined
        : deleteEntry.bind(null, entry.id),
    });
  }

  const entryRows = [...entryMap.values()].map(
    ({ clientNames, clientAcronyms, ...entry }) => ({
      ...entry,
      clientsLabel: clientNames.length > 0 ? clientNames.join(", ") : "",
      clientsAcronym:
        clientAcronyms.length > 0 ? clientAcronyms.join(", ") : "",
    }),
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Daily Entries</Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: {
              xs: "stretch",
              sm: "flex-start",
            },
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
              justifyContent: {
                sm: "flex-end",
              },
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
