'use server';
import { signIn, signOut } from "@/auth";

type AuthProvider = "github" | "google";

export const logIn = async (provider: AuthProvider) => {
    await signIn(provider, { redirectTo: "/" });
}

export const logInWithGitHub = async () => {
    await signIn("github", { redirectTo: "/" });
}

export const logInWithGoogle = async () => {
    await signIn("google", { redirectTo: "/" });
}

export const logOut = async () => {
    await signOut({redirectTo: '/'});
}