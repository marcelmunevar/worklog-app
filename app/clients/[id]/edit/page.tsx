import { db } from "@/db";
import { clients } from "@/db/schema";
import { Container, Paper, Typography } from "@mui/material";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateClient } from "./actions";
import EditClientForm from "./edit-client-form";

type EditClientPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;

  const [client] = await db
    .select({
      id: clients.id,
      name: clients.name,
      acronym: clients.acronym,
    })
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1);

  if (!client) {
    notFound();
  }

  const updateClientWithId = updateClient.bind(null, id);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Edit Client
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <EditClientForm client={client} action={updateClientWithId} />
      </Paper>
    </Container>
  );
}
