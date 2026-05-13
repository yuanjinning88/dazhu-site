import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollProgress } from '@/hooks/useScrollProgress';

const navLinks = [
  { label: '首页', href: '/' },
  { label: '随笔', href: '/essays' },
  { label: '音乐', href: '/music' },
  { label: '电影', href: '/movies' },
  { label: '笔记', href: '/notes' },
  { label: '照片', href: '/photos' },
];

export default function Navbar() {
  const { scrolled } = useScrollProgress();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="content-width flex h-14 items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-base font-semibold text-text-primary tracking-tight hover:opacity-70 transition-opacity"
          onClick={() => setMenuOpen(false)}
        >
          大猪
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

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="content-width flex flex-col gap-1 py-4">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
