import Link from "next/link";

type ProjectOption = {
  id: string;
  name: string;
};

type EntryData = {
  projectId: string;
  title: string;
  workDate: string;
  description: string | null;
};

type EditEntryFormProps = {
  entry: EntryData;
  projects: ProjectOption[];
  action: (formData: FormData) => void | Promise<void>;
  cancelHref?: string;
  cancelLabel?: string;
};

export default function EditEntryForm({
  entry,
  projects,
  action,
  cancelHref = "/",
  cancelLabel = "Cancel",
}: EditEntryFormProps) {
  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="projectId" className="block text-sm font-medium">
          Project
        </label>
        <select
          id="projectId"
          name="projectId"
          defaultValue={entry.projectId}
          required
          className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={entry.title}
          required
          className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="workDate" className="block text-sm font-medium">
          Date
        </label>
        <input
          id="workDate"
          name="workDate"
          type="date"
          defaultValue={entry.workDate}
          required
          className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={entry.description ?? ""}
          rows={5}
          className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
        >
          Save changes
        </button>
        <Link
          href={cancelHref}
          className="rounded-md border border-(--border) px-4 py-2 text-sm font-medium hover:bg-(--surface-muted)"
        >
          {cancelLabel}
        </Link>
      </div>
    </form>
  );
}
