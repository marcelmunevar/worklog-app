"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type ModalShellProps = {
  title: string;
  children: React.ReactNode;
};

export default function ModalShell({ title, children }: ModalShellProps) {
  const router = useRouter();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [router]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          router.back();
        }
      }}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-(--border) bg-(--surface) p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-(--border) px-2 py-1 text-sm font-medium hover:bg-(--surface-muted)"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
