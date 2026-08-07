import CreateProjectForm from "./create-project-form";
import { createProject } from "./actions";

export default function NewProjectPage() {
  return (
    <main className="mx-auto w-full max-w-2xl p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">New Project</h1>
      <div className="rounded-xl border border-(--border) bg-(--surface) p-6">
        <CreateProjectForm action={createProject} />
      </div>
    </main>
  );
}
