import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { isOwnerAdminEmail } from "@/lib/admin-auth";

const protectedPaths = ["/api/admin", "/admin", "/create"];

function hostFromUrl(value: string | null): string | null {
    if (!value) {
        return null;
    }

    try {
        return new URL(value).host.toLowerCase();
    } catch {
        return null;
    }
}

function buildAllowedHosts(request: NextRequest): Set<string> {
    const hosts = new Set<string>();

    hosts.add("localhost:3000");
    hosts.add("127.0.0.1:3000");
    hosts.add(request.nextUrl.host.toLowerCase());

    const baseUrlHost = hostFromUrl(process.env.NEXT_PUBLIC_BASE_URL ?? null);
    if (baseUrlHost) {
        hosts.add(baseUrlHost);
    }

    const authUrlHost = hostFromUrl(process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? null);
    if (authUrlHost) {
        hosts.add(authUrlHost);
    }

    const vercelUrl = process.env.VERCEL_URL?.trim().toLowerCase();
    if (vercelUrl) {
        hosts.add(vercelUrl.replace(/^https?:\/\//, ""));
    }

    return hosts;
}

function isApiRequestFromAllowedOrigin(request: NextRequest): boolean {
    const allowedHosts = buildAllowedHosts(request);
    const hostHeader = request.headers.get("host")?.toLowerCase() ?? "";
    if (!hostHeader || !allowedHosts.has(hostHeader)) {
        return false;
    }

    const originHost = hostFromUrl(request.headers.get("origin"));
    if (originHost && !allowedHosts.has(originHost)) {
        return false;
    }

    const refererHost = hostFromUrl(request.headers.get("referer"));
    if (refererHost && !allowedHosts.has(refererHost)) {
        return false;
    }

    return true;
}

export default async function middleware(request: NextRequest) {
    const session = await auth();
    const { pathname } = request.nextUrl;
    const isApiRoute = pathname.startsWith("/api/");
    const isAuthApiRoute = pathname.startsWith("/api/auth/");

    if (isApiRoute && !isAuthApiRoute && !isApiRequestFromAllowedOrigin(request)) {
        return NextResponse.json(
            {
                message: "Forbidden",
                error: "API access is allowed only from this app's authorized origins.",
            },
            { status: 403 }
        );
    }

    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
    const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

    if (isProtected && !session) {
        if (isApiRoute) {
            return NextResponse.json(
                { message: "Unauthorized", error: "You must be signed in." },
                { status: 401 }
            );
        }

        return NextResponse.redirect(new URL("/api/auth/signin", request.url));
    }

    if (isAdminRoute && !isOwnerAdminEmail(session?.user?.email)) {
        if (isApiRoute) {
            return NextResponse.json(
                {
                    message: "Forbidden",
                    error: "Only the owner admin account can access admin endpoints.",
                },
                { status: 403 }
            );
        }

        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}