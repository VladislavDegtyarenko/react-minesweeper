import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🚨 List the paths that should be hidden/inaccessible
const HIDDEN_ROUTES: string[] = [
  "/blog",
  "/how-to",
  "/privacy",
  "/terms-of-service",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (HIDDEN_ROUTES.includes(pathname)) {
    const url = new URL("/", request.url);

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 🌐 Configuration: Define which paths the middleware should run on.
// This is critical for performance—it prevents the middleware from running
// on static assets, internal Next.js files, and API routes (unless needed).
export const config = {
  matcher: [
    /*
     * Match all requests except:
     * - /api (API routes)
     * - /_next/static (static assets)
     * - /_next/image (image optimization files)
     * - /favicon.ico (or any other static files like .png, .jpg)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg)$).*)",
  ],
};
