# Supabase + Vercel Auth Setup

This app supports:

- localhost development
- Vercel preview deployments
- Vercel production
- future custom domains

## Environment Variables

Set these in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

Recommended values:

- Production:
  - `NEXT_PUBLIC_SITE_URL=https://minesweeper-classix.vercel.app`
- Preview:
  - `NEXT_PUBLIC_SITE_URL=https://minesweeper-classix.vercel.app`
- Development:
  - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

`NEXT_PUBLIC_SITE_URL` is the canonical fallback. Browser auth redirects use the current runtime origin, so preview deployments return to the same preview host.

## Supabase Auth URL Configuration

Set `Authentication -> URL Configuration -> Site URL` to:

```text
https://minesweeper-classix.vercel.app
```

Add redirect URLs for localhost:

```text
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=/account
http://localhost:3000/auth/callback?next=/reset-password
```

Add redirect URLs for current production:

```text
https://minesweeper-classix.vercel.app/auth/callback
https://minesweeper-classix.vercel.app/auth/callback?next=/account
https://minesweeper-classix.vercel.app/auth/callback?next=/reset-password
```

Add a wildcard redirect for Vercel previews. Based on the current preview hostname shape, use one of:

```text
https://*-vladislavdegtyarenkos-projects.vercel.app/**
```

or, if all previews consistently start with the project slug:

```text
https://minesweeper-*-vladislavdegtyarenkos-projects.vercel.app/**
```

## Future Custom Domain

When you add a custom domain:

1. Add the domain in Vercel.
2. Add its auth callback URLs in Supabase.
3. Update production `NEXT_PUBLIC_SITE_URL` to that custom domain only after it is live.
4. Keep `https://minesweeper-classix.vercel.app` in the Supabase allowlist so older links keep working.

Example future custom-domain redirects:

```text
https://your-domain.com/auth/callback
https://your-domain.com/auth/callback?next=/account
https://your-domain.com/auth/callback?next=/reset-password
```

## How Redirects Work in Code

Browser-initiated auth flows use `window.location.origin`:

- sign-up verification email
- password reset email

That means:

- localhost redirects to localhost
- production redirects to production
- each Vercel preview redirects back to itself

Server fallback still uses `NEXT_PUBLIC_SITE_URL`.
