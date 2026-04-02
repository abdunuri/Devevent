'use client';
import { logOut } from "@/lib/actions/auth";
export const SignOutButton = () => {
  return (
    <button className="mt-4 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/80 " onClick={() => logOut()}>
      Sign Out
    </button>
  );
};
