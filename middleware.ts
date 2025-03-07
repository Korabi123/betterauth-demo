import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth";
import { PUBLIC_ROUTES } from "./routes";

const publicRoutes = PUBLIC_ROUTES;

export async function middleware(req: Request) {
  const session = getSessionCookie(req);

  if (publicRoutes.includes(new URL(req.url).pathname)) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(req.url)}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|login|sign-up|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
