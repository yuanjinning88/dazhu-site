import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

/* ═══════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════ */

interface TrailDot {
  id: number;
  x: number;
  y: number;
}

/* ═══════════════════════════════════════════════════════════
   Check if notes page
   ═══════════════════════════════════════════════════════════ */

function isNotesPage(pathname: string): boolean {
  return pathname.startsWith('/notes');
}

/* ═══════════════════════════════════════════════════════════
   Hooks
   ═══════════════════════════════════════════════════════════ */

function useMediaQuery(query: string) {
  const [m, setM] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const h = (e: MediaQueryListEvent) => setM(e.matches);
    mql.addEventListener('change', h);
    return () => mql.removeEventListener('change', h);
  }, [query]);
  return m;
}

/* ═══════════════════════════════════════════════════════════
   Pen cursor
   ═══════════════════════════════════════════════════════════ */

function PenCursor({ hover, click, dark }: { hover: boolean; click: boolean; dark: boolean }) {
  const c = dark ? '#F5F5F7' : '#1D1D1F';

  return (
    <motion.svg
      width="36" height="36" viewBox="0 0 36 36" fill="none"
      className="overflow-visible"
      animate={{
        x: -18,
        y: hover ? -15 : -18,
        rotate: 40,
        scale: click ? 0.93 : 1,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
    >
      <rect x="17" y="1" width="2" height="7" rx="0.5" fill="#BDBDBD" />
      <rect x="12.5" y="5" width="7" height="14" rx="2" fill={c} />
      <rect x="14" y="8" width="4" height="6" rx="1" fill={dark ? '#555' : '#E0E0E0'} />
      <rect x="12.5" y="19" width="7" height="4" rx="1.5" fill="#999" />
      <polygon points="13,23 19,23 18,27 14,27" fill="#C0C0C0" />
      <motion.polygon
        points="14.5,27 17.5,27 16,33"
        animate={{ fill: click ? '#333' : '#C0C0C0' }}
        transition={{ duration: 0.15 }}
      />
      {hover && (
        <motion.circle
          cx="16" cy="32" r="1.8"
          fill={c}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      )}
    </motion.svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   Ink trail dot
   ═══════════════════════════════════════════════════════════ */

function InkDot({ x, y, dark, onDone }: { x: number; y: number; dark: boolean; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: dark ? 0.55 : 0.45, scale: 1 }}
      animate={{ opacity: 0, scale: 0.3 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      onAnimationComplete={onDone}
      style={{
        position: 'fixed',
        left: x - 3,
        top: y - 3,
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: dark ? '#F5F5F7' : '#1D1D1F',
        pointerEvents: 'none',
        zIndex: 99998,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════ */

const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, [role="button"], [data-cursor-interactive]';

export default function CustomCursor() {
  const { pathname } = useLocation();
  const active = isNotesPage(pathname);

  const isTouch = useMediaQuery('(pointer: coarse)');
  const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');

  // mouse tracking
  const elRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: -100, y: -100 });
  const raf = useRef(0);

  // interaction
  const [hover, setHover] = useState(false);
  const [click, setClick] = useState(false);
  const [visible, setVisible] = useState(false);

  // ink trail
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const trailId = useRef(0);
  const lastTrail = useRef(0);

  // smooth factor for pen cursor (slightly trailing)
  const SMOOTH = 0.35;

  // ── RAF position loop ──────────────────────────────
  useEffect(() => {
    if (isTouch || prefersReduced || !active) return;

    const run = () => {
      const tx = target.current.x;
      const ty = target.current.y;
      const cx = current.current.x;
      const cy = current.current.y;

      current.current.x = cx + (tx - cx) * SMOOTH;
      current.current.y = cy + (ty - cy) * SMOOTH;

      if (elRef.current) {
        elRef.current.style.left = `${current.current.x}px`;
        elRef.current.style.top  = `${current.current.y}px`;
      }
      raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf.current);
  }, [isTouch, prefersReduced, active]);

  // ── mousemove —————————————————————————————————————
  useEffect(() => {
    if (isTouch || !active) return;
    const h = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!visible) setVisible(true);
    };
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, [isTouch, active, visible]);

  // ── ink trail (throttled mousemove) ——————————————
  useEffect(() => {
    if (isTouch || !active || prefersReduced) return;
    const h = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTrail.current > 35) {
        lastTrail.current = now;
        setTrail(prev => [...prev.slice(-18), { id: trailId.current++, x: e.clientX, y: e.clientY }]);
      }
    };
    window.addEventListener('mousemove', h, { passive: true });
    return () => {
      window.removeEventListener('mousemove', h);
      setTrail([]);
    };
  }, [isTouch, active, prefersReduced]);

  // ── hover detection ———————————————————————————————
  useEffect(() => {
    if (isTouch || !active) return;
    const over = (e: MouseEvent) => {
      if ((e.target as Element)?.closest(INTERACTIVE_SELECTOR)) setHover(true);
    };
    const out = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const r = e.relatedTarget as Element | null;
      if (t?.closest(INTERACTIVE_SELECTOR) && !r?.closest(INTERACTIVE_SELECTOR)) setHover(false);
    };
    document.addEventListener('mouseover', over, { passive: true });
    document.addEventListener('mouseout',  out,  { passive: true });
    return () => {
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout',  out);
    };
  }, [isTouch, active]);

  // ── click detection ———————————————————————————————
  useEffect(() => {
    if (isTouch || !active) return;
    const down = () => setClick(true);
    const up   = () => setClick(false);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup',   up);
    return () => {
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup',   up);
    };
  }, [isTouch, active]);

  // ── visibility ————————————————————————————————————
  useEffect(() => {
    if (isTouch || !active) return;
    const enter = () => setVisible(true);
    const leave = () => setVisible(false);
    document.documentElement.addEventListener('mouseenter', enter);
    document.documentElement.addEventListener('mouseleave', leave);
    return () => {
      document.documentElement.removeEventListener('mouseenter', enter);
      document.documentElement.removeEventListener('mouseleave', leave);
    };
  }, [isTouch, active]);

  // ── suppress native cursor ————————————————————————
  useEffect(() => {
    const s = document.getElementById('cursor-suppress-style');
    if (isTouch || !active) {
      if (s) s.remove();
      return;
    }
    if (!s) {
      const style = document.createElement('style');
      style.id = 'cursor-suppress-style';
      style.textContent = `html *, html *::before, html *::after { cursor: none !important; }`;
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById('cursor-suppress-style');
      if (el) el.remove();
    };
  }, [isTouch, active]);

  // ── guard —————————————————————————————————————————
  if (isTouch || !active) return null;

  return createPortal(
    <>
      <div
        ref={elRef}
        style={{
          position: 'fixed',
          left: -100,
          top: -100,
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
      >
        <PenCursor hover={hover} click={click} dark={isDark} />
      </div>

      {trail.map((d) => (
        <InkDot
          key={d.id}
          x={d.x} y={d.y}
          dark={isDark}
          onDone={() => setTrail((prev) => prev.filter((x) => x.id !== d.id))}
        />
      ))}
    </>,
    document.body,
  );
}
