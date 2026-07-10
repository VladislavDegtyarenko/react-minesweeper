# Intro Screen

The intro screen is the root route (`/`). It gives players a deliberate start
surface before the playable board at `/game`, while keeping direct game links
fully supported.

## Route Model

| Route | Purpose |
| --- | --- |
| `/` | Intro screen with Continue, mode selector, selectable difficulty cards, and Start Playing |
| `/game` | Playable Minesweeper board |
| `/game?mode=free&level=easy` | Start Classic on a specific difficulty |
| `/game?mode=daily&level=expert` | Start Daily Challenge on a specific difficulty |
| `/game?tour=1` | Open or resume the game and replay onboarding |

Invalid query values are ignored. The `tour=1` query is independent from game
selection and must not discard an in-progress saved game.

## Intro Actions

The intro follows a progressive setup flow:

1. Choose Classic or Daily.
2. Choose Easy, Medium, or Expert.
3. Click the single Start Playing action.

The default setup is Classic + Medium, with Medium marked as Recommended and
Daily marked as New. Difficulty cards are selectable options, not immediate
start actions. Clicking Start Playing:

1. Calls `initSFX()` inside the user gesture so browser audio can unlock early.
2. Clears any saved in-progress game snapshot.
3. Navigates to `/game?mode=<selected-mode>&level=<selected-level>`.

The Continue banner also calls `initSFX()` and navigates to bare `/game`, where
the game route resumes the valid snapshot. If a user opens `/game` directly,
audio still initializes on the first board/game interaction through the
existing SFX path.

## Onboarding

First-time onboarding is a skippable, interactive spotlight tour over the real
game UI. Tutorial actions happen on the live board, so they can start the
timer, reveal cells, place flags, update resume snapshots, and win through the
same rules as normal play. Completion and skip both persist
`ONBOARDING_SEEN_V1` in local storage.

The lobby does not show a tutorial link, so the setup flow stays focused on
mode, difficulty, and Start Playing. The `/game?tour=1` route remains supported
for future in-game settings entry points and opens the same tour even when
`ONBOARDING_SEEN_V1` is already set.

The tour has five steps: open a covered empty cell, read one revealed number,
place a flag, learn the win conditions, and find Settings. It scans the current
board for useful targets instead of replacing the active game. If an exact
empty, number, or mine target is unavailable, the step falls back to a broader
board/control target and lets the player continue.

After the first reveal and after reading the first number, the next step waits
briefly before moving the spotlight so the board change is visible.

While onboarding is open, switching tabs or windows does not auto-pause the
game. This keeps the pause overlay from covering live board targets mid-tour.

The flagging step uses device-specific copy: desktop players see right-click
instructions, touch gesture users see press-and-hold guidance, and Toggle-mode
users first use the Flag control before flagging a covered square.

## Navigation

The header exposes a visible Start link to `/` on both desktop and mobile. The
mobile Start link is outside the burger menu so players can always find the
intro again.

Inside `/game`, the URL is kept in sync with the confirmed mode and difficulty:
`/game?mode=<mode>&level=<level>`. This synchronization uses browser history
replacement and does not rerun initial route loading, resume logic, or reset
the active board.

The game frame also shows the current context, such as `Classic - Easy` or
`Daily - Expert`, so the active mode and difficulty remain visible while the
mode/difficulty controls stay below the board as secondary controls.

## Resume Snapshot

The app stores at most one local in-progress game snapshot under
`GAME_SNAPSHOT`. A snapshot can resume only when:

- It is version `1`.
- The saved game status is `playing` or `paused`.
- At least one safe cell has been opened.
- Free Play was saved less than 24 hours ago.
- Daily Challenge uses today's UTC `dailyKey`.

Snapshots store the board, mode, difficulty, flags, opened safe cells,
correctly flagged mines, daily metadata when needed, and accumulated timer
elapsed milliseconds. Runtime timer timestamps based on `performance.now()` are
not persisted. When a paused snapshot is loaded, the board resumes in playing
state with the saved elapsed time so overlays do not block first-time
onboarding targets after a refresh.

## Conflict Rules

- Bare `/game` resumes a valid snapshot.
- Intro Continue resumes a valid snapshot.
- Starting from the intro setup silently discards the snapshot.
- `/game?mode=...&level=...` wins over a mismatched snapshot and starts fresh.
- Matching `/game` mode and level params resume the saved game.
- Stale or invalid snapshots are deleted silently.
- Win, loss, or starting a new game clears the snapshot.

## Main Files

| Path | Responsibility |
| --- | --- |
| `src/components/pages/LobbyPage/` | Lobby layout, mode selector, selectable level cards, preview boards, Continue banner, and global Start Playing action |
| `src/app/game/page.tsx` | `/game` route and game metadata |
| `src/components/Game/hooks/useGameRouteInitializer.ts` | Applies URL params, snapshot resume, and tour replay decisions |
| `src/components/Game/hooks/useSyncGameRouteParams.ts` | Keeps `/game` query params aligned with confirmed mode and difficulty |
| `src/components/Game/components/GameContextLabel/` | Shows current mode and difficulty in the game frame |
| `src/components/Game/components/OnboardingTour/` | Interactive live-board spotlight onboarding UI |
| `src/store/game/snapshot/` | Snapshot read/write, validation, matching, and save subscription |
| `src/store/game/actions.ts` | Fresh starts, mode entry, snapshot resume, and snapshot clearing |
