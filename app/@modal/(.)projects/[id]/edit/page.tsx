import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ModalShell from "@/app/@modal/modal-shell";
import { updateProject } from "@/app/projects/[id]/edit/actions";
import EditProjectForm from "@/app/projects/[id]/edit/edit-project-form";

type EditProjectModalPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectModalPage({
  params,
}: EditProjectModalPageProps) {
  const { id } = await params;

  const [project] = await db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      description: projects.description,
    })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  if (!project) {
    notFound();
  }

  const updateProjectWithId = updateProject.bind(null, id);

  return (
    <ModalShell title="Edit Project">
      <EditProjectForm
        project={project}
        action={updateProjectWithId}
        cancelLabel="Close"
        cancelMode="back"
      />
    </ModalShell>
  );
}
