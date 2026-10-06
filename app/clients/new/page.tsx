import { Container, Paper, Typography } from "@mui/material";
import { requireWorklogId } from "@/lib/worklog-access";
import CreateClientForm from "./create-client-form";
import { createClient } from "./actions";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  await requireWorklogId();

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        New Client
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <CreateClientForm action={createClient} />
      </Paper>
    </Container>
  );
}
