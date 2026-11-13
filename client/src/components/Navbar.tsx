import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { Button, LinkButton } from './ui/Button';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary' : 'text-ink hover:bg-surface'}`;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/'); // brief: logout clears the token and returns to Home
  };

  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
    ...(user ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>)}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          ) : (
            <>
              <LinkButton to="/login" variant="outline">Login</LinkButton>
              <LinkButton to="/signup">Sign up</LinkButton>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-ink hover:bg-surface md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={close}>{l.label}</NavLink>)}
          </div>
          <div className="mt-3 flex gap-2">
            {user ? (
              <Button variant="outline" className="flex-1" onClick={handleLogout}>Logout</Button>
            ) : (
              <>
                <LinkButton to="/login" variant="outline" className="flex-1" onClick={close}>Login</LinkButton>
                <LinkButton to="/signup" className="flex-1" onClick={close}>Sign up</LinkButton>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
