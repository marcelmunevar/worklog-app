"use client";

import Typography from "@mui/material/Typography";

export function SignInSubtitle() {
  return (
    <Typography
      variant="body2"
      color="textSecondary"
      gutterBottom
      sx={{ textAlign: "center" }}
    >
      Welcome, please sign in to continue
    </Typography>
  );
}
