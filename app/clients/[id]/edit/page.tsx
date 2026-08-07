import { db } from "@/db";
import { clients } from "@/db/schema";
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
    <main className="mx-auto w-full max-w-2xl p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Edit Client</h1>
      <div className="rounded-xl border border-(--border) bg-(--surface) p-6">
        <EditClientForm client={client} action={updateClientWithId} />
      </div>
    </main>
  );
}
