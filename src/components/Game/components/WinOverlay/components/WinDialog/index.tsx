import * as Dialog from '@radix-ui/react-dialog';
import { createCx } from '@/utils';
import NicknamePrompt from './components/NicknamePrompt';
import ScoreSyncNotice from './components/ScoreSyncNotice';
import { isClerkComponentNode } from './utils';
import ShareSheet from '../ShareSheet';
import styles from './styles.module.scss';
import type { WinOverlayPresentation } from '../../types';

const cx = createCx(styles);

type WinDialogProps = Pick<
  WinOverlayPresentation,
  | 'copyFallbackVisible'
  | 'copyState'
  | 'dailyStreakCount'
  | 'dialogDescription'
  | 'dialogTitle'
  | 'dailySyncMessage'
  | 'handleDialogOpenChange'
  | 'handleNewGameClick'
  | 'handleRetryDailySyncClick'
  | 'handleRetryScoreSyncClick'
  | 'handleShareActionClick'
  | 'handleShareClick'
  | 'isDailyPracticeWin'
  | 'isDailySyncFailed'
  | 'isDailySyncRetrying'
  | 'isDailyWin'
  | 'isDialogOpen'
  | 'isNewBest'
  | 'isScoreSyncFailed'
  | 'isScoreSyncRetrying'
  | 'isShareSheetOpen'
  | 'scoreSyncMessage'
  | 'shareActionItems'
  | 'sharePayload'
  | 'shouldShowLeaderboardPrompt'
>;

const WinDialog = ({
  copyFallbackVisible,
  copyState,
  dailyStreakCount,
  dialogDescription,
  dialogTitle,
  dailySyncMessage,
  handleDialogOpenChange,
  handleNewGameClick,
  handleRetryDailySyncClick,
  handleRetryScoreSyncClick,
  handleShareActionClick,
  handleShareClick,
  isDailyPracticeWin,
  isDailySyncFailed,
  isDailySyncRetrying,
  isDailyWin,
  isDialogOpen,
  isNewBest,
  isScoreSyncFailed,
  isScoreSyncRetrying,
  isShareSheetOpen,
  scoreSyncMessage,
  shareActionItems,
  sharePayload,
  shouldShowLeaderboardPrompt,
}: WinDialogProps) => {
  if (!sharePayload) {
    return null;
  }

  const handleInteractOutside = (
    event: CustomEvent<{ originalEvent: Event }>,
  ) => {
    if (isClerkComponentNode(event.detail.originalEvent.target)) {
      event.preventDefault();
    }
  };

  const shouldShowNicknamePrompt =
    !isDailyWin && !isDailyPracticeWin && shouldShowLeaderboardPrompt;

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={cx('dialogOverlay')} />

        <Dialog.Content
          className={cx('dialogContent', isNewBest && 'bestDialogContent')}
          onInteractOutside={handleInteractOutside}
        >
          <div className={cx('dialogBody')}>
            <Dialog.Title className={cx('title')}>{dialogTitle}</Dialog.Title>
            <Dialog.Description className={cx('subtitle')}>
              {dialogDescription}
            </Dialog.Description>

            <dl className={cx('statsList')}>
              <div className={cx('statsRow')}>
                <dt>Your time</dt>
                <dd>{sharePayload.currentTimeLabel}</dd>
              </div>

              {!isDailyWin && !isDailyPracticeWin && (
                <div className={cx('statsRow')}>
                  <dt>Best time</dt>
                  <dd>{sharePayload.bestTimeLabel}</dd>
                </div>
              )}

              {isDailyWin && (
                <div className={cx('statsRow')}>
                  <dt>Daily streak</dt>
                  <dd>{dailyStreakCount}</dd>
                </div>
              )}

              {isDailyPracticeWin && (
                <div className={cx('statsRow')}>
                  <dt>Daily result</dt>
                  <dd>Practice</dd>
                </div>
              )}
            </dl>

            {isDailyWin && (isDailySyncFailed || isDailySyncRetrying) && (
              <ScoreSyncNotice
                isRetrying={isDailySyncRetrying}
                message={isDailySyncRetrying ? null : dailySyncMessage}
                retryingButtonLabel="Syncing"
                retryingMessage="Saving your daily result to your account..."
                title="Daily result not synced"
                onRetry={handleRetryDailySyncClick}
              />
            )}

            {!isDailyWin &&
              !isDailyPracticeWin &&
              (isScoreSyncFailed || isScoreSyncRetrying) && (
                <ScoreSyncNotice
                  isRetrying={isScoreSyncRetrying}
                  message={scoreSyncMessage}
                  onRetry={handleRetryScoreSyncClick}
                />
              )}

            <div className={cx('actions')}>
              <button
                type="button"
                className={cx('actionButton', 'primaryAction')}
                onClick={handleNewGameClick}
              >
                New Game
              </button>

              <button
                type="button"
                className={cx('actionButton', 'secondaryAction')}
                onClick={() => void handleShareClick()}
              >
                Share
              </button>
            </div>

            {shouldShowNicknamePrompt ? (
              <section className={cx('leaderboardPrompt')}>
                <div className={cx('leaderboardPromptBody')}>
                  <p className={cx('leaderboardPromptTitle')}>
                    Publish your best times
                  </p>
                  <p className={cx('leaderboardPromptText')}>
                    Your best results are saved to your account. Add a nickname
                    to show them to other players on the leaderboard.
                  </p>
                </div>

                <NicknamePrompt />
              </section>
            ) : null}

            {isShareSheetOpen && (
              <ShareSheet
                copyFallbackVisible={copyFallbackVisible}
                copyState={copyState}
                dialogTitle={dialogTitle}
                handleShareActionClick={handleShareActionClick}
                isDailyPracticeWin={isDailyPracticeWin}
                isDailyWin={isDailyWin}
                shareActionItems={shareActionItems}
                sharePayload={sharePayload}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default WinDialog;
