"use client";

import {
  SignInPage,
  type AuthProvider,
  type AuthResponse,
} from "@toolpad/core/SignInPage";

const providers: AuthProvider[] = [
  { id: "github", name: "GitHub" },
  { id: "google", name: "Google" },
];

const signIn = async (provider: AuthProvider): Promise<AuthResponse> => {
  console.log(`Sign in with ${provider.id}`);

  return {
    error: "This is a fake error",
  };
};

export default function SignIn() {
  return <SignInPage providers={providers} signIn={signIn} />;
}
