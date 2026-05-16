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

// ── Photo distribution (unchanged logic) ──

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
    y: 3 + Math.random() * 70,
    rotation: (Math.random() - 0.5) * 60, // ±30°
    z: Math.floor(Math.random() * 14),
    page,
  }));
}

// ══════════════════════════════════════════
// SVG FILTERS — paper texture + rough edges
// ══════════════════════════════════════════

const ROUGH_EDGE_ID = 'rough-edge-filter';
const PAPER_FIBER_ID = 'paper-fiber-filter';
const PAPER_STAIN_ID = 'paper-stain-filter';
const PAGE_CURL_ID = 'page-curl-filter';

function AllSVGFilters() {
  return (
    <svg
      width="0" height="0"
      style={{ position: 'absolute', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        {/* Rough / worn page edge */}
        <filter id={ROUGH_EDGE_ID} x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves="3"
            stitchTiles="stitch"
            result="edgeNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="edgeNoise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
            result="roughShape"
          />
          {/* Soften the displaced edge */}
          <feGaussianBlur in="roughShape" stdDeviation="0.3" result="softEdge" />
        </filter>

        {/* Fine paper fiber noise */}
        <filter id={PAPER_FIBER_ID} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.7"
            numOctaves="5"
            stitchTiles="stitch"
            result="fiber"
          />
          <feColorMatrix
            type="matrix"
            values="
              0 0 0 0 0.40
              0 0 0 0 0.33
              0 0 0 0 0.23
              0 0 0 0.05 0
            "
            in="fiber"
          />
        </filter>

        {/* Coarse stain / discoloration */}
        <filter id={PAPER_STAIN_ID} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01"
            numOctaves="2"
            stitchTiles="stitch"
            result="stain"
          />
          <feColorMatrix
            type="matrix"
            values="
              0 0 0 0 0.32
              0 0 0 0 0.25
              0 0 0 0 0.16
              0 0 0 0.035 0
            "
            in="stain"
          />
        </filter>
      </defs>
    </svg>
  );
}

// ════════════════════════════════
// PAPER TEXTURE OVERLAY
// ════════════════════════════════

function PaperTextureOverlay() {
  return (
    <>
      {/* Fine fiber */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          zIndex: 1,
          filter: `url(#${PAPER_FIBER_ID})`,
          mixBlendMode: 'multiply',
          background: 'transparent',
        }}
        aria-hidden="true"
      />
      {/* Coarse stain */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          zIndex: 1,
          filter: `url(#${PAPER_STAIN_ID})`,
          mixBlendMode: 'multiply',
          background: 'transparent',
        }}
        aria-hidden="true"
      />
    </>
  );
}

// ════════════════════════════════
// NOTEBOOK RULED LINES (fainter)
// ════════════════════════════════

function RuledLines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      style={{
        zIndex: 1,
        backgroundImage:
          'repeating-linear-gradient(transparent, transparent 27px, rgba(156,138,115,0.05) 27px, rgba(156,138,115,0.05) 28px)',
        maskImage:
          'linear-gradient(to bottom, transparent 4%, black 10%, black 90%, transparent 96%), ' +
          'linear-gradient(to right, transparent 8%, black 12%, black 88%, transparent 92%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 4%, black 10%, black 90%, transparent 96%), ' +
          'linear-gradient(to right, transparent 8%, black 12%, black 88%, transparent 92%)',
      }}
      aria-hidden="true"
    />
  );
}

// ════════════════════════════════
// CORNER CURL (subtle lifted paper effect)
// ════════════════════════════════

function CornerCurl({ corner }: { corner: 'tr' | 'bl' }) {
  const isTR = corner === 'tr';
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        ...(isTR ? { top: 0, right: 0 } : { bottom: 0, left: 0 }),
        width: 'clamp(40px, 8vw, 70px)',
        height: 'clamp(40px, 8vw, 70px)',
        zIndex: 3,
        background: isTR
          ? 'radial-gradient(ellipse at 100% 0%, rgba(139,119,90,0.12) 0%, rgba(139,119,90,0.04) 40%, transparent 70%)'
          : 'radial-gradient(ellipse at 0% 100%, rgba(139,119,90,0.10) 0%, rgba(139,119,90,0.03) 40%, transparent 70%)',
        // Slight rotation for the curl shadow
        transform: isTR ? 'rotate(2deg)' : 'rotate(-2deg)',
      }}
      aria-hidden="true"
    />
  );
}

// ════════════════════════════════
// CREASE / FOLD MARKS
// ════════════════════════════════

function CreaseMarks({ side }: { side: 'left' | 'right' }) {
  const xPos = side === 'left' ? '82%' : '18%';
  return (
    <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 1 }} aria-hidden="true">
      {/* Vertical crease */}
      <div
        className="absolute top-0 bottom-0"
        style={{
          left: xPos,
          width: '1px',
          background:
            'linear-gradient(transparent 5%, rgba(139,119,90,0.06) 20%, rgba(139,119,90,0.08) 50%, rgba(139,119,90,0.06) 80%, transparent 95%)',
        }}
      />
      {/* Horizontal crease */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: '58%',
          height: '1px',
          background:
            'linear-gradient(to right, transparent 8%, rgba(139,119,90,0.05) 30%, rgba(139,119,90,0.07) 50%, rgba(139,119,90,0.05) 70%, transparent 92%)',
        }}
      />
    </div>
  );
}

// ════════════════════════════════
// INNER PAGE CURVE (near spine)
// ════════════════════════════════

function SpineCurve({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none select-none"
      style={{
        zIndex: 3,
        width: 'clamp(16px, 3vw, 28px)',
        ...(side === 'left' ? { right: 0 } : { left: 0 }),
        background:
          side === 'left'
            ? 'linear-gradient(90deg, transparent 0%, rgba(139,119,90,0.03) 50%, rgba(100,80,50,0.10) 100%)'
            : 'linear-gradient(90deg, rgba(100,80,50,0.10) 0%, rgba(139,119,90,0.03) 50%, transparent 100%)',
      }}
      aria-hidden="true"
    />
  );
}

// ════════════════════════════════
// STRAY TAPE (standalone, not on photo)
// ════════════════════════════════

function StrayTape({ x, y, rotation, w, color }: {
  x: string; y: string; rotation: number; w: string; color: string;
}) {
  return (
    <div
      className="absolute pointer-events-none select-none rounded-sm"
      style={{
        left: x, top: y, width: w, height: '10px',
        transform: `rotate(${rotation}deg)`,
        background: color,
        border: '1px solid rgba(180,170,150,0.1)',
        boxShadow: '0 0 1px rgba(180,170,145,0.1), 1px 2px 3px rgba(0,0,0,0.04)',
        zIndex: 2,
      }}
      aria-hidden="true"
    />
  );
}

function WashiStrip({ x, y, rotation, color, w }: {
  x: string; y: string; rotation: number; color: string; w: string;
}) {
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: x, top: y, width: w, height: '5px',
        transform: `rotate(${rotation}deg)`,
        background: color,
        opacity: 0.3,
        borderRadius: '1px',
        zIndex: 2,
      }}
      aria-hidden="true"
    />
  );
}

// ════════════════════════════════
// LEFT PAGE DECORATIONS
// ════════════════════════════════

function LeftPageDecorations() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 800" preserveAspectRatio="xMidYMid meet">
        {/* — Pencil star (double-line for sketchy feel) — */}
        <g transform="translate(48, 60)" opacity="0.15">
          <path d="M0,-7.5 L2.2,-2.2 L7.5,0 L2.2,2.2 L0,7.5 L-2.2,2.2 L-7.5,0 L-2.2,-2.2 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M0.3,-7 L2.3,-2 L7.8,0.3 L2.3,2.3 L0.3,7.8 L-2,2.3 L-7.2,0.3 L-2,-2 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.35" strokeLinecap="round" opacity="0.5" />
        </g>

        {/* — Botanical sprig — */}
        <g transform="translate(32, 170)" opacity="0.12">
          <path d="M0,38 Q5,16 0,0 M0,20 Q-7,9 -12,0 M0,14 Q7,7 10,-2"
            fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" />
          <ellipse cx="-5" cy="12" rx="3" ry="1.3" fill="none" stroke="#5a4a3a" strokeWidth="0.5" transform="rotate(-30 -5 12)" />
          <ellipse cx="4" cy="8" rx="3" ry="1.3" fill="none" stroke="#5a4a3a" strokeWidth="0.5" transform="rotate(25 4 8)" />
        </g>

        {/* — Star cluster — */}
        <g transform="translate(45, 320)" opacity="0.1">
          <path d="M0,-5 L1.2,-1.2 L5,0 L1.2,1.2 L0,5 L-1.2,1.2 L-5,0 L-1.2,-1.2 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinejoin="round" />
        </g>
        <g transform="translate(70, 345)" opacity="0.07">
          <path d="M0,-3.5 L0.8,-0.8 L3.5,0 L0.8,0.8 L0,3.5 L-0.8,0.8 L-3.5,0 L-0.8,-0.8 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" />
        </g>

        {/* — Swirl — */}
        <g transform="translate(170, 210)" opacity="0.09">
          <path d="M0,0 C0,-14 14,-14 14,0 C14,14 0,16 -2,8 C-5,0 5,-6 8,3"
            fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" />
        </g>

        {/* — Arrow — */}
        <g transform="translate(110, 490)" opacity="0.11">
          <path d="M0,0 L15,0 L15,-3 L22,2 L15,7 L15,4 L0,4 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* — Flower sketch — */}
        <g transform="translate(70, 640)" opacity="0.12">
          <circle cx="0" cy="0" r="2.8" fill="none" stroke="#5a4a3a" strokeWidth="0.5" />
          <circle cx="5.5" cy="-5.5" r="2.2" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="-5.5" cy="-5.5" r="2.2" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="5.5" cy="5.5" r="2.2" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="-5.5" cy="5.5" r="2.2" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <path d="M0,2.8 L0,11" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinecap="round" />
        </g>

        {/* — Smiley — */}
        <g transform="translate(320, 170)" opacity="0.09">
          <circle cx="0" cy="0" r="7" fill="none" stroke="#5a4a3a" strokeWidth="0.6" />
          <circle cx="-2.8" cy="-2.5" r="1" fill="#5a4a3a" />
          <circle cx="2.8" cy="-2.5" r="1" fill="#5a4a3a" />
          <path d="M-3.5,2.5 Q0,6 3.5,2.5" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinecap="round" />
        </g>

        {/* — Corner bracket — */}
        <g transform="translate(34, 735)" opacity="0.09">
          <path d="M0,18 L0,0 L18,0" fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" />
        </g>

        {/* — Wavy line — */}
        <g transform="translate(200, 390)" opacity="0.08">
          <path d="M0,0 Q7,-5 14,0 Q21,5 28,0 Q35,-5 42,0 Q49,5 56,0"
            fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinecap="round" />
        </g>

        {/* — Heart — */}
        <g transform="translate(390, 300)" opacity="0.1">
          <path d="M0,4 C0,0 -5,-4 -5,-4 C-5,-4 -10,0 -10,4 C-10,8 0,14 0,14 C0,14 10,8 10,4 C10,0 5,-4 5,-4 C5,-4 0,0 0,4 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" />
        </g>

        {/* — Coffee ring stain — */}
        <g transform="translate(200, 620)" opacity="0.06">
          <circle cx="0" cy="0" r="14" fill="none" stroke="#6b4e2a" strokeWidth="2" />
          <circle cx="0" cy="0" r="12" fill="none" stroke="#6b4e2a" strokeWidth="0.8" opacity="0.6" />
          {/* Splatter dots */}
          <circle cx="16" cy="-8" r="0.8" fill="#6b4e2a" opacity="0.5" />
          <circle cx="-10" cy="16" r="0.6" fill="#6b4e2a" opacity="0.4" />
        </g>

        {/* — Polka dot patch — */}
        <g transform="translate(360, 540)" opacity="0.1">
          {[0, 1, 2].flatMap((r) =>
            [0, 1, 2].map((c) => (
              <circle key={`${r}-${c}`} cx={c * 9} cy={r * 9} r="2"
                fill="none" stroke="#5a4a3a" strokeWidth="0.5" />
            ))
          )}
        </g>

        {/* — Washi tape — */}
        <rect x="180" y="570" width="36" height="6" rx="1" fill="#d4b896" opacity="0.16" transform="rotate(-14 198 573)" />

        {/* — Ticket stub — */}
        <g transform="translate(320, 700) rotate(-9)">
          <rect x="0" y="0" width="26" height="16" rx="1.5" fill="none" stroke="#8b7355" strokeWidth="0.6" opacity="0.14" />
          <line x1="7" y1="0" x2="7" y2="16" stroke="#8b7355" strokeWidth="0.4" opacity="0.1" />
          <circle cx="16" cy="8" r="2.5" fill="none" stroke="#8b7355" strokeWidth="0.4" opacity="0.1" />
        </g>

        {/* — Triangle — */}
        <g transform="translate(430, 190)" opacity="0.1">
          <path d="M0,9 L6,-5 L12,9 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" />
        </g>

        {/* — Diamond — */}
        <g transform="translate(140, 150)" opacity="0.08">
          <path d="M0,6 L6,0 L12,6 L6,12 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" />
        </g>

        {/* — Cross / plus — */}
        <g transform="translate(280, 110)" opacity="0.1">
          <path d="M0,0 L0,14 M-7,7 L7,7" fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinecap="round" />
        </g>

        {/* — Age spots — */}
        {[
          [80, 180, 3.5], [86, 184, 1.8], [150, 660, 4], [156, 655, 1.5],
          [350, 130, 3], [420, 510, 3.5], [65, 720, 2.5], [210, 740, 3],
          [260, 105, 2.2], [400, 400, 2], [120, 370, 2.8], [310, 670, 3.2],
        ].map(([cx, cy, r], i) => (
          <circle key={`fl-${i}`} cx={cx} cy={cy} r={r}
            fill="#8b6914" opacity={0.025 + Math.random() * 0.04} />
        ))}
      </svg>

      {/* Handwritten text */}
      <span className="absolute text-[13px] tracking-wider"
        style={{
          left: '18%', top: '6%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(65,45,25,0.19)', transform: 'rotate(-10deg)',
        }}>记得那天...</span>

      <span className="absolute text-[10px]"
        style={{
          left: '12%', top: '52%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(65,45,25,0.15)', transform: 'rotate(-6deg)',
        }}>珍藏</span>

      <span className="absolute text-[9px]"
        style={{
          left: '30%', top: '80%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(65,45,25,0.12)', transform: 'rotate(-4deg)',
        }}>2024.春</span>

      <span className="absolute text-[10px]"
        style={{
          left: '52%', top: '44%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(65,45,25,0.13)', transform: 'rotate(6deg)',
        }}>日常~</span>

      {/* Standalone tape + washi */}
      <StrayTape x="22%" y="90%" rotation={-14} w="30px" color="rgba(252,248,238,0.42)" />
      <StrayTape x="60%" y="16%" rotation={9} w="24px" color="rgba(248,242,228,0.4)" />
      <WashiStrip x="16%" y="94%" rotation={-3} w="44px" color="#d4b896" />
      <WashiStrip x="56%" y="74%" rotation={-8} w="30px" color="#b8c9a8" />
    </div>
  );
}

// ════════════════════════════════
// RIGHT PAGE DECORATIONS
// ════════════════════════════════

function RightPageDecorations() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 800" preserveAspectRatio="xMidYMid meet">
        {/* — Large star — */}
        <g transform="translate(435, 48)" opacity="0.14">
          <path d="M0,-10 L2.8,-2.8 L10,0 L2.8,2.8 L0,10 L-2.8,2.8 L-10,0 L-2.8,-2.8 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinejoin="round" />
          <path d="M0.2,-9 L2.9,-2.6 L10.2,0.2 L2.9,3 L0.2,10.2 L-2.6,3 L-9.8,0.2 L-2.6,-2.6 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.35" strokeLinejoin="round" opacity="0.5" />
        </g>

        {/* — Spiral — */}
        <g transform="translate(380, 205)" opacity="0.09">
          <path d="M0,0 C0,-12 12,-12 12,0 C12,12 0,14 -2,7 C-5,0 5,-5 7,3"
            fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" />
        </g>

        {/* — Arrow — */}
        <g transform="translate(290, 260)" opacity="0.11">
          <path d="M0,7 L0,0 L-3.5,3.5 M0,0 L3.5,3.5"
            fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" />
        </g>

        {/* — Dots cluster — */}
        <g transform="translate(330, 500)" opacity="0.09">
          <circle cx="0" cy="0" r="2.2" fill="#5a4a3a" />
          <circle cx="7" cy="4" r="1.3" fill="#5a4a3a" />
          <circle cx="-6" cy="7" r="1.6" fill="#5a4a3a" />
          <circle cx="4" cy="-6" r="1.1" fill="#5a4a3a" />
        </g>

        {/* — Envelope — */}
        <g transform="translate(395, 650)" opacity="0.11">
          <rect x="0" y="0" width="24" height="16" rx="1.5" fill="none" stroke="#5a4a3a" strokeWidth="0.7" />
          <path d="M0,0 L12,10 L24,0" fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinejoin="round" />
        </g>

        {/* — Corner decoration — */}
        <g transform="translate(470, 28)" opacity="0.08">
          <path d="M0,0 L-20,0 L-20,20" fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinecap="round" />
        </g>

        {/* — Crescent moon — */}
        <g transform="translate(430, 330)" opacity="0.09">
          <path d="M0,-7 C5,-7 5,7 0,7 C2.5,5 2.5,-5 0,-7 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinejoin="round" />
        </g>

        {/* — Lightning — */}
        <g transform="translate(255, 180)" opacity="0.09">
          <path d="M0,0 L-3.5,7 L0,7 L-2.5,14 L5,5 L1.5,5 L4,-3 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinejoin="round" />
        </g>

        {/* — Small flower — */}
        <g transform="translate(190, 690)" opacity="0.1">
          <circle cx="0" cy="0" r="2.2" fill="none" stroke="#5a4a3a" strokeWidth="0.5" />
          <circle cx="4.5" cy="-4.5" r="1.8" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="-4.5" cy="-4.5" r="1.8" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="4.5" cy="4.5" r="1.8" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="-4.5" cy="4.5" r="1.8" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <path d="M0,2.2 L0,8" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinecap="round" />
        </g>

        {/* — Coffee ring — */}
        <g transform="translate(100, 380)" opacity="0.05">
          <circle cx="0" cy="0" r="12" fill="none" stroke="#6b4e2a" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="10" fill="none" stroke="#6b4e2a" strokeWidth="0.7" opacity="0.5" />
        </g>

        {/* — Polka dots — */}
        <g transform="translate(70, 260)" opacity="0.1">
          {[0, 1, 2].flatMap((r) =>
            [0, 1, 2].map((c) => (
              <circle key={`${r}-${c}`} cx={c * 9} cy={r * 9} r="1.8"
                fill="none" stroke="#5a4a3a" strokeWidth="0.5" />
            ))
          )}
        </g>

        {/* — Washi tape — */}
        <rect x="230" y="400" width="38" height="6" rx="1" fill="#c9b8a0" opacity="0.15" transform="rotate(10 249 403)" />

        {/* — Ticket stub — */}
        <g transform="translate(140, 470) rotate(7)">
          <rect x="0" y="0" width="22" height="14" rx="1" fill="none" stroke="#8b7355" strokeWidth="0.6" opacity="0.13" />
          <circle cx="11" cy="7" r="2.5" fill="none" stroke="#8b7355" strokeWidth="0.4" opacity="0.09" />
        </g>

        {/* — Triangle sticker — */}
        <g transform="translate(350, 150)" opacity="0.09">
          <path d="M0,11 L7,-5 L14,11 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" />
        </g>

        {/* — Hexagon — */}
        <g transform="translate(90, 440)" opacity="0.07">
          <path d="M0,4.5 L3.5,0 L10,0 L13.5,4.5 L10,9 L3.5,9 Z"
            fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" />
        </g>

        {/* — Squiggle line — */}
        <g transform="translate(280, 620)" opacity="0.08">
          <path d="M0,0 Q5,-5 10,2 Q15,9 20,2 Q25,-5 30,2 Q35,9 40,0"
            fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinecap="round" />
        </g>

        {/* — Age spots — */}
        {[
          [350, 310, 3], [356, 314, 1.5], [85, 560, 4], [205, 190, 2.5],
          [450, 460, 3.2], [125, 735, 2.2], [415, 135, 2.5], [295, 720, 3],
          [170, 370, 2.2], [395, 570, 2],
        ].map(([cx, cy, r], i) => (
          <circle key={`fr-${i}`} cx={cx} cy={cy} r={r}
            fill="#8b6914" opacity={0.025 + Math.random() * 0.04} />
        ))}
      </svg>

      {/* Handwritten text */}
      <span className="absolute text-[12px] tracking-wide"
        style={{
          right: '20%', top: '9%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(65,45,25,0.18)', transform: 'rotate(8deg)',
        }}>好时光</span>

      <span className="absolute text-[9px]"
        style={{
          right: '16%', top: '56%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(65,45,25,0.14)', transform: 'rotate(5deg)',
        }}>日常碎片</span>

      <span className="absolute text-[10px]"
        style={{
          left: '24%', top: '86%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(65,45,25,0.12)', transform: 'rotate(-7deg)',
        }}>夏天见</span>

      <span className="absolute text-[8px]"
        style={{
          left: '48%', top: '34%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(65,45,25,0.11)', transform: 'rotate(-5deg)',
        }}>收藏这一刻</span>

      {/* Standalone tape + washi */}
      <StrayTape x="68%" y="90%" rotation={12} w="28px" color="rgba(250,245,235,0.4)" />
      <StrayTape x="20%" y="20%" rotation={-7} w="32px" color="rgba(252,248,240,0.42)" />
      <WashiStrip x="62%" y="24%" rotation={6} w="36px" color="#c9b8a0" />
      <WashiStrip x="28%" y="68%" rotation={-9} w="28px" color="#b0bfa0" />
    </div>
  );
}

// ════════════════════════════════
// PAGE PAPER (per-page background)
// ════════════════════════════════

function PagePaper({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        // Aged paper: stains + uneven oxidation + edge darkening
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(190,155,110,0.27) 0%, transparent 58%),
          radial-gradient(ellipse at 68% 65%, rgba(165,135,90,0.19) 0%, transparent 52%),
          radial-gradient(ellipse at 40% 82%, rgba(175,140,95,0.21) 0%, transparent 48%),
          radial-gradient(ellipse at 18% 55%, rgba(180,145,100,0.15) 0%, transparent 42%),
          radial-gradient(ellipse at 80% 30%, rgba(170,135,90,0.13) 0%, transparent 45%),
          linear-gradient(178deg,
            #f4ead2 0%,
            #f0e3c4 18%,
            #ece0c0 35%,
            #efe4c8 55%,
            #ede1c2 72%,
            #f1e6cc 100%
          )
        `,
        // Edge darkening: spine side heavier, outer edges lighter
        boxShadow: side === 'left'
          ? 'inset -5px 0 14px rgba(120,100,70,0.15), inset 2px 0 7px rgba(120,100,70,0.07), inset 0 3px 10px rgba(120,100,70,0.06), inset 0 -3px 10px rgba(120,100,70,0.06)'
          : 'inset 5px 0 14px rgba(120,100,70,0.15), inset -2px 0 7px rgba(120,100,70,0.07), inset 0 3px 10px rgba(120,100,70,0.06), inset 0 -3px 10px rgba(120,100,70,0.06)',
        borderLeft: side === 'left' ? '0.5px solid rgba(139,119,90,0.07)' : 'none',
        borderRight: side === 'right' ? '0.5px solid rgba(139,119,90,0.07)' : 'none',
      }}
    >
      <PaperTextureOverlay />
      <RuledLines />
      <CreaseMarks side={side} />
      {/* Corner curls: TR on right page, BL on left page */}
      {side === 'left' && <CornerCurl corner="bl" />}
      {side === 'right' && <CornerCurl corner="tr" />}
      {/* Inner curve near spine */}
      <SpineCurve side={side} />
      {/* Decorations */}
      {side === 'left' ? <LeftPageDecorations /> : <RightPageDecorations />}
    </div>
  );
}

// ════════════════════════════════
// SPINE (thick book binding structure)
// ════════════════════════════════

function Spine() {
  return (
    <div
      className="relative shrink-0 pointer-events-none select-none"
      style={{ width: 'clamp(22px, 4vw, 34px)' }}
      aria-hidden="true"
    >
      {/* Deep depression shadow — the fold */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg,
              rgba(105,80,50,0.22) 0%,
              rgba(95,70,42,0.12) 15%,
              rgba(95,70,42,0.04) 35%,
              rgba(95,70,42,0.01) 50%,
              rgba(95,70,42,0.04) 65%,
              rgba(95,70,42,0.12) 85%,
              rgba(105,80,50,0.22) 100%
            )
          `,
        }}
      />
      {/* Ridge highlights — the slight peaks on either side of the fold */}
      <div
        className="absolute top-[2%] bottom-[2%]"
        style={{
          left: '12%',
          width: '2px',
          background: 'rgba(185,165,135,0.18)',
        }}
      />
      <div
        className="absolute top-[2%] bottom-[2%]"
        style={{
          right: '12%',
          width: '2px',
          background: 'rgba(185,165,135,0.18)',
        }}
      />
      {/* Binding stitch — thicker dashed line */}
      <div
        className="absolute left-1/2 top-[5%] bottom-[5%]"
        style={{
          width: '2px',
          background:
            'repeating-linear-gradient(rgba(75,50,28,0.18) 0px, rgba(75,50,28,0.18) 5px, transparent 5px, transparent 12px)',
        }}
      />
      {/* Secondary stitch — offset */}
      <div
        className="absolute top-[5%] bottom-[5%]"
        style={{
          left: '30%',
          width: '1px',
          background:
            'repeating-linear-gradient(rgba(75,50,28,0.10) 0px, rgba(75,50,28,0.10) 3px, transparent 3px, transparent 10px)',
        }}
      />
      <div
        className="absolute top-[5%] bottom-[5%]"
        style={{
          right: '30%',
          width: '1px',
          background:
            'repeating-linear-gradient(rgba(75,50,28,0.10) 0px, rgba(75,50,28,0.10) 3px, transparent 3px, transparent 10px)',
        }}
      />
    </div>
  );
}

// ════════════════════════════════
// TAPE PIECE (on polaroid, varied positions)
// ════════════════════════════════

type TapePos = 'tc' | 'tl' | 'tr';

function tapePosition(seed: number): { pos: TapePos; rotation: number } {
  const positions: TapePos[] = ['tc', 'tc', 'tl', 'tr', 'tl', 'tr', 'tc'];
  const pos = positions[seed % positions.length];
  const rotation = (seed * 13) % 14 - 7;
  return { pos, rotation };
}

function posStyle(pos: TapePos): React.CSSProperties {
  switch (pos) {
    case 'tc': return { top: '-11px', left: '50%' };
    case 'tl': return { top: '-9px', left: '-8px' };
    case 'tr': return { top: '-9px', right: '-8px' };
  }
}

function TapePiece({ seed }: { seed: number }) {
  const { pos, rotation } = tapePosition(seed);
  const hue = seed % 4;
  const color =
    hue === 0 ? 'rgba(252,248,238,0.48)' :
    hue === 1 ? 'rgba(248,242,228,0.46)' :
    hue === 2 ? 'rgba(250,245,235,0.5)' :
    'rgba(245,238,220,0.44)';
  const base = posStyle(pos);
  const width = 28 + (seed % 16);

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 10,
        borderRadius: '1px',
        ...base,
        width: `${width}px`,
        height: `${10 + (seed % 6)}px`,
        background: color,
        border: '0.5px solid rgba(180,170,145,0.12)',
        transform: base.left === '50%'
          ? `translateX(-50%) rotate(${rotation}deg)`
          : `rotate(${rotation}deg)`,
        // Shadow consistent with light from top-left
        boxShadow: '0 1px 2px rgba(0,0,0,0.05), 1px 2px 3px rgba(0,0,0,0.03), inset 0 0 2px rgba(255,255,250,0.25)',
      }}
      aria-hidden="true"
    />
  );
}

// ════════════════════════════════
// POLAROID CARD
// ════════════════════════════════

// Light from top-left: shadow offset down-right
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

      {/* Card body — aged off-white polaroid */}
      <div
        className="rounded-sm flex flex-col cursor-pointer"
        style={{
          width: 'clamp(130px, 16vw, 190px)',
          padding: 'clamp(5px, 0.7vw, 9px)',
          paddingBottom: 'clamp(24px, 3vw, 32px)',
          background: 'linear-gradient(180deg, #faf5ea 0%, #f7f0e2 50%, #f5eddc 100%)',
          // Shadow from top-left light: offset to bottom-right
          boxShadow: `
            2px 3px 6px rgba(0,0,0,0.06),
            3px 5px 12px rgba(0,0,0,0.04),
            0 0 0 1px rgba(0,0,0,0.02),
            inset 0 0 0 0.5px rgba(195,175,145,0.16)
          `,
          border: '0.5px solid rgba(175,155,125,0.13)',
        }}
      >
        {/* Image area */}
        <div
          className="aspect-square overflow-hidden rounded-sm bg-gray-100"
          style={{ boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.05)' }}
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

        {/* Caption */}
        <p
          className="text-center text-[10px] sm:text-[11px] mt-2 px-0.5 truncate leading-tight"
          style={{
            color: 'rgba(65,45,25,0.46)',
            fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          }}
        >
          {photo.title}
        </p>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════
// LIGHTBOX MODAL
// ════════════════════════════════

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
            <img src={photo.imageUrl} alt={photo.title}
              className="w-full h-full object-cover" draggable={false} />
          ) : (
            <div className="w-full h-full"
              style={{ background: `linear-gradient(135deg, ${photo.colors[0]}, ${photo.colors[1]})` }} />
          )}
        </div>
        <p className="text-center text-base font-medium mt-3"
          style={{ color: '#5a4a3a', fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive" }}>
          {photo.title}
        </p>
        {photo.date && <p className="text-center text-xs text-gray-400 mt-1">{photo.date}</p>}
      </motion.div>

      <button onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors text-lg">
        ✕
      </button>
    </motion.div>
  );
}

// ════════════════════════════════
// MAIN EXPORT — PolaroidScatter
// ════════════════════════════════

export default function PolaroidScatter({
  photos,
}: {
  photos: PolaroidPhoto[];
}) {
  const [viewPhoto, setViewPhoto] = useState<PolaroidPhoto | null>(null);
  const spots = useMemo(() => scatter(photos), [photos.map((p) => p.id).join()]);
  const minHeight = Math.max(540, photos.length * 210 + 300);

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
      {/* SVG filters defined once */}
      <AllSVGFilters />

      {/* Book spread container — perspective + global shadow */}
      <div
        className="flex rounded-lg overflow-hidden"
        style={{
          minHeight: `${minHeight}px`,
          // Slight perspective — the book sits on a desk, viewed at a slight angle
          transform: 'perspective(1400px) rotateX(1.2deg)',
          transformOrigin: 'center center',
          // Global shadow beneath the entire album (light from top-left)
          boxShadow: `
            6px 8px 24px rgba(0,0,0,0.10),
            12px 16px 48px rgba(0,0,0,0.06),
            2px 3px 6px rgba(0,0,0,0.05)
          `,
          // Slight rounding for the whole book
          borderRadius: '6px',
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
