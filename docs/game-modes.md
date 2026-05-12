# Game Modes

The game currently has two playable modes: Free Play and Daily Challenge.
Both use the same board UI, controls, timer, level selector, pause handling,
and win/loss flow, but they differ in board generation and result tracking.

## Mode Comparison

| Area | Free Play | Daily Challenge |
| --- | --- | --- |
| Board | Random board for the selected difficulty | Deterministic board for UTC date, difficulty, and seed version |
| Main goal | Improve personal best times | Complete today's shared challenge and maintain streaks |
| First click on mine | Protected on a fresh non-restarted game | Not protected |
| Restart | Reopens the same random board values | Reopens the same daily board |
| New game | Generates a fresh random board | Regenerates today's same daily board |
| Counted result | Wins only update best-time records | First win or loss per UTC day and difficulty counts |
| Practice | Not a separate concept | Replays after a counted result are practice |
| Guest storage | Local `BEST_TIMES` | Local `DAILY_HISTORY` |
| Account storage | `best_scores` | `daily_attempts` |
| Public leaderboard | Best time per difficulty | Today's daily winners and current daily streaks |

## Switching Modes

`src/components/Game/components/ModeToggle/index.tsx` lets the player switch
between modes. The request goes through `requestModeChange()` in
`src/store/game/actions.ts`.

If the current game is idle, won, or lost, the mode changes immediately. If
the game is playing or paused, the app opens `LevelChangeDialog` as a reset
confirmation. Canceling restores the previous playing or paused state;
confirming switches mode and resets the board for the selected mode.

## Shared Files

| Path | Responsibility |
| --- | --- |
| `src/store/game/store.ts` | Owns active `mode`, `dailyKey`, `dailySeedVersion`, pending mode changes, and board state. |
| `src/store/game/actions.ts` | Enters modes, resets boards, and guards active mode/difficulty changes. |
| `src/components/Game/components/ModeToggle/index.tsx` | Renders the Free Play / Daily segmented control. |
| `src/components/Game/components/LevelChangeDialog/index.tsx` | Confirms active-game difficulty and mode changes. |
| `src/utils/init.ts` | Creates boards, places mines, and fills adjacent mine counts. |
| `src/utils/board/index.ts` | Handles cell opens, marker toggles, win/loss checks, and first-click behavior. |

## Related Docs

- [Free Play](./free-play.md)
- [Daily Challenge](./daily-challenge.md)
