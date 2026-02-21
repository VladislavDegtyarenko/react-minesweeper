import type { IconProps } from './IconProps';

const Time = (props: IconProps) => {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="16" cy="16" r="10" fill="#f6f6f6" stroke="#1f1f1f" strokeWidth="2" />
      <path d="M16 10v7l4 2" stroke="#1f1f1f" strokeWidth="2" strokeLinecap="square" />
      <path d="M12 4h8" stroke="#1f1f1f" strokeWidth="2" />
      <rect x="10" y="2" width="2" height="4" fill="#1f1f1f" />
      <rect x="20" y="2" width="2" height="4" fill="#1f1f1f" />
    </svg>
  );
};

export default Time;
