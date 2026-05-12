# Free Play

Free Play is the default random-board mode. It is meant for repeatable solo
play, personal best times, and the level-based public leaderboard.

## User-facing Behavior

- The player selects Easy, Medium, or Expert and receives a random board.
- Starting a new game creates a fresh random board for the current difficulty.
- Restarting reopens the same board values with all cells closed.
- A fresh non-restarted Free Play board protects the first click from being a
  mine by regenerating the board with the clicked cell excluded.
- Winning records a best time for the current difficulty when the time improves
  the existing best.
- Losses are not stored as Free Play results.
- Daily Challenge wins never update Free Play best times.

## Guest vs Signed-in Behavior

| Area | Guest user | Signed-in user |
| --- | --- | --- |
| Identity | Browser-local only | Clerk account user |
| Primary storage | `localStorage` key `BEST_TIMES` | Neon table `best_scores` |
| Saved results | Best winning time per difficulty | Best winning time per difficulty |
| Sync | No network sync | `saveBestScore()` writes improved times to the account |
| Sync failure | Not applicable | Win dialog can show sync failure and retry |
| Leaderboard | Can view public rows only | Can appear publicly after setting a nickname |
| Account page | Not available | Shows account best scores |
| Account deletion | User can clear browser data | Deletes account `best_scores` rows |

## Main Files

| Path | Responsibility |
| --- | --- |
| `src/components/Game/components/ModeToggle/index.tsx` | Switches into Free Play through `requestModeChange('free')`. |
| `src/store/game/actions.ts` | Enters Free Play, creates new boards, restarts boards, and confirms active-game switches. |
| `src/store/game/store.ts` | Stores `mode='free'`, board state, active difficulty, and pending confirmations. |
| `src/utils/init.ts` | Generates random boards with `Math.random` and optional first-click exclusion. |
| `src/utils/board/index.ts` | Applies first-click protection, opens cells, toggles markers, and sets win/loss status. |
| `src/store/stats/store.ts` | Owns best times, win dialog state, score source, and sync state. |
| `src/store/stats/actions.ts` | Records guest/account best times and retries account score sync. |
| `src/store/stats/subscriptions.ts` | Records Free Play wins when game status changes to `won`. |
| `src/store/stats/utils/guest.ts` | Reads and writes guest `BEST_TIMES`. |
| `src/app/(game)/actions.ts` | Server actions for loading and saving account best scores. |
| `src/utils/db/queries/bestScores.ts` | Reads, writes, and deletes account best-score rows. |
| `src/components/LeaderboardPage/index.tsx` | Renders the Free Play leaderboard tab by difficulty. |

## Data Flow

```text
ModeToggle
  -> requestModeChange('free')
  -> enterFreeMode()
  -> resetBoard()
  -> initGame(level)
  -> game state: mode='free', dailyKey=null
```

On win:

```text
gameStatus: won
  -> stats subscription
  -> handleCompletedGameWin(level.id, elapsedMs)
    -> guest: recordGuestBestTime()
    -> account: recordAccountBestTime()
      -> saveBestScore()
      -> best_scores upsert only when the time improves
```

## Board Generation

Free Play boards are generated through `initGame()` and `initBoard()` in
`src/utils/init.ts`.

1. Create an empty grid for the selected difficulty.
2. Place mines with a partial Fisher-Yates shuffle.
3. Fill safe cells with adjacent mine counts.
4. On a first-click mine in a fresh Free Play game, regenerate the board with
   that clicked cell excluded from mine placement.

## Leaderboard

`/leaderboard` defaults to the Free Play tab. Rows are grouped by difficulty
and ordered by best time. Only signed-in users with a public nickname can
appear; guests remain local and private.
