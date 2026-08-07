"use client";

import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

type ModalCloseButtonProps = {
  label: string;
};

export default function ModalCloseButton({ label }: ModalCloseButtonProps) {
  const router = useRouter();

  return (
    <Button type="button" variant="outlined" onClick={() => router.back()}>
      {label}
    </Button>
  );
}
