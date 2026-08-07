import { db } from "@/db";
import { projects } from "@/db/schema";
import { Paper, Stack, Typography } from "@mui/material";
import { asc } from "drizzle-orm";
import ModalShell from "@/app/@modal/modal-shell";
import ModalCloseButton from "@/app/components/modal-close-button";
import NavButton from "@/app/components/nav-button";
import { createEntry } from "@/app/entries/new/actions";
import CreateEntryForm from "@/app/entries/new/create-entry-form";

export default async function NewEntryModalPage() {
  const allProjects = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .orderBy(asc(projects.name));

  return (
    <ModalShell title="New Entry">
      {allProjects.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">
            You need at least one project before creating an entry.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            <NavButton href="/projects/new" variant="contained">
              Create project
            </NavButton>
            <ModalCloseButton label="Close" />
          </Stack>
        </Paper>
      ) : (
        <CreateEntryForm
          projects={allProjects}
          action={createEntry}
          cancelLabel="Close"
          cancelMode="back"
        />
      )}
    </ModalShell>
  );
}
