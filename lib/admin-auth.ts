const DEFAULT_OWNER_EMAIL = "abdulaziznuri495@gmail.com";

export function getOwnerAdminEmail(): string {
  return (process.env.OWNER_ADMIN_EMAIL ?? DEFAULT_OWNER_EMAIL).trim().toLowerCase();
}

export function isOwnerAdminEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }

  return email.trim().toLowerCase() === getOwnerAdminEmail();
}
