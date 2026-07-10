import styles from './styles.module.scss';
import { createCx } from '@/utils';
const cx = createCx(styles);

type Props = {
  title: string;
  subtitle: string;
}

const LobbyHeader = ({ title, subtitle }: Props) => {
  return (
    <header className={cx('header')}>
      <div>
        <h1 id="intro-title">
          {title}
        </h1>
        <p className={cx('subtitle')}>
          {subtitle}
        </p>
      </div>
    </header>
  )
}

export default LobbyHeader;