import ROUTES from '@/config/routes.json';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/supabase/env';

const HIDDEN_ROUTES: string[] = [ROUTES.BLOG];

const PROTECTED_ROUTES: string[] = [ROUTES.ACCOUNT];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (HIDDEN_ROUTES.includes(pathname)) {
    const url = new URL('/', request.url);

    return NextResponse.redirect(url);
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && PROTECTED_ROUTES.includes(pathname)) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);

    return NextResponse.redirect(loginUrl);
  }

  return response;
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg)$).*)',
  ],
};
