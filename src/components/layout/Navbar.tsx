import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { label: '首页', href: '/' },
  { label: '随笔', href: '/essays' },
  { label: '音乐', href: '/music' },
  { label: '电影', href: '/movies' },
  { label: '笔记', href: '/notes' },
  { label: '关于', href: '/about' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
    setMenuOpen(false);
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#f0f0f0]"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      data-lenis-prevent
    >
      <div className="w-full px-6 md:px-10 flex h-14 items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-base font-bold text-text-primary tracking-tight hover:opacity-70 transition-opacity"
          onClick={() => setMenuOpen(false)}
        >
          <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6 shrink-0">
            {/* Pig face */}
            <ellipse cx="16" cy="17" rx="11" ry="10" fill="#FFB8B8" />
            {/* Ears */}
            <ellipse cx="8" cy="9" rx="4" ry="5" fill="#FFA0A0" />
            <ellipse cx="24" cy="9" rx="4" ry="5" fill="#FFA0A0" />
            {/* Eyes */}
            <circle cx="12" cy="16" r="1.5" fill="#4A4A4A" />
            <circle cx="20" cy="16" r="1.5" fill="#4A4A4A" />
            {/* Snout */}
            <ellipse cx="16" cy="20" rx="4.5" ry="3.5" fill="#FFA0A0" />
            {/* Nostrils */}
            <ellipse cx="14" cy="20" rx="0.8" ry="1" fill="#D48888" />
            <ellipse cx="18" cy="20" rx="0.8" ry="1" fill="#D48888" />
            {/* Blush */}
            <ellipse cx="9" cy="18" rx="1.8" ry="1.2" fill="#FFCCD0" opacity="0.6" />
            <ellipse cx="23" cy="18" rx="1.8" ry="1.2" fill="#FFCCD0" opacity="0.6" />
          </svg>
          <span>I'm Dazhu</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const active = link.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm transition-colors duration-200 ${
                  active
                    ? 'text-text-primary'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side: login / logout + hamburger */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="hidden md:inline-flex items-center gap-1 text-[13px] text-[#86868B] hover:text-[#1d1d1f] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              退出登录
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-flex items-center gap-1 text-[13px] text-[#86868B] hover:text-[#1d1d1f] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              登录
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex md:hidden flex-col gap-1.5 p-1"
            aria-label="菜单"
          >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block w-5 h-[1.5px] bg-text-primary"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-5 h-[1.5px] bg-text-primary"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block w-5 h-[1.5px] bg-text-primary"
          />
        </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-b border-[#f0f0f0] overflow-hidden"
          >
            <div className="px-6 md:px-10 flex flex-col gap-1 py-4">
              {navLinks.map((link) => {
                const active = link.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`py-2 text-sm transition-colors ${
                      active ? 'text-text-primary' : 'text-text-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {isAdmin ? (
                <button
                  onClick={handleLogout}
                  className="py-2 text-sm text-[#86868B] hover:text-[#1d1d1f] transition-colors text-left"
                >
                  退出登录
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 text-sm text-[#86868B] hover:text-[#1d1d1f] transition-colors"
                >
                  登录
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
