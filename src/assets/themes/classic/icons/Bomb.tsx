import type { IconProps } from './IconProps';

const Bomb = (props: IconProps) => {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="17" y="4" width="8" height="4" rx="1" fill="currentColor" />
      <path d="M18 8c0-3 3-5 6-5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="18" r="9" fill="currentColor" />
      <circle cx="13" cy="15" r="2" fill="#ffffff" opacity="0.7" />
      <path
        d="M16 6v4M16 26v4M6 16h4M22 16h4M9.5 9.5l3 3M19.5 19.5l3 3M22.5 9.5l-3 3M9.5 22.5l3-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
};

export default Bomb;
