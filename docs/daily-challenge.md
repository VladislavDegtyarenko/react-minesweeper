# Daily Challenge

This document describes how daily challenges work in the current app:
how a daily board is generated, how the first counted attempt is recorded,
how guests and signed-in users differ, and which files own each part of the
feature.

For the high-level mode comparison, see [Game Modes](./game-modes.md). For
the random-board mode, see [Free Play](./free-play.md).

## User-facing behavior

- Daily mode is selected from the game mode toggle. Free Play remains the
  normal random-board mode.
- Switching into or out of Daily mode while a game is playing or paused opens
  the shared reset confirmation dialog before the board is replaced.
- A daily challenge is scoped to a UTC date and a difficulty. The same
  `dailyKey`, difficulty, and seed version produce the same mine layout for
  every player.
- The first completed run for a given `(UTC day, difficulty)` is the counted
  daily attempt. A completion can be either `won` or `lost`.
- Any replay after a counted result exists for that same day and difficulty is
  practice. Practice runs can be played and shared as practice, but they do not
  overwrite the original result or change streaks.
- Daily mode does not use free-play first-click protection. If the first opened
  cell is a mine in daily mode, the player loses immediately.
- Streaks are based on distinct UTC days where the player won at least one
  counted daily attempt across any difficulty.
- `/leaderboard?view=daily` shows signed-in public daily winners for today and
  a separate current-streak leaderboard. Daily losses are private.
- `/account` shows signed-in users their daily streaks, today's per-level
  daily status, and recent counted daily attempts.

## Guest vs signed-in behavior

| Area | Guest user | Signed-in user |
| --- | --- | --- |
| Identity | Browser-local only | Clerk account user |
| Primary daily storage | `localStorage` key `DAILY_HISTORY` | Neon table `daily_attempts` |
| Local copy | Stored in `guestHistory` and used as active `history` | Also stores a local `guestHistory` copy after attempts sync |
| Load path | `setDailySignedIn(false)` loads local history | `setDailySignedIn(true)` calls `getMyDailyState()` |
| Counted attempt rule | Client `upsertEntry()` preserves the first local entry | Client preserves first entry, server unique index enforces first-write-wins |
| Sync | No network sync | Optimistic local update, then `saveDailyAttempt()` syncs to the account |
| Sync failure | Not applicable | Failed attempt is kept in `pendingSyncAttempt` and can be retried |
| Streak source | Computed from local daily history | Loaded and reconciled from server-derived attempts |
| Daily leaderboard | Not available; guest data is local only | Public wins and streaks can appear after a username is set |
| Account daily stats | Not available on `/account` | Shows streaks, today's status, and recent wins/losses |
| Cross-device continuity | No | Yes, after account state loads |
| Account deletion | User can clear browser data | Account deletion also deletes rows from `daily_attempts` |

## Main files

| Path | Responsibility |
| --- | --- |
| `src/components/Game/components/ModeToggle/index.tsx` | Requests Free Play and Daily mode changes. |
| `src/components/Game/components/LevelChangeDialog/index.tsx` | Confirms mode switches while a game is playing or paused. |
| `src/store/game/store.ts` | Stores `mode`, `dailyKey`, and `dailySeedVersion`; builds the initial daily board when preferred mode is daily. |
| `src/store/game/actions.ts` | Requests mode changes, enters daily mode, exits daily mode, and resets boards for the current mode. |
| `src/utils/daily/seed.ts` | Builds UTC daily keys and deterministic numeric seeds. |
| `src/utils/daily/board.ts` | Generates the deterministic daily board from date, difficulty, and seed version. |
| `src/utils/init.ts` | Places mines with a partial Fisher-Yates shuffle and fills number cells. |
| `src/utils/board/index.ts` | Handles cell opens, marker toggles, win/loss state, and free-play-only first-click protection. |
| `src/store/daily/store.ts` | Owns daily client state: history, streak, source, active run kind, sync flags, and pending retry input. |
| `src/store/daily/actions.ts` | Loads account/guest state, classifies runs, records counted attempts, syncs account attempts, and retries failed sync. |
| `src/store/daily/subscriptions.ts` | Watches game status transitions and records only counted daily completions. |
| `src/store/daily/utils/storage.ts` | Reads/writes guest daily history and preserves first-write-wins locally. |
| `src/utils/daily/streaks.ts` | Computes current and best streaks from winning daily days. |
| `src/app/(game)/actions.ts` | Server actions for loading and saving account daily state. |
| `src/utils/db/schema.ts` | Defines `daily_attempts`, including the unique `(user_id, level_id, daily_key)` index. |
| `src/utils/db/queries/dailyAttempts.ts` | Inserts account attempts, fetches attempts, deletes attempts, and computes server streak summaries. |
| `src/utils/db/queries/leaderboard.ts` | Fetches public free-play rankings, today's daily winners, and daily streak rankings. |
| `src/components/LeaderboardPage/index.tsx` | Renders Free Play and Daily leaderboard tabs. |
| `src/components/AccountPage/components/DailyChallengeStats/index.tsx` | Renders private account daily streaks, today's status, and recent attempts. |
| `src/components/Game/components/DailyCard/index.tsx` | Shows daily date, result/practice/sync status, streaks, retry button, and reset countdown. |
| `src/components/Game/components/WinOverlay/hooks/useWinOverlay.ts` | Chooses daily vs practice win copy, share payloads, and daily sync retry state. |
| `src/components/Game/components/WinOverlay/utils/share.ts` | Builds daily, practice, and free-play share payloads. |
| `src/components/ClerkAuthBridge/index.tsx` | Calls daily account loading when Clerk auth state changes. |

## Data flow

### Startup and auth

```text
App.tsx
  imports '@/store/daily'
    -> initSubscriptions()
    -> initDailyDateListener()

ClerkAuthBridge
  -> setDailySignedIn(isSignedIn)
    -> guest: load DAILY_HISTORY from localStorage
    -> account: getMyDailyState()
      -> getMyDailyAttempts()
      -> getMyDailyStreakSummary()
```

`initDailyDateListener()` keeps `todayKey` aligned with UTC midnight by
refreshing on tab visibility changes and every 60 seconds while the app is
open.

### Entering daily mode

```text
ModeToggle
  -> requestModeChange('daily')
    -> if active game: LevelChangeDialog confirmation
    -> enterDailyMode()
      -> getDailyKey()
      -> resetBoard()
        -> generateDailyBoard({ dailyKey, level })
        -> game state: mode='daily', dailyKey, dailySeedVersion
```

Changing difficulty or starting a new daily game regenerates the board from
the same UTC daily inputs. Restarting in daily mode also rebuilds the same
daily board with cells closed. Switching back to Free Play follows the same
confirmation path when the current Daily game is active.

### Classifying an attempt vs practice

```text
gameStatus: idle -> playing
  -> classifyDailyRun(level.id)
    -> if history[todayKey::levelId] exists: activeRunKind='practice'
    -> otherwise: activeRunKind='attempt'
```

The classification is stored in `activeRunKind` for the lifetime of the run.
That prevents the win dialog from treating the first counted win as practice
after the history updates.

### Completing a daily run

```text
gameStatus: won/lost
  -> daily subscription checks mode='daily'
  -> if activeRunKind='practice': stop, do not record
  -> if activeRunKind='attempt': recordDailyAttempt()
    -> recordLocalAttempt()
      -> persist guestHistory to localStorage
      -> update active history and local streak optimistically
    -> if source='account': syncAccountAttempt()
      -> saveDailyAttempt()
      -> recordDailyAttempt() database query
      -> getMyDailyStreakSummary()
      -> reconcile local history/streak from server response
```

If account sync fails, the client keeps the counted attempt in
`pendingSyncAttempt`, shows sync failure UI, and lets the user retry through
`retryDailyAttemptSync()`.

### Win and share UI

```text
daily counted win
  -> title: Daily Cleared
  -> shows daily streak
  -> enables normal result sharing

daily practice win
  -> title: Practice Cleared
  -> shows practice result
  -> enables practice result sharing

free-play win
  -> normal best-time and leaderboard sync behavior
```

Daily wins still create a transient `lastWinSummary` through the stats store so
the win dialog can display time and share controls. They do not update the
free-play best-score table or leaderboard.

### Leaderboard and account views

```text
/leaderboard
  -> default view: Free Play best-time leaderboard
  -> ?view=daily: today's daily winners + current streak leaderboard

/account
  -> getUserDailyAttempts()
  -> getMyDailyStreakSummary()
  -> DailyChallengeStats
```

The public Daily leaderboard is account-only because guest attempts are stored
only in browser local storage. Daily winner rows are wins only and are ordered
by elapsed time. The Daily Streaks panel ranks public users by current streak,
then best streak, then latest win. The account page is private, so its recent
daily attempt list includes both wins and losses.

## Board generation

Daily board generation is deterministic and lives in `src/utils/daily`.

1. `getDailyKey(date)` returns a UTC date string in `YYYY-MM-DD` format.
2. `getDailySeed(dailyKey, levelId, seedVersion)` hashes
   `v{seedVersion}|{dailyKey}|{levelId}` with 32-bit FNV-1a.
3. `createSeededRandom(seed)` creates a deterministic `mulberry32` random
   number generator.
4. `generateDailyBoard()` passes the seeded random source into `initBoard()`.
5. `initBoard()` creates empty cells, places mines with a partial
   Fisher-Yates shuffle, then fills every safe cell with its adjacent mine
   count.

The default daily path does not pass `excludeCell`, so it does not move mines
away from the first clicked cell. The `excludeCell` option still exists in the
board utilities for non-daily first-click protection and for deterministic
utility use.

`DAILY_SEED_VERSION` is the namespace for the deterministic board algorithm.
Bumping it creates a new board for the same date and difficulty, so treat it as
an intentional compatibility change.

## Persistence details

Guest daily history is stored as:

```text
{
  version: DAILY_HISTORY_VERSION,
  entries: {
    "{dailyKey}::{levelId}": DailyHistoryEntry
  }
}
```

Each `DailyHistoryEntry` contains:

```text
dailyKey
levelId
seedVersion
status        // 'won' or 'lost'
elapsedMs
recordedAt
```

Local history is capped at `DAILY_HISTORY_MAX_ENTRIES` entries. Elapsed times
are clamped between `DAILY_MIN_ELAPSED_MS` and `DAILY_MAX_ELAPSED_MS` before
storage and before database writes.

Account attempts are stored in `daily_attempts` with:

```text
user_id
level_id
daily_key
seed_version
status
elapsed_ms
created_at
```

The database unique index on `(user_id, level_id, daily_key)` is the server
source of truth for first-write-wins. Replays and retries can never overwrite
the first stored account result for that user, day, and difficulty.

Public daily leaderboard reads use the same table:

- today's winners filter to `status = 'won'` and the current UTC `daily_key`;
- streak rankings derive current and best streaks from winning daily days;
- users without public usernames are filtered out before rendering.

## Sharing

Daily counted wins, daily practice wins, and free-play wins use the shared win
dialog share flow. Daily share text includes the daily key, difficulty, elapsed
time, and streak when applicable. The share payload does not include board
coordinates or mine locations.
