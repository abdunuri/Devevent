import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

const redirectProxyUrl = process.env.AUTH_REDIRECT_PROXY_URL?.trim().replace(/\/+$/, "");
const shouldIgnoreRedirectProxyUrl =
    redirectProxyUrl === "https://authjs.dev" ||
    redirectProxyUrl === "https://authjs.dev/api/auth";

if (shouldIgnoreRedirectProxyUrl) {
    console.warn(
        "[auth] Ignoring AUTH_REDIRECT_PROXY_URL=https://authjs.dev. Remove this env var in deployment unless you intentionally use Auth.js redirect proxy."
    );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    redirectProxyUrl: shouldIgnoreRedirectProxyUrl ? undefined : redirectProxyUrl,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID ?? process.env.GITHUB_ID ?? "",
            clientSecret: process.env.AUTH_GITHUB_SECRET ?? process.env.GITHUB_SECRET ?? "",
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_ID ?? "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_SECRET ?? "",
        }),
    ],
});