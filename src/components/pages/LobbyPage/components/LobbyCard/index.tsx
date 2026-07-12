import { CheckIcon } from '@radix-ui/react-icons';
import type { PropsWithChildren, ReactNode } from 'react';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Variant = 'vertical' | 'horizontal';

type LobbyCardProps = PropsWithChildren<{
  variant?: Variant;
  ariaLabel: string;
  badge?: string;
  className?: string;
  compactBadge?: string;
  compactOnMobile?: boolean;
  compactVariant?: 'level' | 'mode';
  description?: string;
  descriptionPlacement?: 'afterMedia' | 'beforeMedia';
  eyebrow: string;
  isSelected: boolean;
  media?: ReactNode;
  onSelect?: () => void;
  showSelectionMark?: boolean;
  title: string;
  titleIcon?: ReactNode;
}>;

const LobbyCard = (props: LobbyCardProps) => {
  const {
    variant = 'vertical',
    ariaLabel,
    badge,
    children,
    className,
    compactBadge,
    compactOnMobile,
    compactVariant,
    description,
    descriptionPlacement = 'afterMedia',
    eyebrow,
    isSelected,
    media,
    onSelect,
    showSelectionMark = true,
    title,
    titleIcon,
  } = props;

  const descriptionElement = description ? (
    <span className={cx('description')}>{description}</span>
  ) : null;

  const topRow = (
    <span className={cx('topRow')}>
      <span className={cx('titleBlock')}>
        <span className={cx('headingRow')}>
          <span className={cx('eyebrow')}>{eyebrow}</span>
          {badge ? (
            <span className={cx('badge', compactBadge && 'hasCompactBadge')}>
              {badge}
              {compactBadge ? (
                <span className={cx('compactBadgeText')}>{compactBadge}</span>
              ) : null}
            </span>
          ) : null}
        </span>
        <span className={cx('title')}>
          {titleIcon ? (
            <span className={cx('titleIcon')} aria-hidden="true">
              {titleIcon}
            </span>
          ) : null}
          <span>{title}</span>
        </span>
      </span>

      {isSelected && showSelectionMark ? (
        <span className={cx('selectionMark')} aria-hidden="true">
          <CheckIcon />
        </span>
      ) : null}
    </span>
  );

  const cardContent =
    variant === 'horizontal' ? (
      <>
        <span className={cx('contentCol')}>
          {topRow}
          {descriptionPlacement === 'beforeMedia' && descriptionElement}
          {descriptionPlacement === 'afterMedia' && descriptionElement}
          {children}
        </span>

        {media}
      </>
    ) : (
      <>
        {topRow}

        {descriptionPlacement === 'beforeMedia' && descriptionElement}

        {media}

        {descriptionPlacement === 'afterMedia' && descriptionElement}

        {children}
      </>
    );

  if (!onSelect) {
    return (
      <section
        aria-label={ariaLabel}
        className={cx(
          'card',
          'staticCard',
          isSelected && 'selected',
          compactOnMobile && 'compactOnMobile',
          compactVariant === 'level' && 'compactLevel',
          compactVariant === 'mode' && 'compactMode',
          className,
        )}
      >
        {cardContent}
      </section>
    );
  }

  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      className={cx(
        'card',
        isSelected && 'selected',
        compactOnMobile && 'compactOnMobile',
        compactVariant === 'level' && 'compactLevel',
        compactVariant === 'mode' && 'compactMode',
        className,
      )}
      type="button"
      onClick={onSelect}
    >
      {cardContent}
    </button>
  );
};

export default LobbyCard;
