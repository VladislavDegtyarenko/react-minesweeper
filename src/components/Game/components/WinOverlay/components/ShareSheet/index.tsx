import { createCx } from '@/utils';
import { getShareSheetHeading } from '../../utils';
import styles from './styles.module.scss';
import type { ShareActionItem, WinOverlayPresentation } from '../../types';

const cx = createCx(styles);

type ShareSheetProps = Pick<
  WinOverlayPresentation,
  | 'copyFallbackVisible'
  | 'copyState'
  | 'dialogTitle'
  | 'handleShareActionClick'
  | 'isDailyPracticeWin'
  | 'isDailyWin'
  | 'shareActionItems'
  | 'sharePayload'
>;

const isCopyChannel = (channel: ShareActionItem['channel']) =>
  channel === 'copy';

const renderShareButton = (
  item: ShareActionItem,
  copyState: ShareSheetProps['copyState'],
  handleShareActionClick: ShareSheetProps['handleShareActionClick'],
) => {
  const isCopy = isCopyChannel(item.channel);
  const buttonLabel = isCopy && copyState === 'copied' ? 'Copied' : item.label;

  return (
    <button
      key={item.channel}
      type="button"
      className={cx(
        'shareActionButton',
        item.channel === 'copy' && 'copyButton',
      )}
      onClick={() => void handleShareActionClick(item.channel)}
    >
      {buttonLabel}
    </button>
  );
};

const ShareSheet = ({
  copyFallbackVisible,
  copyState,
  dialogTitle,
  handleShareActionClick,
  isDailyPracticeWin,
  isDailyWin,
  shareActionItems,
  sharePayload,
}: ShareSheetProps) => {
  if (!sharePayload) {
    return null;
  }

  return (
    <section
      className={cx('shareSheet')}
      aria-label={getShareSheetHeading(dialogTitle)}
    >
      <p className={cx('shareSheetTitle')}>
        {isDailyWin
          ? 'Share your daily result'
          : isDailyPracticeWin
            ? 'Share your practice result'
            : 'Share your result'}
      </p>

      <div className={cx('shareSheetGrid')}>
        {shareActionItems.map((item) =>
          renderShareButton(item, copyState, handleShareActionClick),
        )}
      </div>

      {copyState === 'copied' && (
        <p className={cx('shareFeedback')}>Copied to clipboard</p>
      )}

      {copyFallbackVisible && (
        <div className={cx('copyFallback')}>
          <p className={cx('shareFeedback')}>
            Copy is blocked in this browser. Select the link below and copy it
            manually.
          </p>
          <input
            className={cx('copyFallbackField')}
            type="text"
            readOnly
            value={sharePayload.url}
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
      )}
    </section>
  );
};

export default ShareSheet;
