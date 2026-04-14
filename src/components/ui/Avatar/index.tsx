import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  alt: string;
  className?: string;
  imageUrl?: string | null;
  label?: string;
};

const Avatar = (props: Props) => {
  const { alt, className, imageUrl, label } = props;
  const fallbackLabel = label?.trim().charAt(0).toUpperCase() || null;

  return (
    <div className={cx('avatar', className)}>
      {imageUrl ? (
        <img alt={alt} src={imageUrl} />
      ) : fallbackLabel ? (
        <span>{fallbackLabel}</span>
      ) : null}
    </div>
  );
};

export default Avatar;
