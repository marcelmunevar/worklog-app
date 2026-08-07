import ModalShell from "@/app/@modal/modal-shell";
import { createClient } from "@/app/clients/new/actions";
import CreateClientForm from "@/app/clients/new/create-client-form";

export default function NewClientModalPage() {
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
