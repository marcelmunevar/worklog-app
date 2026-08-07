import { db } from "@/db";
import { clients, projectClients } from "@/db/schema";
import NavButton from "@/app/components/nav-button";
import ClientsTable from "./clients-table";
import { Box, Container, Paper, Typography } from "@mui/material";
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

export default async function ClientsPage() {
  const clientList = await db
    .select({
      id: clients.id,
      name: clients.name,
      acronym: clients.acronym,
      createdAt: clients.createdAt,
      projectCount: sql<number>`count(${projectClients.projectId})`.mapWith(
        Number,
      ),
    })
    .from(clients)
    .leftJoin(projectClients, eq(projectClients.clientId, clients.id))
    .groupBy(clients.id, clients.name, clients.acronym, clients.createdAt)
    .orderBy(desc(clients.createdAt));

  const clientRows = clientList.map((client) => ({
    id: client.id,
    name: client.name,
    acronym: client.acronym ?? "",
    createdAtLabel: formatDate(client.createdAt),
    createdAtSortValue: client.createdAt?.getTime() ?? 0,
    projectCount: client.projectCount,
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Clients
        </Typography>

        <Box sx={{ mt: 1.5 }}>
          <NavButton href="/clients/new" variant="contained">
            Add client
          </NavButton>
        </Box>
      </Box>

      {clientList.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">No clients yet.</Typography>
        </Paper>
      ) : (
        <ClientsTable rows={clientRows} />
      )}
    </Container>
  );
}
