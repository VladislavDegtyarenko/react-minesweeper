import classNames from 'classnames';
import {
  forwardRef,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';
import { createCx } from '@/utils';
import boardStyles from '../Board/styles.module.scss';
import styles from './styles.module.scss';

const boardCx = createCx(boardStyles);
const cx = createCx(styles);

type BoardFrameProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    as?: 'div' | 'span';
    isPaused?: boolean;
    variant?: 'game' | 'preview';
  }
>;

const BoardFrame = forwardRef<HTMLDivElement, BoardFrameProps>(
  (props, ref) => {
    const {
      as = 'div',
      children,
      className,
      isPaused = false,
      variant = 'game',
      ...rest
    } = props;
    const frameClassName = classNames(
      boardCx('boardScrollable', 'board', isPaused && 'pausedBoard'),
      cx(variant === 'preview' && 'previewBoard'),
      className,
    );

    if (as === 'span') {
      return (
        <span
          className={frameClassName}
          {...(rest as HTMLAttributes<HTMLSpanElement>)}
        >
          {children}
        </span>
      );
    }

    return (
      <div ref={ref} className={frameClassName} {...rest}>
        {children}
      </div>
    );
  },
);

BoardFrame.displayName = 'BoardFrame';

export default BoardFrame;
