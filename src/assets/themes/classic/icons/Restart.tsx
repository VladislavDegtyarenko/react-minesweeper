import type { IconProps } from './IconProps';

const Restart = (props: IconProps) => {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M24.5 16a8.5 8.5 0 1 1-3.1-6.6"
        fill="none"
        stroke="#0a2fb3"
        strokeWidth="3"
        strokeLinecap="square"
      />
      <path d="M21 6h7v7" fill="none" stroke="#0a2fb3" strokeWidth="3" />
    </svg>
  );
};

export default Restart;
