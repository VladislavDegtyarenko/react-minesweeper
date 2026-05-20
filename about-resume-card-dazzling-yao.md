# Resume Card and In-Game Progress Persistence

## Context

Social Sprint (3) introduces a route-based intro at `/` with difficulty cards and moves the playable game to `/game`. The original brainstorm proposed a **Resume card** on the intro to one-click back into an in-progress game — but the game currently has **no persisted in-game state**: a refresh wipes the board, the timer, and every revealed/flagged cell.

This plan adds the persistence layer required to make Resume real, and locks down the UX for the three conflict scenarios that arise once a saved game can exist:

1. User opens the intro and clicks a different mode/level instead of Continue.
2. User deep-links to `/game?mode=…&level=…` with params that don't match the saved game.
3. The saved game is stale (Free play older than 24h, or Daily from a previous UTC day).

Note: this plan layers on top of Sprint (3) — it does **not** re-describe the intro routing/audio/onboarding work already covered there. It only adds what's needed for resume.

## Resolved UX decisions

| Question | Decision |
|---|---|
| Intro layout | **Mode tabs (Classic / Daily) + 3 level cards.** Continue banner sits above the tabs when a valid save exists. |
| Saved game + user clicks different mode/level on intro | **Silent discard.** The visible Continue banner is the affordance; clicking past it is intentional. |
| Direct `/game?mode=…&level=…` with params ≠ saved | **URL wins.** Discard save, start fresh per URL. No dialog. |
| Save lifespan | Free: **24h** since last save. Daily: **today's `dailyKey` only**. Stale saves silently discarded. |

## Design

### Snapshot shape

```ts
// src/store/game/snapshot/types.ts (new)
type GameSnapshotV1 = {
  version: 1;
  savedAt: number;                     // Date.now() — for 24h expiry on Free
  mode: 'free' | 'daily';
  level: Level;
  dailyKey?: string;                   // present iff mode === 'daily'
  dailySeedVersion?: number;
  board: TBoard;
  totalFlags: number;
  openedSafeCells: number;
  correctlyFlaggedMines: number;
  gameStatus: 'playing' | 'paused';    // never persist 'won' | 'lost' | 'idle'
  elapsedMs: number;                   // accumulated only — startedAtMs is recomputed on resume
};
```

Key rule: `startedAtMs` uses `performance.now()` (see [src/store/timer/](src/store/timer/)) and is **not survivable across refresh**. On resume, set `elapsedMs` to the persisted value and start a fresh `startedAtMs = performance.now()`.

### Storage key

Reuse the already-declared-but-commented `LOCAL_STORAGE_KEYS.gameBoard` slot in [src/constants/index.ts:4](src/constants/index.ts:4), but rename to `gameSnapshot` for clarity. Read/write via the existing `LocalStorage` helper at [src/utils/localStorage/index.ts](src/utils/localStorage/index.ts) — no new infra needed.

### Save triggers

Use the store's existing `subscribeWithSelector` middleware (already wired in [src/store/game/subscriptions.ts](src/store/game/subscriptions.ts)).

- **Save** (debounced ~300ms) on changes to: `board`, `totalFlags`, `openedSafeCells`, `correctlyFlaggedMines`, `gameStatus`, when status ∈ `{playing, paused}` **and** ≥1 opened cell exists.
- **Clear** immediately on status transition to `won` or `lost`, or on a `startNewGame()` that doesn't originate from a resume.
- **Do not save** during `idle` with an empty board (no point — fresh state).

### Resume eligibility (drives Continue banner visibility)

A snapshot is **resumable** iff all hold:

1. Snapshot exists and `version === 1`.
2. `gameStatus ∈ {playing, paused}`.
3. ≥1 opened cell in `board`.
4. Free play: `Date.now() - savedAt < 24*60*60*1000`.
5. Daily: `dailyKey === getDailyKey()` (reuse [src/utils/daily/seed.ts](src/utils/daily/seed.ts)).

Failing any check → silently delete the snapshot on next read; never show Continue.

### Intro screen Continue banner

Lives in the new intro component (Sprint 3 work). Render above the mode tabs when a resumable snapshot is detected on mount.

```
┌────────────────────────────────────────────────────┐
│ ▶  Continue — Classic · Expert · 3:42 elapsed      │
└────────────────────────────────────────────────────┘
[ Classic ]  [ Daily ]
[ Easy ]  [ Medium ]  [ Expert ]
```

- Click → navigate to `/game` with no params. `/game` mount logic detects the valid snapshot and rehydrates.
- Clicking any level card → discard snapshot, navigate to `/game?mode=<active-tab>&level=<chosen>`. No dialog.

### `/game` mount logic

On mount, in [src/App.tsx](src/App.tsx) (or the client wrapper at [src/app/(game)/client.tsx](src/app/(game)/client.tsx)):

```
params = parse(url.search)        // { mode?, level?, tour? }
snapshot = readSnapshot()         // null if missing/invalid/expired

if (params.mode || params.level):
    if snapshot && snapshotMatches(params, snapshot):
        rehydrate(snapshot)       // URL matches save → resume
    else:
        clearSnapshot()
        startNewGame(params)      // URL wins
elif snapshot:
    rehydrate(snapshot)           // bare /game with valid save → resume
else:
    startNewGame(defaults)        // current behavior, uses loadPreferredGameMode()

if (params.tour === '1') startTour()  // independent of resume logic
```

`snapshotMatches` compares `mode`, `level`, and (for daily) `dailyKey`. The `tour=1` param does **not** participate in URL-wins — replaying the tutorial must never discard an in-progress game.

### Mid-game switching (already works — preserve)

The existing [LevelChangeDialog](src/components/Game/components/LevelChangeDialog/index.tsx) flow via `requestLevelChange()` / `requestModeChange()` ([src/store/game/actions.ts](src/store/game/actions.ts)) stays untouched. When the user confirms a mid-game switch, the new `startNewGame()` call clears the snapshot as part of its normal flow (see Save triggers above).

## Files to add / modify

**New**
- `src/store/game/snapshot/types.ts` — `GameSnapshotV1` type
- `src/store/game/snapshot/index.ts` — `readSnapshot()`, `writeSnapshot()`, `clearSnapshot()`, `isResumable()`, `snapshotMatches()`
- `src/store/game/snapshot/subscribe.ts` — debounced save subscription (wired from `subscriptions.ts`)

**Modify**
- [src/constants/index.ts:4](src/constants/index.ts:4) — replace commented `gameBoard` with active `gameSnapshot` key
- [src/store/game/subscriptions.ts](src/store/game/subscriptions.ts) — register the snapshot save subscription
- [src/store/game/actions.ts](src/store/game/actions.ts) — `startNewGame()` clears snapshot when not originating from resume; add `resumeFromSnapshot(snapshot)` action that hydrates state + resets `startedAtMs`
- [src/App.tsx](src/App.tsx) or [src/app/(game)/client.tsx](src/app/(game)/client.tsx) — mount-time decision tree above
- Intro page component (created in Sprint 3 work) — Continue banner + silent-discard handling on level-card click

## Verification

1. **Round-trip**: Start Free/Medium, open ~10 cells, flag 2. Refresh `/game`. Game resumes with same board, flags, elapsed time within 1s of pre-refresh value.
2. **Intro Continue banner**: After (1), navigate to `/`. Banner shows "Continue — Classic · Medium · M:SS". Click → lands on `/game`, resumes.
3. **Silent discard from intro**: With save present, click Expert card. No dialog. Lands on `/game?mode=free&level=expert` with a fresh Expert board. Snapshot cleared.
4. **Deep-link URL-wins**: With Free/Medium save, manually open `/game?mode=free&level=easy`. Fresh Easy board, snapshot cleared, no dialog.
5. **Deep-link match resumes**: With Free/Medium save, open `/game?mode=free&level=medium`. Resumes the saved game.
6. **Tour replay preserves save**: With save present, visit `/game?tour=1`. Save is resumed AND tour overlay shows.
7. **Free expiry**: Manually edit `savedAt` in localStorage to 25h ago. Reload `/`. No Continue banner; snapshot cleared on next read.
8. **Daily expiry**: With a Daily save, manually set `dailyKey` to yesterday's date. Reload `/`. No Continue banner; snapshot cleared.
9. **Won/lost clears**: Complete (or lose) a game. Snapshot is gone in localStorage. Continue banner does not appear on `/`.
10. **Mid-game switch preserves existing UX**: From `/game` with progress, change difficulty in-game → existing LevelChangeDialog still appears and works.
11. **Build**: `npx tsc --noEmit` and `npm run build` clean.

## Out of scope (deliberately deferred)

- **Keyboard / gamepad navigation of intro and game.** Filed as a future task per user request.
- **Multi-slot saves** (e.g., one Free + one Daily concurrent). Current design holds a single snapshot; switching mode/level discards. Revisit if telemetry shows users wanting both.
- **Toast-with-undo on silent discard.** Skipped per chosen "Silent discard" option; reconsider if discard-regret feedback surfaces.
- **Cross-device save sync.** Local-only.
