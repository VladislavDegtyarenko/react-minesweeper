import classNames from 'classnames/bind';
import { getShareSheetHeading } from '../../utils';
import styles from './styles.module.scss';
import type { ShareActionItem, WinOverlayPresentation } from '../../types';

const cx = classNames.bind(styles);

type ShareSheetProps = Pick<
  WinOverlayPresentation,
  | 'copyFallbackVisible'
  | 'copyState'
  | 'dialogTitle'
  | 'handleShareActionClick'
  | 'shareActionItems'
  | 'sharePayload'
>;

const renderShareButton = (
  item: ShareActionItem,
  copyState: ShareSheetProps['copyState'],
  handleShareActionClick: ShareSheetProps['handleShareActionClick'],
) => {
  const isCopyButton = item.channel === 'copy';
  const buttonLabel =
    isCopyButton && copyState === 'copied' ? 'Copied' : item.label;

  return (
    <button
      key={item.channel}
      type="button"
      className={cx('shareActionButton', isCopyButton && 'copyButton')}
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
      <p className={cx('shareSheetTitle')}>Share your result</p>

      <div className={cx('shareSheetGrid')}>
        {shareActionItems.map((item) =>
          renderShareButton(item, copyState, handleShareActionClick),
        )}
      </div>

      {copyState === 'copied' && (
        <p className={cx('shareFeedback')}>Link copied</p>
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
