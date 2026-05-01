import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import ROUTES from '@/config/routes.json';

const HIDDEN_ROUTES: string[] = [ROUTES.BLOG];

const isProtectedRoute = createRouteMatcher([`${ROUTES.ACCOUNT}(.*)`]);

const isHiddenRoute = (pathname: string) => HIDDEN_ROUTES.includes(pathname);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  if (isHiddenRoute(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isProtectedRoute(request)) {
    await auth.protect({
      unauthenticatedUrl: new URL(ROUTES.LOGIN, request.url).toString(),
    });
  }
});

export const config = {
  matcher: [
    /*
     * Skip Next.js internals and all static files. Always run for API routes
     * so Clerk auth is available there too. Mirrors the matcher recommended
     * by Clerk's Next.js quickstart.
     */
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
