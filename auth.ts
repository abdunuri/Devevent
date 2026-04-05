import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID ?? process.env.GITHUB_ID ?? "",
            clientSecret: process.env.AUTH_GITHUB_SECRET ?? process.env.GITHUB_SECRET ?? "",
        }),
    ],
});