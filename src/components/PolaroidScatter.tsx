import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ──

export interface PolaroidPhoto {
  id: string;
  title: string;
  imageUrl: string | null;
  colors: [string, string];
  date?: string;
}

interface Spot {
  x: number;
  y: number;
  rotation: number;
  z: number;
  page: 'left' | 'right';
}

// ── Photo distribution ──
// Assign each photo to left or right page, then random position within that page.
// Left page: x 2–44%, Right page: x 56–98%, Rotation: ±30°

function scatter(photos: PolaroidPhoto[]): Spot[] {
  const n = photos.length;
  const assignments: ('left' | 'right')[] = [];
  for (let i = 0; i < n; i++) {
    assignments.push(i < n / 2 ? 'left' : 'right');
  }
  for (let i = assignments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
  }

  return assignments.map((page) => ({
    x: page === 'left' ? 3 + Math.random() * 40 : 57 + Math.random() * 40,
    y: 3 + Math.random() * 72,
    rotation: (Math.random() - 0.5) * 60, // ±30°
    z: Math.floor(Math.random() * 12),
    page,
  }));
}

// ── Paper texture: dual-layer SVG noise for realistic fiber + grain ──

const paperTextureId = 'paper-texture-filter';
const paperStainId = 'paper-stain-filter';

function PaperTextureSVG() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      <defs>
        {/* Fine fiber noise */}
        <filter
          id={paperTextureId}
          x="0%" y="0%" width="100%" height="100%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="5"
            stitchTiles="stitch"
            result="fineNoise"
          />
          <feColorMatrix
            type="matrix"
            values="
              0 0 0 0 0.42
              0 0 0 0 0.35
              0 0 0 0 0.25
              0 0 0 0.055 0
            "
            in="fineNoise"
            result="fineColor"
          />
        </filter>

        {/* Coarse stain / discoloration */}
        <filter
          id={paperStainId}
          x="0%" y="0%" width="100%" height="100%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves="2"
            stitchTiles="stitch"
            result="coarseNoise"
          />
          <feColorMatrix
            type="matrix"
            values="
              0 0 0 0 0.35
              0 0 0 0 0.28
              0 0 0 0 0.18
              0 0 0 0.04 0
            "
            in="coarseNoise"
            result="coarseColor"
          />
        </filter>
      </defs>

      {/* Fine grain overlay */}
      <rect
        width="100%"
        height="100%"
        filter={`url(#${paperTextureId})`}
        style={{ mixBlendMode: 'multiply' }}
      />

      {/* Coarse stain overlay */}
      <rect
        width="100%"
        height="100%"
        filter={`url(#${paperStainId})`}
        style={{ mixBlendMode: 'multiply' }}
      />
    </svg>
  );
}

// ── Notebook ruled lines ──

function RuledLines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      style={{
        zIndex: 1,
        backgroundImage:
          'repeating-linear-gradient(transparent, transparent 26px, rgba(156,138,115,0.07) 26px, rgba(156,138,115,0.07) 27px)',
        maskImage:
          'linear-gradient(to bottom, transparent 3%, black 8%, black 92%, transparent 97%), ' +
          'linear-gradient(to right, transparent 6%, black 10%, black 90%, transparent 94%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 3%, black 8%, black 92%, transparent 97%), ' +
          'linear-gradient(to right, transparent 6%, black 10%, black 90%, transparent 94%)',
      }}
      aria-hidden="true"
    />
  );
}

// ── Crease / fold marks ──

function CreaseMarks({ side }: { side: 'left' | 'right' }) {
  const xPos = side === 'left' ? '85%' : '15%';
  return (
    <>
      {/* Vertical crease */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none select-none"
        style={{
          left: xPos,
          width: '1px',
          background: 'rgba(139,119,90,0.06)',
          zIndex: 1,
        }}
        aria-hidden="true"
      />
      {/* Horizontal crease */}
      <div
        className="absolute left-0 right-0 pointer-events-none select-none"
        style={{
          top: '62%',
          height: '1px',
          background: 'rgba(139,119,90,0.05)',
          zIndex: 1,
        }}
        aria-hidden="true"
      />
    </>
  );
}

// ── Scattered standalone tape pieces (not on photos) ──

function StrayTape({ x, y, rotation, width, color }: {
  x: string; y: string; rotation: number; width: string; color: string;
}) {
  return (
    <div
      className="absolute pointer-events-none select-none rounded-sm"
      style={{
        left: x,
        top: y,
        width,
        height: '10px',
        transform: `rotate(${rotation}deg)`,
        background: color,
        border: '1px solid rgba(180,170,150,0.12)',
        zIndex: 2,
        // Slightly jagged edge via box-shadow
        boxShadow: '0 0 1px rgba(180,170,150,0.1)',
      }}
      aria-hidden="true"
    />
  );
}

// ── Washi tape strip (colored decorative tape, not on photos) ──

function WashiStrip({ x, y, rotation, color, width }: {
  x: string; y: string; rotation: number; color: string; width: string;
}) {
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: x,
        top: y,
        width,
        height: '6px',
        transform: `rotate(${rotation}deg)`,
        background: color,
        opacity: 0.35,
        borderRadius: '1px',
        zIndex: 2,
      }}
      aria-hidden="true"
    />
  );
}

// ── LEFT PAGE DECORATIONS ──

function LeftPageDecorations() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    >
      {/* ── SVG hand-drawn elements ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 500 800"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Pencil-style star — top left area */}
        <g transform="translate(45, 55)" opacity="0.16">
          <path d="M0,-7 L2,-2 L7,0 L2,2 L0,7 L-2,2 L-7,0 L-2,-2 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
          {/* Slightly offset duplicate for sketchy feel */}
          <path d="M0.3,-6.7 L2.2,-1.8 L7.2,0.3 L2.2,2.2 L0.3,7.2 L-2,2.2 L-6.8,0.3 L-2,-1.8 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.4" strokeLinecap="round" opacity="0.5" />
        </g>

        {/* Small botanical sprig — left edge */}
        <g transform="translate(28, 150)" opacity="0.14">
          <path d="M0,35 Q4,15 0,0 M0,18 Q-6,8 -10,0 M0,12 Q6,6 8,-2"
            fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" />
          {/* Tiny leaves */}
          <ellipse cx="-4" cy="10" rx="2.5" ry="1.2" fill="none" stroke="#5a4a3a" strokeWidth="0.5" transform="rotate(-30 -4 10)" />
          <ellipse cx="3" cy="7" rx="2.5" ry="1.2" fill="none" stroke="#5a4a3a" strokeWidth="0.5" transform="rotate(25 3 7)" />
        </g>

        {/* Small star cluster — mid left */}
        <g transform="translate(40, 300)" opacity="0.11">
          <path d="M0,-5 L1.2,-1.2 L5,0 L1.2,1.2 L0,5 L-1.2,1.2 L-5,0 L-1.2,-1.2 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinejoin="round" />
        </g>
        <g transform="translate(65, 325)" opacity="0.08">
          <path d="M0,-3.5 L0.8,-0.8 L3.5,0 L0.8,0.8 L0,3.5 L-0.8,0.8 L-3.5,0 L-0.8,-0.8 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" />
        </g>

        {/* Swirl — upper-mid area */}
        <g transform="translate(160, 200)" opacity="0.1">
          <path d="M0,0 C0,-12 12,-12 12,0 C12,12 0,14 -2,7 C-5,0 5,-5 7,2"
            fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" />
        </g>

        {/* Arrow doodle */}
        <g transform="translate(100, 480)" opacity="0.12">
          <path d="M0,0 L14,0 L14,-3 L20,2 L14,7 L14,4 L0,4 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Small flower sketch */}
        <g transform="translate(60, 620)" opacity="0.13">
          <circle cx="0" cy="0" r="2.5" fill="none" stroke="#5a4a3a" strokeWidth="0.5" />
          <circle cx="5" cy="-5" r="2" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="-5" cy="-5" r="2" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="5" cy="5" r="2" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="-5" cy="5" r="2" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <path d="M0,2.5 L0,10" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinecap="round" />
        </g>

        {/* Smiley face doodle */}
        <g transform="translate(320, 160)" opacity="0.1">
          <circle cx="0" cy="0" r="6" fill="none" stroke="#5a4a3a" strokeWidth="0.6" />
          <circle cx="-2.5" cy="-2" r="0.8" fill="#5a4a3a" />
          <circle cx="2.5" cy="-2" r="0.8" fill="#5a4a3a" />
          <path d="M-3,2.5 Q0,5.5 3,2.5" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinecap="round" />
        </g>

        {/* Decorative corner bracket — bottom left */}
        <g transform="translate(30, 720)" opacity="0.1">
          <path d="M0,15 L0,0 L15,0" fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" />
        </g>

        {/* Wavy decorative line — mid area */}
        <g transform="translate(200, 380)" opacity="0.09">
          <path d="M0,0 Q6,-4 12,0 Q18,4 24,0 Q30,-4 36,0 Q42,4 48,0"
            fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinecap="round" />
        </g>

        {/* Small heart */}
        <g transform="translate(380, 280)" opacity="0.11">
          <path d="M0,3 C0,0 -4,-3 -4,-3 C-4,-3 -8,0 -8,3 C-8,7 0,12 0,12 C0,12 8,7 8,3 C8,0 4,-3 4,-3 C4,-3 0,0 0,3 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" />
        </g>

        {/* Age spots / foxing — scattered unevenly */}
        {[
          [75, 170, 3], [80, 174, 1.5], [140, 640, 3.5], [146, 636, 1.2],
          [340, 110, 2.5], [410, 490, 3], [55, 700, 2], [200, 720, 2.5],
          [250, 100, 2], [390, 380, 1.8], [110, 340, 2.2], [300, 650, 2.8],
        ].map(([cx, cy, r], i) => (
          <circle key={`fox-l-${i}`} cx={cx} cy={cy} r={r}
            fill="#8b6914" opacity={0.03 + Math.random() * 0.04} />
        ))}

        {/* ── Collage / sticker elements ── */}

        {/* Polka dot patch — 3×3 grid of small dots */}
        <g transform="translate(350, 520)" opacity="0.12">
          {[0, 1, 2].flatMap((row) =>
            [0, 1, 2].map((col) => (
              <circle key={`${row}-${col}`} cx={col * 8} cy={row * 8} r="1.8"
                fill="none" stroke="#5a4a3a" strokeWidth="0.5" />
            ))
          )}
        </g>

        {/* Striped tape / washi — a short band of color */}
        <rect x="170" y="560" width="32" height="5" rx="1" fill="#c4a882" opacity="0.18" transform="rotate(-15 186 562)" />

        {/* Small colored rectangle (like a ticket stub) */}
        <g transform="translate(310, 680) rotate(-8)">
          <rect x="0" y="0" width="24" height="14" rx="1.5" fill="none" stroke="#8b7355" strokeWidth="0.6" opacity="0.15" />
          <line x1="6" y1="0" x2="6" y2="14" stroke="#8b7355" strokeWidth="0.4" opacity="0.12" />
        </g>

        {/* Tiny triangle decoration */}
        <g transform="translate(420, 180)" opacity="0.11">
          <path d="M0,8 L5,-4 L10,8 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" />
        </g>

        {/* Diamond shape */}
        <g transform="translate(130, 140)" opacity="0.09">
          <path d="M0,5 L5,0 L10,5 L5,10 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" />
        </g>
      </svg>

      {/* ── Handwritten text snippets ── */}
      <span className="absolute text-[13px] tracking-wider"
        style={{
          left: '16%', top: '7%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(70,50,30,0.2)', transform: 'rotate(-9deg)',
        }}>
        记得那天...
      </span>
      <span className="absolute text-[10px]"
        style={{
          left: '10%', top: '53%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(70,50,30,0.16)', transform: 'rotate(-5deg)',
        }}>
        珍藏
      </span>
      <span className="absolute text-[9px]"
        style={{
          left: '28%', top: '78%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(70,50,30,0.13)', transform: 'rotate(-3deg)',
        }}>
        2024.春
      </span>
      <span className="absolute text-[10px]"
        style={{
          left: '55%', top: '42%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(70,50,30,0.14)', transform: 'rotate(7deg)',
        }}>
        日常~
      </span>

      {/* ── Stray tape pieces ── */}
      <StrayTape x="20%" y="88%" rotation={-12} width="28px" color="rgba(255,250,240,0.45)" />
      <StrayTape x="62%" y="15%" rotation={8} width="22px" color="rgba(250,245,230,0.42)" />

      {/* ── Washi tape strips ── */}
      <WashiStrip x="14%" y="92%" rotation={-3} width="40px" color="#d4b896" />
      <WashiStrip x="58%" y="72%" rotation={-7} width="28px" color="#b8c9a8" />
    </div>
  );
}

// ── RIGHT PAGE DECORATIONS ──

function RightPageDecorations() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 500 800"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Large star — top right */}
        <g transform="translate(430, 45)" opacity="0.15">
          <path d="M0,-9 L2.5,-2.5 L9,0 L2.5,2.5 L0,9 L-2.5,2.5 L-9,0 L-2.5,-2.5 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinejoin="round" />
          <path d="M0.2,-8.5 L2.6,-2.3 L9.2,0.2 L2.6,2.7 L0.2,9.2 L-2.3,2.7 L-8.8,0.2 L-2.3,-2.3 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.35" strokeLinejoin="round" opacity="0.5" />
        </g>

        {/* Spiral doodle */}
        <g transform="translate(370, 195)" opacity="0.1">
          <path d="M0,0 C0,-10 10,-10 10,0 C10,10 0,12 -2,6 C-4,0 4,-4 6,2"
            fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" />
        </g>

        {/* Arrow */}
        <g transform="translate(280, 250)" opacity="0.12">
          <path d="M0,6 L0,0 L-3,3 M0,0 L3,3"
            fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" />
        </g>

        {/* Dots cluster */}
        <g transform="translate(320, 480)" opacity="0.1">
          <circle cx="0" cy="0" r="2" fill="#5a4a3a" />
          <circle cx="6" cy="4" r="1.2" fill="#5a4a3a" />
          <circle cx="-5" cy="6" r="1.5" fill="#5a4a3a" />
          <circle cx="3" cy="-5" r="1" fill="#5a4a3a" />
        </g>

        {/* Envelope sketch — bottom right */}
        <g transform="translate(390, 640)" opacity="0.12">
          <rect x="0" y="0" width="22" height="15" rx="1.5" fill="none" stroke="#5a4a3a" strokeWidth="0.7" />
          <path d="M0,0 L11,9 L22,0" fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinejoin="round" />
        </g>

        {/* Corner decoration — top right */}
        <g transform="translate(465, 25)" opacity="0.09">
          <path d="M0,0 L-18,0 L-18,18" fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinecap="round" />
        </g>

        {/* Crescent moon */}
        <g transform="translate(420, 310)" opacity="0.1">
          <path d="M0,-6 C4,-6 4,6 0,6 C2,4 2,-4 0,-6 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinejoin="round" />
        </g>

        {/* Lightning bolt */}
        <g transform="translate(250, 170)" opacity="0.1">
          <path d="M0,0 L-3,6 L0,6 L-2,12 L4,4 L1,4 L3,-2 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinejoin="round" />
        </g>

        {/* Small flower */}
        <g transform="translate(180, 680)" opacity="0.11">
          <circle cx="0" cy="0" r="2" fill="none" stroke="#5a4a3a" strokeWidth="0.5" />
          <circle cx="4" cy="-4" r="1.5" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="-4" cy="-4" r="1.5" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="4" cy="4" r="1.5" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="-4" cy="4" r="1.5" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <path d="M0,2 L0,7" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinecap="round" />
        </g>

        {/* Age spots */}
        {[
          [340, 290, 2.5], [345, 293, 1.2], [75, 540, 3.5], [195, 175, 2.2],
          [440, 440, 2.8], [115, 710, 2], [400, 120, 2], [280, 700, 2.5],
          [160, 350, 2], [380, 550, 1.8],
        ].map(([cx, cy, r], i) => (
          <circle key={`fox-r-${i}`} cx={cx} cy={cy} r={r}
            fill="#8b6914" opacity={0.03 + Math.random() * 0.04} />
        ))}

        {/* ── Collage / sticker elements ── */}

        {/* Polka dot patch */}
        <g transform="translate(60, 250)" opacity="0.11">
          {[0, 1, 2].flatMap((row) =>
            [0, 1, 2].map((col) => (
              <circle key={`${row}-${col}`} cx={col * 8} cy={row * 8} r="1.5"
                fill="none" stroke="#5a4a3a" strokeWidth="0.5" />
            ))
          )}
        </g>

        {/* Washi strip — colored tape */}
        <rect x="220" y="390" width="35" height="5" rx="1" fill="#c9b8a0" opacity="0.16" transform="rotate(12 237 392)" />

        {/* Small ticket-stub shape */}
        <g transform="translate(130, 450) rotate(6)">
          <rect x="0" y="0" width="20" height="12" rx="1" fill="none" stroke="#8b7355" strokeWidth="0.6" opacity="0.14" />
          <circle cx="10" cy="6" r="2" fill="none" stroke="#8b7355" strokeWidth="0.4" opacity="0.1" />
        </g>

        {/* Triangle sticker */}
        <g transform="translate(340, 140)" opacity="0.1">
          <path d="M0,10 L6,-4 L12,10 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" />
        </g>

        {/* Hexagon shape */}
        <g transform="translate(80, 420)" opacity="0.08">
          <path d="M0,4 L3,0 L9,0 L12,4 L9,8 L3,8 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" />
        </g>
      </svg>

      {/* ── Handwritten text ── */}
      <span className="absolute text-[12px] tracking-wide"
        style={{
          right: '18%', top: '10%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(70,50,30,0.19)', transform: 'rotate(7deg)',
        }}>
        好时光
      </span>
      <span className="absolute text-[9px]"
        style={{
          right: '14%', top: '58%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(70,50,30,0.15)', transform: 'rotate(4deg)',
        }}>
        日常碎片
      </span>
      <span className="absolute text-[10px]"
        style={{
          left: '22%', top: '85%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(70,50,30,0.13)', transform: 'rotate(-6deg)',
        }}>
        夏天见
      </span>
      <span className="absolute text-[8px]"
        style={{
          left: '50%', top: '32%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(70,50,30,0.12)', transform: 'rotate(-4deg)',
        }}>
        收藏这一刻
      </span>

      {/* ── Stray tape ── */}
      <StrayTape x="72%" y="88%" rotation={10} width="26px" color="rgba(250,245,235,0.43)" />
      <StrayTape x="18%" y="18%" rotation={-6} width="30px" color="rgba(255,250,242,0.44)" />

      {/* ── Washi tape ── */}
      <WashiStrip x="65%" y="22%" rotation={5} width="34px" color="#c9b8a0" />
      <WashiStrip x="25%" y="65%" rotation={-8} width="26px" color="#b0bfa0" />
    </div>
  );
}

// ── PagePaper (page background: aged paper + texture + lines + creases) ──

function PagePaper({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        // Multi-layer aged paper: stains, uneven oxidation, edge darkening
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(190,155,110,0.28) 0%, transparent 58%),
          radial-gradient(ellipse at 68% 65%, rgba(165,135,90,0.2) 0%, transparent 52%),
          radial-gradient(ellipse at 40% 82%, rgba(175,140,95,0.22) 0%, transparent 48%),
          radial-gradient(ellipse at 18% 55%, rgba(180,145,100,0.16) 0%, transparent 42%),
          radial-gradient(ellipse at 80% 30%, rgba(170,135,90,0.14) 0%, transparent 45%),
          linear-gradient(178deg,
            #f4ead2 0%,
            #f0e3c4 18%,
            #ece0c0 35%,
            #efe4c8 55%,
            #ede1c2 72%,
            #f1e6cc 100%
          )
        `,
        // Edge darkening: spine side + outer edges
        boxShadow: side === 'left'
          ? 'inset -4px 0 12px rgba(120,100,70,0.14), inset 2px 0 6px rgba(120,100,70,0.06), inset 0 2px 8px rgba(120,100,70,0.05), inset 0 -2px 8px rgba(120,100,70,0.05)'
          : 'inset 4px 0 12px rgba(120,100,70,0.14), inset -2px 0 6px rgba(120,100,70,0.06), inset 0 2px 8px rgba(120,100,70,0.05), inset 0 -2px 8px rgba(120,100,70,0.05)',
        // Subtle outer border for page edge definition
        borderLeft: side === 'left' ? '1px solid rgba(139,119,90,0.08)' : 'none',
        borderRight: side === 'right' ? '1px solid rgba(139,119,90,0.08)' : 'none',
      }}
    >
      <PaperTextureSVG />
      <RuledLines />
      <CreaseMarks side={side} />
      {side === 'left' ? <LeftPageDecorations /> : <RightPageDecorations />}
    </div>
  );
}

// ── Spine (book binding fold with depression shadow) ──

function Spine() {
  return (
    <div
      className="relative shrink-0 pointer-events-none select-none"
      style={{ width: 'clamp(20px, 3.5vw, 32px)' }}
      aria-hidden="true"
    >
      {/* Deep spine shadow */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg,
              rgba(110,85,55,0.2) 0%,
              rgba(100,75,45,0.1) 20%,
              rgba(100,75,45,0.03) 40%,
              rgba(100,75,45,0.01) 50%,
              rgba(100,75,45,0.03) 60%,
              rgba(100,75,45,0.1) 80%,
              rgba(110,85,55,0.2) 100%
            )
          `,
        }}
      />
      {/* Depression highlight (the slight ridge next to the fold) */}
      <div
        className="absolute top-[3%] bottom-[3%]"
        style={{
          left: '15%',
          width: '1px',
          background: 'rgba(180,160,130,0.15)',
        }}
      />
      <div
        className="absolute top-[3%] bottom-[3%]"
        style={{
          right: '15%',
          width: '1px',
          background: 'rgba(180,160,130,0.15)',
        }}
      />
      {/* Stitching — dashed line running vertically */}
      <div
        className="absolute left-1/2 top-[6%] bottom-[6%]"
        style={{
          width: '1px',
          background:
            'repeating-linear-gradient(rgba(80,55,30,0.18) 0px, rgba(80,55,30,0.18) 4px, transparent 4px, transparent 10px)',
        }}
      />
    </div>
  );
}

// ── TapePiece (on polaroid, now with position variation) ──

// Tape position: top-center, top-left, top-right, bottom-left, bottom-right
type TapePos = 'tc' | 'tl' | 'tr' | 'bl' | 'br';

function tapePosition(seed: number): { pos: TapePos; rotation: number } {
  const positions: TapePos[] = ['tc', 'tc', 'tl', 'tr', 'bl', 'br'];
  const pos = positions[seed % positions.length];
  const rotation = (seed * 13) % 12 - 6;
  return { pos, rotation };
}

function tapeStyle(pos: TapePos): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    zIndex: 10,
    borderRadius: '1px',
  };
  switch (pos) {
    case 'tc':
      return { ...base, top: '-10px', left: '50%', transform: 'translateX(-50%)' };
    case 'tl':
      return { ...base, top: '-8px', left: '-6px' };
    case 'tr':
      return { ...base, top: '-8px', right: '-6px' };
    case 'bl':
      return { ...base, bottom: '22%', left: '-8px' };
    case 'br':
      return { ...base, bottom: '22%', right: '-8px' };
  }
}

function TapePiece({ seed }: { seed: number }) {
  const { pos, rotation } = tapePosition(seed);
  const hue = seed % 4;
  const color =
    hue === 0 ? 'rgba(252,248,238,0.52)' :
    hue === 1 ? 'rgba(248,242,228,0.5)' :
    hue === 2 ? 'rgba(250,245,235,0.54)' :
    'rgba(245,238,220,0.48)';

  return (
    <div
      style={{
        ...tapeStyle(pos),
        width: `${26 + (seed % 14)}px`,
        height: `${10 + (seed % 7)}px`,
        background: color,
        border: '1px solid rgba(180,170,150,0.13)',
        transform: tapeStyle(pos).transform
          ? `${tapeStyle(pos).transform} rotate(${rotation}deg)`
          : `rotate(${rotation}deg)`,
        // Slightly uneven edge effect
        boxShadow: '0 0 1px rgba(180,170,145,0.12), inset 0 0 2px rgba(255,255,250,0.3)',
      }}
      aria-hidden="true"
    />
  );
}

// ── PolaroidCard (aged off-white, better shadow, varied tape) ──

function PolaroidCard({
  photo,
  spot,
  onView,
}: {
  photo: PolaroidPhoto;
  spot: Spot;
  onView: () => void;
}) {
  const tapeSeed = photo.id.charCodeAt(0) + photo.id.charCodeAt(photo.id.length - 1);

  return (
    <motion.div
      className="absolute group"
      style={{
        left: `${spot.x}%`,
        top: `${spot.y}%`,
        zIndex: spot.z,
        transform: `rotate(${spot.rotation}deg)`,
      }}
      whileHover={{
        y: -14,
        scale: 1.06,
        zIndex: 50,
        rotate: spot.rotation * 0.15,
        transition: { type: 'spring', stiffness: 260, damping: 16 },
      }}
      onClick={onView}
    >
      <TapePiece seed={tapeSeed} />

      {/* Card body — aged off-white, not pure white */}
      <div
        className="rounded-sm flex flex-col cursor-pointer"
        style={{
          width: 'clamp(130px, 16vw, 190px)',
          padding: 'clamp(5px, 0.7vw, 9px)',
          paddingBottom: 'clamp(24px, 3vw, 32px)',
          // Aged off-white base with subtle warm tint
          background: 'linear-gradient(180deg, #faf5ea 0%, #f7f0e2 50%, #f5eddc 100%)',
          // Multi-layer shadow for "pasted on paper" depth
          boxShadow: `
            0 1px 3px rgba(0,0,0,0.06),
            0 3px 8px rgba(0,0,0,0.05),
            0 0 0 1px rgba(0,0,0,0.02),
            inset 0 0 0 0.5px rgba(200,180,150,0.15)
          `,
          // Subtle inner glow for edge wear
          border: '0.5px solid rgba(180,160,130,0.12)',
        }}
      >
        {/* Image */}
        <div className="aspect-square overflow-hidden rounded-sm bg-gray-100"
          style={{
            // Subtle inner shadow for photo recess
            boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.04)',
          }}
        >
          {photo.imageUrl ? (
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${photo.colors[0]}, ${photo.colors[1]})`,
              }}
            />
          )}
        </div>

        {/* Caption in handwriting font */}
        <p
          className="text-center text-[10px] sm:text-[11px] mt-2 px-0.5 truncate leading-tight"
          style={{
            color: 'rgba(70,50,30,0.48)',
            fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          }}
        >
          {photo.title}
        </p>
      </div>
    </motion.div>
  );
}

// ── LightboxModal (aged polaroid style) ──

function LightboxModal({
  photo,
  onClose,
}: {
  photo: PolaroidPhoto;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="rounded-sm flex flex-col shadow-2xl"
        style={{
          width: 'min(420px, 85vw)',
          padding: 'min(16px, 2vw)',
          paddingBottom: 'min(42px, 5vw)',
          background: 'linear-gradient(180deg, #faf5ea 0%, #f7f0e2 50%, #f5eddc 100%)',
          border: '1px solid rgba(180,160,130,0.15)',
        }}
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-square overflow-hidden rounded-sm bg-gray-100"
          style={{ boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.04)' }}>
          {photo.imageUrl ? (
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${photo.colors[0]}, ${photo.colors[1]})`,
              }}
            />
          )}
        </div>
        <p
          className="text-center text-base font-medium mt-3"
          style={{
            color: '#5a4a3a',
            fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          }}
        >
          {photo.title}
        </p>
        {photo.date && (
          <p className="text-center text-xs text-gray-400 mt-1">{photo.date}</p>
        )}
      </motion.div>

      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors text-lg"
      >
        ✕
      </button>
    </motion.div>
  );
}

// ── PolaroidScatter (main export) ──

export default function PolaroidScatter({
  photos,
}: {
  photos: PolaroidPhoto[];
}) {
  const [viewPhoto, setViewPhoto] = useState<PolaroidPhoto | null>(null);
  const spots = useMemo(() => scatter(photos), [photos.map((p) => p.id).join()]);
  const minHeight = Math.max(520, photos.length * 200 + 280);

  if (photos.length === 0) {
    return <p className="text-sm text-text-muted">暂无日常碎片</p>;
  }

  const leftPhotos = photos
    .map((p, i) => ({ photo: p, spot: spots[i] }))
    .filter(({ spot }) => spot.page === 'left');

  const rightPhotos = photos
    .map((p, i) => ({ photo: p, spot: spots[i] }))
    .filter(({ spot }) => spot.page === 'right');

  return (
    <>
      <div
        className="flex rounded-lg overflow-hidden"
        style={{
          minHeight: `${minHeight}px`,
          boxShadow:
            '0 3px 20px rgba(0,0,0,0.08), 0 1px 5px rgba(0,0,0,0.05)',
        }}
      >
        {/* Left page */}
        <div className="relative flex-1" style={{ minWidth: 0 }}>
          <PagePaper side="left" />
          {leftPhotos.map(({ photo, spot }) => (
            <PolaroidCard
              key={photo.id}
              photo={photo}
              spot={spot}
              onView={() => setViewPhoto(photo)}
            />
          ))}
        </div>

        <Spine />

        {/* Right page */}
        <div className="relative flex-1" style={{ minWidth: 0 }}>
          <PagePaper side="right" />
          {rightPhotos.map(({ photo, spot }) => (
            <PolaroidCard
              key={photo.id}
              photo={photo}
              spot={spot}
              onView={() => setViewPhoto(photo)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {viewPhoto && (
          <LightboxModal
            photo={viewPhoto}
            onClose={() => setViewPhoto(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
