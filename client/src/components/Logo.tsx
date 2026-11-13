import { Link } from 'react-router-dom';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Code-a-Nova home">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="8" fill={light ? '#ffffff' : '#1C4980'} />
        <path d="M11 11l-5 5 5 5M21 11l5 5-5 5" fill="none" stroke={light ? '#1C4980' : '#fff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="16" r="2.4" fill="#FFB800" />
      </svg>
      <span className={`text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-primary'}`}>Code-a-Nova</span>
    </Link>
  );
}
