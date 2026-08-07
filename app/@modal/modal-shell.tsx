"use client";

import { Box, Modal, Paper, Typography } from "@mui/material";
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
    <Modal
      open
      onClose={() => router.back()}
      aria-labelledby="modal-title"
      aria-describedby="modal-content"
    >
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper sx={{ width: "100%", maxWidth: 720, p: 3 }}>
          <Typography
            id="modal-title"
            variant="h5"
            component="h2"
            sx={{ mb: 2 }}
          >
            {title}
          </Typography>
          <Box id="modal-content">{children}</Box>
        </Paper>
      </Box>
    </Modal>
  );
}
