"use client";

import { useRouter } from "next/navigation";

type ModalCloseButtonProps = {
  label: string;
};

export default function ModalCloseButton({ label }: ModalCloseButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="rounded-md border border-(--border) px-4 py-2 text-sm font-medium hover:bg-(--surface-muted)"
    >
      {label}
    </button>
  );
}
