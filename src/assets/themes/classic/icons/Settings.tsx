import type { IconProps } from './IconProps';

const Settings = (props: IconProps) => {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="16" cy="16" r="3" fill="#1f1f1f" />
      <path
        d="M16 5.5v4M16 22.5v4M5.5 16h4M22.5 16h4M8.5 8.5l2.8 2.8M20.7 20.7l2.8 2.8M23.5 8.5l-2.8 2.8M11.3 20.7l-2.8 2.8"
        stroke="#1f1f1f"
        strokeWidth="2.2"
        strokeLinecap="square"
      />
      <circle cx="16" cy="16" r="8" fill="none" stroke="#1f1f1f" strokeWidth="2" />
    </svg>
  );
};

export default Settings;
