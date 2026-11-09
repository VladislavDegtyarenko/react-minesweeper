# Application and Storybook hosting

The Next.js application runs on [Vercel](https://minesweeper-classix.vercel.app/). Storybook runs separately on [GitHub Pages](https://vladislavdegtyarenko.github.io/react-minesweeper/). Both use this repository's components, but they have different build commands and environment requirements.

## Next.js application on Vercel

Vercel's Git integration builds the application from this repository. The production branch is `main`; feature branches receive preview deployments, which let us check changes before merging.

The application needs a server because account pages resolve signed-in users, score synchronization writes to the database, and leaderboards load stored results. These routes use Clerk for authentication and Neon with Drizzle for database access. GitHub Pages cannot run these server features.

Configure these environment variables in Vercel for each application environment:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `NEXT_PUBLIC_SITE_URL`

`DATABASE_URL` is the pooled connection used by the running application. `DATABASE_URL_UNPOOLED` is the direct connection used for database migrations. `NEXT_PUBLIC_SITE_URL` sets the canonical public site address.

For local application setup, follow [the Clerk, Neon, and Drizzle guide](setup-clerk-neon-drizzle.md). The `dev` and `build` commands check required variables before starting Next.js. Keep credentials in the ignored `.env.local` file; do not copy production secrets into Storybook or GitHub Actions.

`npm run test:e2e` starts the local app and checks its lobby and board interactions. To test a deployed application, run `PLAYWRIGHT_BASE_URL=https://your-preview.example npm run test:e2e` with the actual preview address. The tests then skip the local server. Protected previews also require authorized access.

## Storybook on GitHub Pages

Storybook is a static site: its built HTML, JavaScript, styles, and images can run without an application server. It mounts the selected components directly and substitutes temporary settings in memory. It does not mount the application layout, Clerk, analytics, or database code.

The `.github/workflows/storybook.yml` workflow checks pull requests and `main`. It installs from the npm lockfile, runs lint, TypeScript, unit and component tests, builds Storybook, and checks its static output. Only a successful run on `main` uploads and publishes the Pages artifact. Publication permissions belong only to the deployment job.

Repository **Settings → Pages → Source** must be **GitHub Actions**. The build command is:

```sh
STORYBOOK_BASE_PATH=/react-minesweeper npm run build-storybook
```

The output is `storybook-static/`. `STORYBOOK_BASE_PATH` adjusts the generated site and cell-icon paths for the repository's URL. No Clerk, database, or application environment variables are required. See the [README](../README.md) for local commands, direct examples, and the interview walkthrough.
