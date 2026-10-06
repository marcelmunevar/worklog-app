import ModalShell from "@/app/@modal/modal-shell";
import { requireWorklogId } from "@/lib/worklog-access";
import { createClient } from "@/app/clients/new/actions";
import CreateClientForm from "@/app/clients/new/create-client-form";

export const dynamic = "force-dynamic";

export default async function NewClientModalPage() {
  await requireWorklogId();

  return (
    <ModalShell title="New Client">
      <CreateClientForm
        action={createClient}
        cancelLabel="Close"
        cancelMode="back"
      />
    </ModalShell>
  );
}
