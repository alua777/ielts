import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GridLogo from './GridLogo';

const NAV_LINKS = [
  { label: 'Dashboard', to: '/'          },
  { label: 'Practice',  to: '/practice'  },
  { label: 'Tests',     to: '/tests'     },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Resources', to: '/resources' },
];

export default function NormalHeader() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const menuRef          = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-6 py-0 shadow-sm">
      <div className="mx-auto flex max-w-7xl h-14 items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <GridLogo />
          <span className="text-[15px] font-bold text-gray-900 tracking-tight">IELTS Buddy</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(({ label, to }) => {
            const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link
                key={to} to={to}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ease-out ${
                  active ? 'text-violet-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
                <span
                  className={`absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-violet-600 transition-all duration-300 ease-out ${
                    active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-75'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Bell */}
          <button className="relative flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors border-0 bg-transparent cursor-pointer">
            <Bell size={18} strokeWidth={2} />
          </button>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-gray-200 hover:border-violet-200 transition-colors bg-white cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 text-xs font-bold text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user.name?.split(' ')[0]}
                </span>
                <ChevronDown size={13} strokeWidth={2.5} className="text-gray-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,0.10)]">
                  <div className="px-3 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Login
              </Link>
              <Link to="/register" className="text-sm font-medium px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
