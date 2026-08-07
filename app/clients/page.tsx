import { db } from "@/db";
import { clients, projectClients } from "@/db/schema";
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1">
          Clients
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button href="/clients/new" variant="contained">
            Add client
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

      {clientList.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">No clients yet.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Acronym</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Projects</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientList.map((client) => (
                <TableRow key={client.id}>
                  <TableCell sx={{ fontWeight: 500 }}>{client.name}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {client.acronym || "-"}
                  </TableCell>
                  <TableCell>{formatDate(client.createdAt)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {client.projectCount}
                  </TableCell>
                  <TableCell>
                    <Button
                      href={`/clients/${client.id}/edit`}
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
