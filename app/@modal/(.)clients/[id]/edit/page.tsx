import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ModalShell from "@/app/@modal/modal-shell";
import { updateClient } from "@/app/clients/[id]/edit/actions";
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
    .where(eq(clients.id, id))
    .limit(1);

  if (!client) {
    notFound();
  }

  const updateClientWithId = updateClient.bind(null, id);

  return (
    <ModalShell title="Edit Client">
      <EditClientForm
        client={client}
        action={updateClientWithId}
        cancelLabel="Close"
        cancelMode="back"
      />
    </ModalShell>
  );
}
