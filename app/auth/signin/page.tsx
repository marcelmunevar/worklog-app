"use client";
import * as React from "react";
import { AppProvider } from "@toolpad/core/AppProvider";
import {
  AuthResponse,
  SignInPage,
  type AuthProvider,
} from "@toolpad/core/SignInPage";
import { useTheme } from "@mui/material/styles";

const providers = [
  { id: "github", name: "GitHub" },
  { id: "google", name: "Google" },
  { id: "facebook", name: "Facebook" },
  { id: "twitter", name: "Twitter" },
  { id: "linkedin", name: "LinkedIn" },
];

const signIn: (provider: AuthProvider) => void | Promise<AuthResponse> = async (
  provider,
) => {
  const promise = new Promise<AuthResponse>((resolve) => {
    setTimeout(() => {
      console.log(`Sign in with ${provider.id}`);
      resolve({ error: "This is a fake error" });
    }, 500);
  });
  return promise;
};

export default function OAuthSignInPage() {
  const theme = useTheme();
  return (
    <AppProvider theme={theme}>
      <SignInPage signIn={signIn} providers={providers} />
    </AppProvider>
  );
}
