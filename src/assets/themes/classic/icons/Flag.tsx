import type { IconProps } from './IconProps';

const Flag = (props: IconProps) => {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="14" y="5" width="3" height="20" fill="#1f1f1f" />
      <path d="M16 6l10 4-10 4z" fill="#cf1b1b" stroke="#8b0000" strokeWidth="1" />
      <rect x="8" y="24" width="16" height="3" fill="#1f1f1f" />
    </svg>
  );
};

export default Flag;
