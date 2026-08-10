import {
  SignInPage,
  type AuthProvider,
  type AuthResponse,
} from "@toolpad/core/SignInPage";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";

const providers: AuthProvider[] = [
  { id: "github", name: "GitHub" },
  { id: "google", name: "Google" },
];

export default function SignIn() {
  return (
    <SignInPage
      providers={providers}
      signIn={async (
        provider: AuthProvider,
        formData: FormData,
        callbackUrl?: string,
      ): Promise<AuthResponse> => {
        "use server";

        try {
          await signIn(provider.id, {
            redirectTo: callbackUrl ?? "/",
          });

          return {};
        } catch (error) {
          if (error instanceof AuthError) {
            return {
              error: "Unable to sign in.",
              type: error.type,
            };
          }

          throw error;
        }
      }}
    />
  );
}
