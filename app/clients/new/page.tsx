import { Container, Paper, Typography } from "@mui/material";
import CreateClientForm from "./create-client-form";
import { createClient } from "./actions";

export default function NewClientPage() {
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
