'use client';
import { logIn } from "@/lib/actions/auth";
export const SignInButton = () => {
  return (
    <button
      type='button'
      id='signin-btn'
      className="inline-flex items-center justify-center rounded-full border border-primary/35 bg-primary/15 px-6 py-3 text-sm font-semibold text-primary transition-all duration-200 hover:border-primary/60 hover:bg-primary/25"
      onClick={() => logIn()}
    >
      Sign in with GitHub
    </button>
  );
};
