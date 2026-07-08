import type { CSSProperties, FC } from "react";

type P = { size?: number; className?: string; style?: CSSProperties };

export const Ruler: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <rect x="2" y="8" width="20" height="8" rx="2" fill="#ffd3e0" stroke="#1a1a1a" strokeWidth="1.6" />
    <path d="M6 8v3M10 8v4M14 8v3M18 8v4" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const Trophy: FC<P> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" fill="#ffd24a" stroke="#1a1a1a" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5" fill="none" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M10 15h4v3h-4z" fill="#ffd24a" stroke="#1a1a1a" strokeWidth="1.6" />
    <path d="M8 21h8" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const XIcon: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="M3 3l7.6 9.9L3.4 21h2.3l5.8-6.7L16.6 21H21l-8-10.4L20.4 3h-2.3l-5.4 6.2L7.7 3H3Z" fill="currentColor" />
  </svg>
);

export const Wobble: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M4 18c3-6 6 6 9 0s6-6 7 0" stroke="#e0483a" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);
