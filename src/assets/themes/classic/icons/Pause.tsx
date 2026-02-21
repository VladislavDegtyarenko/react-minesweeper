import type { IconProps } from './IconProps';

const Pause = (props: IconProps) => {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="9" y="7" width="5" height="18" fill="#1f1f1f" />
      <rect x="18" y="7" width="5" height="18" fill="#1f1f1f" />
    </svg>
  );
};

export default Pause;
