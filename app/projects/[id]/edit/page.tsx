import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateProject } from "./actions";
import EditProjectForm from "./edit-project-form";

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
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
    <main className="mx-auto w-full max-w-2xl p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Edit Project</h1>
      <div className="rounded-xl border border-(--border) bg-(--surface) p-6">
        <EditProjectForm project={project} action={updateProjectWithId} />
      </div>
    </main>
  );
}
