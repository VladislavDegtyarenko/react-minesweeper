import type { IconProps } from './IconProps';

const Win = (props: IconProps) => {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="16" cy="16" r="13" fill="#f7d447" stroke="#1a1a1a" strokeWidth="2" />
      <circle cx="11.5" cy="13" r="1.6" fill="#1a1a1a" />
      <circle cx="20.5" cy="13" r="1.6" fill="#1a1a1a" />
      <path
        d="M10.5 19.5c1.8 2.2 3.5 3 5.5 3s3.7-.8 5.5-3"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Win;
