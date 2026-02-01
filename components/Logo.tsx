import { CSSProperties } from 'react';

export function Logo({ className = "w-9 h-9", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#05d9e8" />
          <stop offset="100%" stopColor="#ff2a6d" />
        </linearGradient>
      </defs>
      {/* Outer Ring */}
      <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
      {/* Spinning Gradient Ring */}
      <circle 
        className="ring-spin" 
        cx="50" 
        cy="50" 
        r="40" 
        stroke="url(#logoGrad)" 
        strokeWidth="8" 
        strokeDasharray="100 150" 
        strokeLinecap="round" 
      />
      {/* Center Dot */}
      <circle cx="50" cy="50" r="12" fill="#fff" fillOpacity="0.9" />
    </svg>
  );
}
