'use client';
import { logIn } from "@/lib/actions/auth";
export const SignInButton = () => {
  return (
    <button className="mt-4 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/80 " onClick={() => logIn()}>
      Sign In
    </button>
  );
};
