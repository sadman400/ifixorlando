import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  if (request.auth) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);

  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: [
    "/((?!api/auth|api/webhook|login|_next/static|_next/image|_next/webpack-hmr|favicon.ico|manifest.json|sw.js|icons|.*\\..*).*)",
  ],
};
