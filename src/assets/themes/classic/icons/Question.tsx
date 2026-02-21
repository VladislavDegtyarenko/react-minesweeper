import type { IconProps } from './IconProps';

const Question = (props: IconProps) => {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M16 6c-4 0-7 2.3-7 6h4c0-1.4 1.2-2.4 3-2.4 1.7 0 2.9 1 2.9 2.4 0 1.2-.7 2-2.1 2.9-2 1.2-3.8 2.5-3.8 5.1v1h4v-.6c0-1.4.8-2.1 2.7-3.3 1.9-1.2 3.2-2.8 3.2-5.2 0-3.8-3.1-5.9-6.9-5.9z"
        fill="#0a2fb3"
      />
      <circle cx="16" cy="25.5" r="2" fill="#0a2fb3" />
    </svg>
  );
};

export default Question;
