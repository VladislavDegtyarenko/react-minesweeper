import { PropsWithChildren } from 'react';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type PageShellProps = PropsWithChildren<{
  description?: string;
  title: string;
}>;

const PageShell = (props: PageShellProps) => {
  const { children, description, title } = props;

  return (
    <section className={cx('pageShell')}>
      <div className={cx('card')}>
        <header className={cx('header')}>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </header>
        <div className={cx('content')}>{children}</div>
      </div>
    </section>
  );
};

export default PageShell;
