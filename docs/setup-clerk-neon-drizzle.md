# First-time Clerk + Neon + Drizzle setup

This guide walks you through bringing the auth + database stack online from
scratch on a fresh machine. All the application code is already wired up; what
follows is the manual configuration that has to happen outside the repo
(creating accounts, copying keys, applying the schema).

If you've already deployed once and just need to refresh `.env.local`, skip to
[Local environment file](#local-environment-file).

## How the pieces fit together

- **Clerk** owns user identity: sign-up, sign-in, email verification, password
  reset, sessions, avatar uploads, and the `<UserProfile />` editor. Free SMTP
  is included; no email provider needed.
- **Neon** is the Postgres database where `best_scores` rows live. Free tier
  auto-suspends compute after ~5 minutes of idle (cold start ~500 ms) but does
  **not** pause the project itself.
- **Drizzle** is a TypeScript ORM that runs locally. `drizzle-orm` ships in the
  built app for runtime queries; `drizzle-kit` is a CLI used from your laptop
  to push the schema into Neon. There is no Drizzle account to create.
- **Vercel** hosts the running app. See [`vercel-integration.md`](./vercel-integration.md)
  for the deploy-side details.

The data flow on the leaderboard:

```
Clerk (user identity) ──► clerkClient().users.getUserList()
                                                          ╲
                                                           ╲ joined in src/utils/db/queries/leaderboard.ts
                                                           ╱
Neon (best_scores rows) ──► Drizzle queries via @neondatabase/serverless
```

## Prerequisites

- Node.js 20.6+ (required for the `--env-file` flag used by the `db:*` scripts).
- Repo cloned, `npm install` run.
- A modern browser for the Clerk and Neon dashboards.

## Part 1 — Clerk

### 1.1 Create the application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and sign up.
2. **Create application**.
3. Name it (e.g. `Minesweeper Dev`).
4. Under sign-in identifiers, enable **Email address** + **Password**.
   Skip social providers for now — they can be toggled on later from
   **User & authentication → Social connections** with no code changes.
5. **Create application**.

### 1.2 Enable username

The leaderboard renders `entry.username`. If a user has no username we fall
back to the literal string `"Player"` (see `FALLBACK_USERNAME` in
`src/utils/db/queries/leaderboard.ts`), so technically the app works without
this — but every row would say `"Player"`. Turn it on.

In the dashboard, go to **User & authentication → Email, phone, username** and
open the **Username** tab:

- **Sign-up with username** — ON. (This makes username required at sign-up.
  There is no separate "Required" toggle in the new Clerk UI.)
- **Sign-in with username** — ON (recommended). Lets returning users log in
  with email _or_ username.
- Min/max length: leave at 4 / 64.
- **Allow special characters** — Off. Keeps usernames URL-safe.

While in the same panel, verify:

- **Email** tab: _Sign-up with email_, _Verify at sign-up_, _Sign-in with
  email_ are all ON.
- **Password** tab: enabled and required.

### 1.3 Configure paths (Developers → Paths)

This screen is being deprecated in favor of code-side env vars (which we
already set in [Part 4](#part-4--local-environment-file)), but Clerk still
consults dashboard values for some redirects. Set them as belt-and-suspenders.

| Block                    | Value                                          |
| ------------------------ | ---------------------------------------------- |
| Home URL                 | _(blank)_                                      |
| Unauthorized sign in URL | _(blank)_                                      |
| `<SignIn />`             | "Sign-in page on development host" → `/login`  |
| `<SignUp />`             | "Sign-up page on development host" → `/signup` |
| Signing Out              | "Page on development host" → `/`               |

**Apply changes**.

### 1.4 Confirm domains (Developers → Domains)

Make sure `http://localhost:3000` is listed for development. When you deploy,
add the Vercel preview/production domains here too.

### 1.5 Copy API keys (Developers → API keys)

Copy both — you'll paste them into `.env.local` in Part 4.

- **Publishable key** → `pk_test_...`
- **Secret key** → `sk_test_...` (click "Show" to reveal)

### 1.6 Do not enable Neon Auth

Clerk is the auth provider. Neon also offers an integrated auth product
(powered by Stack Auth) — leave it disabled. Running both side-by-side would
create two independent user pools that don't talk to each other.

## Part 2 — Neon

### 2.1 Create the project

1. Go to [console.neon.tech](https://console.neon.tech) and sign up.
2. **New Project**.
3. Settings:
   - **Project name**: `minesweeper`.
   - **Postgres version**: default (17).
   - **Region**: pick the same region your Vercel deploy will use. `AWS /
us-east-1` is a safe default if undecided.
   - **Database name**: `neondb` (default).
4. **Create project**.

When the project is ready Neon shows a "Connect your app" panel offering
`npx neonctl@latest init` — **skip it**. That command installs an MCP server
and AI-tooling that we don't need; the migration is already finished.

### 2.2 Copy both connection strings

Drizzle needs _two_ connection strings, and this is the most common place to
trip up.

| Variable                | Type                                | Used by                                   | Why                                                                                 |
| ----------------------- | ----------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------- |
| `DATABASE_URL`          | **Pooled** (hostname has `-pooler`) | The running app                           | Serverless functions share a small pool of real Postgres connections                |
| `DATABASE_URL_UNPOOLED` | **Direct** (no `-pooler`)           | `drizzle-kit push` / `studio` / `migrate` | Migrations need DDL transactions and session features that pooled connections strip |

To grab them:

1. In the project dashboard, open the **Connect** panel (or "Connection
   Details" in the left nav).
2. Make sure database `neondb` and role `neondb_owner` are selected.
3. Stay on the **Connection string** tab.
4. With **Connection pooling** ON, copy the URL → that's `DATABASE_URL`.
5. Toggle **Connection pooling** OFF, copy again → that's
   `DATABASE_URL_UNPOOLED`.
6. Toggle pooling back ON.

The two strings look identical except for the `-pooler` suffix in the
hostname:

```
DATABASE_URL=postgresql://neondb_owner:npg_xxx@ep-cool-name-12345-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_xxx@ep-cool-name-12345.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Part 3 — Drizzle

There is nothing to sign up for. `drizzle-orm` and `drizzle-kit` are already
in `package.json`, and `drizzle.config.ts` already points at
`src/utils/db/schema.ts` and reads `DATABASE_URL_UNPOOLED ?? DATABASE_URL`.

This part will pick up after [Part 4](#part-4--local-environment-file)
provides the connection strings.

## Part 4 — Local environment file

Create `.env.local` at the repo root (it is gitignored — never commit it).
Use `.env.example` as the template. Combining everything from Parts 1 and 2:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Match the Clerk Paths screen and our catch-all routes at /login and /signup.
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Neon
DATABASE_URL=postgresql://...-pooler.../neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://.../neondb?sslmode=require

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Part 5 — Push the schema to Neon

This is the one command that creates real tables in Neon from the TypeScript
schema:

```bash
npm run db:push
```

That script (defined in `package.json`) is `node --env-file=.env.local
node_modules/drizzle-kit/bin.cjs push`. The `--env-file` flag is what makes
`drizzle-kit` see your `.env.local` values; plain `npx drizzle-kit push` does
**not** auto-load them.

Drizzle prints the SQL it intends to run and asks for confirmation:

```
CREATE TYPE "public"."level" AS ENUM('easy', 'medium', 'expert');
CREATE TABLE "best_scores" ( ... );
CREATE UNIQUE INDEX "best_scores_user_level_unique" ON "best_scores" (user_id, level_id);
CREATE INDEX "best_scores_leaderboard_idx" ON "best_scores" (level_id, best_time_ms);

Do you want to push these changes to the database? (y/n)
```

Type `y`. Done.

### Verify

Either:

- `npm run db:studio` — opens [https://local.drizzle.studio](https://local.drizzle.studio).
  `best_scores` should appear in the sidebar.
- Neon dashboard → **SQL Editor** → `SELECT * FROM best_scores;` — should
  return zero rows with no error.

If you see `relation "best_scores" does not exist`, the push didn't run
against the right database. Re-check `DATABASE_URL_UNPOOLED` in `.env.local`.

## Part 6 — End-to-end smoke test

```bash
npm run dev
```

Then in the browser:

1. Click **Sign Up** in the header. Finish the Clerk-hosted form (you'll get
   an email verification code from `noreply@...accounts.dev`).
2. Play and win an Easy game.
3. `npm run db:studio` (in a second terminal) → `best_scores` should now have
   one row with the Clerk `user_id`, `level_id = 'easy'`, your time, and
   timestamps.
4. Visit `/leaderboard` — your username + avatar (from Clerk) joined with
   your time (from Neon).
5. Visit `/account` — `<UserProfile />` lets you change username, email,
   password, and avatar; the right column lists your best scores.
6. From the account page, hit **Delete account**, type your username to
   confirm. The row disappears from `best_scores` and your Clerk account is
   deleted.

If any step fails, the cause is almost always one of:

- typo in `.env.local` (especially missing the `?sslmode=require` on the Neon
  URLs, or the wrong `-pooler` toggle)
- schema not pushed (`npm run db:push` skipped or run against the wrong DB)
- Clerk Paths step (1.3) skipped — buttons redirect to
  `*.accounts.dev/sign-in` instead of `/login`
- Username toggle (1.2) off — leaderboard shows `"Player"` for every row

## Part 7 — Promote to production (Clerk + custom domain)

Do this when you've bought a real domain and are about to launch publicly.
Until then, the dev instance from Part 1 is enough.

### 7.1 Create the production instance

1. In the Clerk dashboard, open the top-left workspace dropdown next to your
   app name. The current label is **Development**.
2. Click **Create production instance**.
3. Pick **"Clone development instance"** (recommended). This copies every
   config decision from dev (Username toggle, Paths, identifiers, Email
   settings, Customization) so you don't have to redo them.
   - The "Usage of premium features will require a plan upgrade" note only
     bites if you've enabled paid features like custom JWT templates or
     SAML SSO. A vanilla email + password + username setup clones for free.
4. **Continue**. The dashboard switches to the new production instance — you
   can confirm by checking the top-left dropdown now reads **Production**.

### 7.2 Add and verify your domain

Production instances are locked to verified domains; they will not mint
sessions for `localhost` or `*.vercel.app`.

1. **Configure → Domains → Add domain**.
2. Enter your apex domain (e.g. `yourdomain.com`). Clerk treats `www.` as a
   separate domain — add it too if you plan to serve there.
3. Clerk shows a list of DNS records to add at your registrar. There will be
   several CNAMEs and a few TXT records, typically:
   - `clerk.yourdomain.com` → CNAME to a Clerk-managed host (Frontend API)
   - `accounts.yourdomain.com` → CNAME (Account Portal)
   - `clk._domainkey.yourdomain.com` → DKIM (email signing)
   - `clkmail.yourdomain.com` → mail return-path
   - SPF record on the apex (Clerk includes its sender in the existing TXT)
4. Add each record at your registrar exactly as Clerk shows it. Common
   gotchas:
   - Keep the **TTL** low (e.g. 300 seconds) during setup so re-checks are
     fast.
   - For the **Host / Name** field, registrars vary: some want
     `clerk.yourdomain.com`, others want just `clerk`. Use the form your
     registrar expects.
   - Do **not** proxy the records through Cloudflare's orange-cloud during
     verification. Set them to "DNS only" / grey-cloud first; you can flip
     them on after verification succeeds (Clerk supports proxied CNAMEs but
     verification is more reliable when direct).
5. Click **Verify** in Clerk. DNS propagation usually takes under 10 minutes
   for a fresh domain, occasionally a few hours. Re-click Verify until each
   row turns green.
6. While in this screen, also add any preview hostnames you want production
   keys to accept (rarely needed — Vercel previews should use the **dev**
   instance, see 7.4).

### 7.3 Re-confirm production-instance settings

Cloning is lossless for most settings, but two are worth double-checking on
the prod instance because they reference your host:

- **Developers → Paths**: confirm the radios still point at your own host
  (`/login`, `/signup`, `/`). The labels say "development host" but they
  apply to whatever host the prod instance runs on.
- **Customization → Emails**: emails will now be sent from
  `noreply@yourdomain.com` (or whatever sender Clerk derives from the DKIM
  record). Send yourself a test verification email after DNS verifies and
  confirm the sender address looks correct.

### 7.4 Copy production keys to Vercel

Production keys must live only in Vercel's **Production** environment
scope. Preview deploys should keep using `pk_test_...` keys so contributors
can sign up and tear down test accounts freely.

1. Clerk → **Developers → API keys** (on the production instance — confirm
   the dropdown still says "Production").
2. Copy `pk_live_...` and `sk_live_...`.
3. In **Vercel → Project Settings → Environment Variables**, set the
   following with **Environment** restricted to **Production** only:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...`
   - `CLERK_SECRET_KEY=sk_live_...`
   - `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`
4. Add the same Clerk variables again with **Environment = Preview** and
   the values set to your **dev** instance's `pk_test_...` / `sk_test_...`.
   Vercel serves the right pair automatically based on which deployment is
   running.

The remaining vars (`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `..._SIGN_UP_URL`,
`..._FALLBACK_REDIRECT_URL` ×2, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`)
can be set with **Environment = All** because they don't differ between
preview and production for this project.

### 7.5 Point the domain at Vercel

Independent of Clerk's DNS, your apex/`www` records still need to point at
Vercel itself. In **Vercel → Project Settings → Domains**:

1. Add `yourdomain.com` and `www.yourdomain.com`.
2. Vercel shows the records to add at your registrar (typically an `A`
   record for the apex and a `CNAME` for `www`).
3. These coexist with the Clerk records from 7.2 — they're for different
   subdomains, no conflict.

### 7.6 Smoke-test production

After DNS for both Clerk subdomains and the Vercel apex/www records is
verified:

1. Visit `https://yourdomain.com/signup`. The form should render at your
   own URL (not `*.accounts.dev`).
2. Sign up. The verification email should come from
   `noreply@yourdomain.com`.
3. Win a game while signed in. Check Drizzle Studio (or Neon SQL editor)
   that a `best_scores` row was created against the **production** Neon
   database.
4. Visit `/leaderboard` and `/account` — same flow as Part 6 but on the
   real domain.

If verification email never arrives, the most common cause is the DKIM
record (`clk._domainkey`) not propagating yet — wait, then re-test. If
sign-up itself errors out with a CORS-like message, the domain isn't fully
verified in Clerk yet.

### Optional: separate Neon for production

For an MVP it's fine to share one Neon project across dev, preview, and
production (you're already doing this). Once you have real users you may
want to split:

- **Cheapest**: create a `production` and `dev` branch in the same Neon
  project (free-tier allows 10 branches). Point Vercel **Production** at
  the `production` branch URLs and `.env.local` at `dev`.
- **Strongest isolation**: create a second Neon project entirely for
  production. Different connection strings, different storage quotas,
  different audit trails.

Either way, repeat `npm run db:push` against the new branch/project to
create the `best_scores` table there before sending traffic at it.

## Reference: drizzle commands

| Command               | Purpose                                                    | When                                                                                                          |
| --------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm run db:push`     | Sync `schema.ts` → Neon directly. No migration files.      | Prototype phase (now). Run any time you edit `schema.ts`.                                                     |
| `npm run db:studio`   | Local web UI for browsing data.                            | Whenever you want to look at rows.                                                                            |
| `npm run db:generate` | Generate versioned `.sql` migration files into `drizzle/`. | Switch to this once you have real users. Then commit the generated files and run `drizzle-kit migrate` in CI. |

For the current state (one schema, no real users), `db:push` is the right
tool. There's no need for the `drizzle/` migrations folder yet.

## Reference: future social auth

When you want to add Google / GitHub / etc., go to **Clerk → User &
authentication → Social connections** and toggle the providers on. Our
`<SignIn />` / `<SignUp />` components automatically render the new buttons
and `clerkClient().users.getUserList()` keeps returning the same
`username`/`imageUrl` shape, so no code changes are required.

## Reference: next steps for production

When promoting beyond local dev:

1. **Clerk** — create a separate **Production instance** from the dashboard's
   top-left dropdown. It has its own `pk_live_...` / `sk_live_...` keys and
   its own configured domains; redo the steps in 1.2–1.5 there.
2. **Neon** — either share the existing project across Vercel environments
   (simplest) or create a second project for production isolation. The
   Neon ↔ Vercel marketplace integration can also auto-create a fresh Neon
   branch for every preview PR.
3. **Drizzle** — switch from `db:push` to versioned migrations:
   ```bash
   npm run db:generate     # writes ./drizzle/*.sql
   git add drizzle/        # commit the generated SQL
   ```
   Apply with `npx drizzle-kit migrate` in a deploy step or one-off command.
4. **Vercel** — see [`vercel-integration.md`](./vercel-integration.md) for the
   deploy-side env var checklist (the same nine variables from `.env.local`).
