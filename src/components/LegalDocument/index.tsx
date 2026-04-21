import type { PropsWithChildren } from 'react';
import PageShell from '@/components/PageShell';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type LegalDocumentProps = PropsWithChildren<{
  description: string;
  lastUpdatedDateTime: string;
  lastUpdated: string;
  title: string;
}>;

const LegalDocument = (props: LegalDocumentProps) => {
  const { children, description, lastUpdated, lastUpdatedDateTime, title } =
    props;

  return (
    <PageShell title={title} description={description}>
      <p className={cx('meta')}>
        Last updated: <time dateTime={lastUpdatedDateTime}>{lastUpdated}</time>
      </p>

      <article className={cx('document')}>{children}</article>
    </PageShell>
  );
};

export default LegalDocument;
