import { db } from "@/db";
import { clients } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import ModalShell from "@/app/@modal/modal-shell";
import { deleteClient, updateClient } from "@/app/clients/[id]/edit/actions";
import EditClientForm from "@/app/clients/[id]/edit/edit-client-form";

type EditClientModalPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditClientModalPage({
  params,
}: EditClientModalPageProps) {
  const { id } = await params;

  const [client] = await db
    .select({
      id: clients.id,
      name: clients.name,
      acronym: clients.acronym,
    })
    .from(clients)
    .where(and(eq(clients.id, id), isNull(clients.deletedAt)))
    .limit(1);

  if (!client) {
    notFound();
  }

  const updateClientWithId = updateClient.bind(null, id);
  const deleteClientWithId = deleteClient.bind(null, id);

  return (
    <ModalShell title="Edit Client">
      <EditClientForm
        client={client}
        action={updateClientWithId}
        deleteAction={deleteClientWithId}
        cancelLabel="Close"
        cancelMode="back"
      />
    </ModalShell>
  );
}
