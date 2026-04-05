'use client';
import { usePostHog } from "posthog-js/react";
import { logOut } from "@/lib/actions/auth";

type SignOutButtonProps = {
  className?: string;
};

export const SignOutButton = ({ className }: SignOutButtonProps) => {
  const posthog = usePostHog();

  const handleSignOut = async () => {
    // Clear analytics identity/session persisted in browser storage.
    posthog?.reset();
    await logOut();
  };

  return (
    <form action={handleSignOut}>
      <button
        className={
          className ??
          "rounded-full bg-primary px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-primary/80"
        }
        type="submit"
      >
        Sign Out
      </button>
    </form>
  );
};
