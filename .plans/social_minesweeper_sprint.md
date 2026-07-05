# Casual Minesweeper Social Sprint

## Summary

This sprint turns the current Minesweeper MVP into a stronger casual, social,
return-friendly web game. The focus is daily play, streaks, sharing,
onboarding, theming, PWA install/offline behavior, expanded personal stats,
and a small bundle of credibility fixes.

This sprint keeps the leaderboard in Trust MVP mode for now. It should still
validate obvious bad score writes, but it does not introduce server-issued
ranked seeds, move logs, replays, or full anti-cheat.

## Goals

- Make casual players want to come back tomorrow.
- Make winning easy to share.
- Improve first-session understanding without forcing players to read the
  full how-to page.
- Add table-stakes app polish: themes, installability, offline shell, and
  better feedback when account sync fails.
- Keep the work sized for a focused social sprint instead of mixing in expert
  competitive Minesweeper features.

## Sprint Backlog

### 1. Bug and credibility fixes

Combine small credibility issues into one ticket:

- Prevent pause overlay scroll and paused board interactions.
- Remove `console.log('presentation: ', presentation)` from `WinOverlay`.
- Surface account score sync failures in the win dialog with retry.
- Fix Open Graph copy that mentions unsupported custom grid sizes.
- Add `/leaderboard` to public sitemap pages.
- Highlight the signed-in user's leaderboard row.
- Validate score save inputs and only save better best scores.
- Fix the broken lint command under Next 16.
- Re-check the production build hang seen during planning.

### 2. Daily Challenge and streaks

Add a Wordle-style daily loop:

- Deterministic daily board seed by UTC date and level.
- Daily mode in game state, with daily badge and homepage/game banner.
- Guest daily history and streaks in local storage.
- Signed-in daily attempts in a `daily_attempts` table.
- Server-side streak recomputation for signed-in users.
- One attempt per difficulty per UTC day.
- Explicitly defer custom-shaped boards and daily leaderboard.

### 3. Intro screen and first-time onboarding

Improve first-run experience:

- Intro/level selection screen with level cards.
- Animated board previews that show basic play.
- First user click/tap unlocks audio safely.
- First-time onboarding dialog gated by `ONBOARDING_SEEN_V1`.
- Onboarding cards explain dig, flag, number clues, and Daily Challenge.

### 4. Theme system

Add light, dark, and system theme support:

- Add a persisted `theme` setting.
- Set `data-theme` on the document.
- Convert used colors to CSS custom properties.
- Add a theme toggle in Settings.
- Update theme-color metadata.
- Keep current icon/theme asset paths for now.

### 5. Personal stats expansion

Build visible progression:

- Track wins and losses by level.
- Track win rate, current streak, best streak, and recent games.
- Persist guest stats in local storage.
- Mirror signed-in stats to a `user_stats` row.
- Render expanded stats on the account page.
- Add a compact stats strip in the win dialog.

### 6. PWA install and offline play

Make the game feel app-like:

- Add a web app manifest.
- Add app icons if missing.
- Add a service worker or equivalent Next-compatible PWA setup.
- Cache game shell, static pages, sounds, icons, and app assets.
- Keep auth and DB-backed pages network-first.
- Add an install button in Settings using `beforeinstallprompt`.

### 7. Cookie disclosure and Plausible analytics

Add privacy-first measurement only if still wanted for this sprint:

- Add Plausible with no user identifiers.
- Track only key product events: daily started, completed, shared, PWA
  installed, and theme changed.
- Add transparent functional-cookie disclosure for Clerk auth cookies.
- Update privacy and terms pages and bump legal dates when this ships.

## Out Of Scope

- Chording and advanced expert controls.
- 3BV, 3BV/s, no-guess solver, and replay format.
- Custom boards and shaped boards.
- Full anti-cheat/HMAC ranked proof.
- Gamepad support.
- Full keyboard grid navigation.
- Internationalization.
- Full achievements gallery.
- Ads or monetization.

## Verification

- `tsc --noEmit` passes.
- Lint command works after the Next 16 tooling fix.
- Production build completes.
- Guest and signed-in daily flows work.
- Account stats and guest stats persist.
- Theme persists and respects system mode.
- PWA install button appears only when installable.
- Offline game shell works without breaking auth/DB pages.
- Legal pages are reviewed and dated for analytics, cookies, local storage,
  DB schema, or other user-data handling changes.

## Notion Task Mapping

Tracker data source:
`collection://2f9ca616-0f2b-80b5-b22e-000b20e5fc56`

Every sprint task should use `Status = Not started`.

- `Social Sprint: Bug and credibility fixes`
- `Social Sprint: Daily Challenge and streaks`
- `Social Sprint: Intro screen and first-time onboarding`
- `Social Sprint: Theme system`
- `Social Sprint: Personal stats expansion`
- `Social Sprint: PWA install and offline play`
- `Social Sprint: Cookie disclosure and Plausible analytics`

Existing completed baseline tickets to leave done:

- `Settings`
- `Share`
- `Win Screen`
- `How-to`
- `Stats Store + Best Times`

Merged/superseded duplicate:

- `Disable cell interactions while game is paused`
