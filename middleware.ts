import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";

const protectedPaths = ["/api/admin","/api/admin/pending", "/api/admin/pending/","/admin","/admin/","/admin/pending","/admin/pending/","/create"];

export default async function middleware(request: NextRequest) {
    const session = await auth();
    const { pathname } = request.nextUrl;

    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

    if (isProtected && !session) {
        return NextResponse.redirect(new URL("/api/auth/signin", request.url));
    }
    return NextResponse.next();
}