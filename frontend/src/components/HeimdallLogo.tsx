import React from 'react';

interface HeimdallLogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export function HeimdallLogo({ className = '', size = 24, color = 'currentColor' }: HeimdallLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 6-petal geometric orchid / iris inspired motif */}
      <circle cx="12" cy="12" r="2.2" fill={color} />
      <path
        d="M12 2.5C10.6 4.5 10.6 6.8 12 8.5C13.4 6.8 13.4 4.5 12 2.5Z"
        fill={color}
      />
      <path
        d="M12 21.5C10.6 19.5 10.6 17.2 12 15.5C13.4 17.2 13.4 19.5 12 21.5Z"
        fill={color}
      />
      <path
        d="M3.77 7.25C5.7 7.75 7.4 9.15 7.9 11.05C6.9 11.35 4.8 10.6 3.77 7.25Z"
        fill={color}
      />
      <path
        d="M20.23 7.25C18.3 7.75 16.6 9.15 16.1 11.05C17.1 11.35 19.2 10.6 20.23 7.25Z"
        fill={color}
      />
      <path
        d="M3.77 16.75C5.7 16.25 7.4 14.85 7.9 12.95C6.9 12.65 4.8 13.4 3.77 16.75Z"
        fill={color}
      />
      <path
        d="M20.23 16.75C18.3 16.25 16.6 14.85 16.1 12.95C17.1 12.65 19.2 13.4 20.23 16.75Z"
        fill={color}
      />
    </svg>
  );
}
