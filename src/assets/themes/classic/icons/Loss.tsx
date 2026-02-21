import type { IconProps } from './IconProps';

const Loss = (props: IconProps) => {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="16" cy="16" r="13" fill="#f7d447" stroke="#1a1a1a" strokeWidth="2" />
      <path d="M10 11l3 3M13 11l-3 3" stroke="#1a1a1a" strokeWidth="1.8" />
      <path d="M19 11l3 3M22 11l-3 3" stroke="#1a1a1a" strokeWidth="1.8" />
      <path
        d="M10.5 22c1.8-2.2 3.5-3 5.5-3s3.7.8 5.5 3"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Loss;
