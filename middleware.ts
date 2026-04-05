import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { isOwnerAdminEmail } from "@/lib/admin-auth";

const protectedPaths = ["/api/admin", "/admin", "/create"];

export default async function middleware(request: NextRequest) {
    const session = await auth();
    const { pathname } = request.nextUrl;
    const isApiRoute = pathname.startsWith("/api/");

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