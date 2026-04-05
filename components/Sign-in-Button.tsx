import { logInWithGitHub, logInWithGoogle } from "@/lib/actions/auth";

type ProviderButtonProps = {
  provider: "github" | "google";
  label: string;
};

const providerStyles: Record<ProviderButtonProps["provider"], string> = {
  github:
    "border border-[#2f3542] bg-[#11151d] text-white hover:border-[#49556a] hover:bg-[#181f2a]",
  google:
    "border border-[#2f3542] bg-[#11151d] text-white hover:border-[#49556a] hover:bg-[#181f2a]",
};

const GitHubLogo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
    <path d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.2-3.37-1.2-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.35 1.13 2.92.87.09-.67.35-1.13.63-1.39-2.22-.26-4.55-1.15-4.55-5.11 0-1.13.39-2.05 1.03-2.77-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.06a9.2 9.2 0 0 1 5 0c1.9-1.34 2.74-1.06 2.74-1.06.55 1.42.2 2.47.1 2.73.64.72 1.03 1.64 1.03 2.77 0 3.97-2.34 4.85-4.57 5.11.36.31.67.91.67 1.84 0 1.33-.01 2.41-.01 2.74 0 .27.18.6.69.49A10.29 10.29 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" />
  </svg>
);

const GoogleLogo = () => (
  <svg viewBox="0 0 18 18" aria-hidden="true" className="h-4 w-4">
    <path fill="#EA4335" d="M9 7.2v3.6h5.1c-.23 1.16-.9 2.14-1.9 2.8l3.08 2.39c1.8-1.66 2.84-4.1 2.84-6.99 0-.67-.06-1.3-.18-1.92H9Z" />
    <path fill="#34A853" d="M3.65 10.71 2.96 11.24 0.54 13.12A9 9 0 0 0 9 18c2.43 0 4.47-.8 5.96-2.01l-3.08-2.39c-.85.58-1.93.93-2.88.93-2.34 0-4.32-1.58-5.03-3.71Z" />
    <path fill="#4A90E2" d="M0.54 4.88A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.12l3.11-2.41A5.4 5.4 0 0 1 3.77 9c0-.6.1-1.17.3-1.71L0.54 4.88Z" />
    <path fill="#FBBC05" d="M9 3.58c1.31 0 2.49.45 3.42 1.34l2.57-2.58C13.47.92 11.43 0 9 0A9 9 0 0 0 .54 4.88L4.07 7.3C4.78 5.16 6.66 3.58 9 3.58Z" />
  </svg>
);

const ProviderButton = ({ provider, label }: ProviderButtonProps) => {
  const Logo = provider === "github" ? GitHubLogo : GoogleLogo;
  const signInAction = provider === "github" ? logInWithGitHub : logInWithGoogle;

  return (
    <form action={signInAction}>
      <button
        type='submit'
        id={`signin-btn-${provider}`}
        className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-[0_8px_20px_-12px_rgba(0,0,0,0.8)] transition-all duration-200 ${providerStyles[provider]}`}
      >
        <Logo />
        {label}
      </button>
    </form>
  );
};

export const SignInButton = () => {
  return (
    <div className="flex flex-wrap gap-3">
      <ProviderButton provider="github" label="Sign in with GitHub" />
      <ProviderButton provider="google" label="Sign in with Google" />
    </div>
  );
};
