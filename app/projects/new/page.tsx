import { Container, Paper, Typography } from "@mui/material";
import CreateProjectForm from "./create-project-form";
import { createProject } from "./actions";

export default function NewProjectPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        New Project
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <CreateProjectForm action={createProject} />
      </Paper>
    </Container>
  );
}
