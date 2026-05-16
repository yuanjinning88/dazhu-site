import { useState, useMemo, memo } from 'react';
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

// ── Random photo distribution ──

function scatter(photos: PolaroidPhoto[]): Spot[] {
  return photos.map(() => {
    const page = Math.random() > 0.5 ? 'left' : 'right';
    const x = page === 'left' ? 2 + Math.random() * 42 : 56 + Math.random() * 42;
    return { x, y: 2 + Math.random() * 72, rotation: (Math.random() - 0.5) * 60, z: Math.floor(Math.random() * 16), page };
  });
}

// ════════════════════════════════════
// SVG FILTER — single, simplified paper texture only
// (removed feDisplacementMap — huge GPU cost for negligible visual gain)
// ════════════════════════════════════

const PAPER_TEX_ID = 'paper-tex';

function PaperFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
      <defs>
        <filter id={PAPER_TEX_ID} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="3" stitchTiles="stitch" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.38  0 0 0 0 0.30  0 0 0 0 0.20  0 0 0 0.04 0" in="noise" />
        </filter>
      </defs>
    </svg>
  );
}

// ════════════════════════════════════
// PAPER TEXTURE OVERLAY
// ════════════════════════════════════

function PaperTextureOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none"
      style={{ zIndex: 1, filter: `url(#${PAPER_TEX_ID})`, mixBlendMode: 'multiply', background: 'transparent' }}
      aria-hidden="true" />
  );
}

// ════════════════════════════════════
// RULED LINES
// ════════════════════════════════════

function RuledLines() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 1 }} aria-hidden="true">
      <div style={{
        width: '100%', height: '100%',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(156,138,115,0.04) 27px, rgba(156,138,115,0.04) 28px)',
        maskImage: 'linear-gradient(to bottom, transparent 4%, black 10%, black 90%, transparent 96%), linear-gradient(to right, transparent 8%, black 12%, black 88%, transparent 92%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 4%, black 10%, black 90%, transparent 96%), linear-gradient(to right, transparent 8%, black 12%, black 88%, transparent 92%)',
      }} />
    </div>
  );
}

// ════════════════════════════════════
// 3D PAGE STRUCTURE
// ════════════════════════════════════

function SpineCurve({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  return (
    <div className="absolute top-0 bottom-0 pointer-events-none select-none" style={{
      zIndex: 3, width: 'clamp(30px, 6vw, 55px)',
      ...(isLeft ? { right: 0 } : { left: 0 }),
      background: isLeft
        ? 'linear-gradient(90deg, transparent 0%, rgba(210,190,160,0.05) 30%, rgba(200,180,150,0.02) 45%, rgba(110,85,55,0.07) 65%, rgba(90,65,38,0.16) 100%)'
        : 'linear-gradient(90deg, rgba(90,65,38,0.16) 0%, rgba(110,85,55,0.07) 35%, rgba(200,180,150,0.02) 55%, rgba(210,190,160,0.05) 70%, transparent 100%)',
    }} aria-hidden="true" />
  );
}

function EdgeCurve({ side, edge }: { side: 'left' | 'right'; edge: 'top' | 'bottom' }) {
  const isLeft = side === 'left';
  const isTop = edge === 'top';
  return (
    <div className="absolute pointer-events-none select-none" style={{
      zIndex: 3, [isTop ? 'top' : 'bottom']: 0,
      ...(isLeft ? { right: '5%' } : { left: '5%' }),
      width: 'clamp(40px, 8vw, 80px)', height: 'clamp(4px, 0.6vw, 8px)',
      background: isTop
        ? `radial-gradient(ellipse at ${isLeft ? '100%' : '0%'} 0%, rgba(100,80,50,0.07) 0%, rgba(100,80,50,0.02) 50%, transparent 100%)`
        : `radial-gradient(ellipse at ${isLeft ? '100%' : '0%'} 100%, rgba(100,80,50,0.07) 0%, rgba(100,80,50,0.02) 50%, transparent 100%)`,
    }} aria-hidden="true" />
  );
}

function PageThickness({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  return (
    <div className="absolute top-[3%] bottom-[3%] pointer-events-none select-none" style={{
      zIndex: 3, width: 'clamp(2px, 0.4vw, 5px)',
      ...(isLeft ? { left: 0 } : { right: 0 }),
      background: isLeft
        ? 'linear-gradient(90deg, rgba(210,195,170,0.18) 0%, rgba(200,185,160,0.06) 50%, transparent 100%)'
        : 'linear-gradient(90deg, transparent 0%, rgba(200,185,160,0.06) 50%, rgba(210,195,170,0.18) 100%)',
    }} aria-hidden="true" />
  );
}

function CornerCurl({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const s: React.CSSProperties = { position: 'absolute', pointerEvents: 'none', zIndex: 3, width: 'clamp(35px, 7vw, 65px)', height: 'clamp(35px, 7vw, 65px)' };
  if (corner === 'tl') { s.top = 0; s.left = 0; s.background = 'radial-gradient(ellipse at 0% 0%, rgba(139,119,90,0.09) 0%, rgba(139,119,90,0.03) 40%, transparent 70%)'; }
  if (corner === 'tr') { s.top = 0; s.right = 0; s.background = 'radial-gradient(ellipse at 100% 0%, rgba(139,119,90,0.11) 0%, rgba(139,119,90,0.04) 40%, transparent 70%)'; }
  if (corner === 'bl') { s.bottom = 0; s.left = 0; s.background = 'radial-gradient(ellipse at 0% 100%, rgba(139,119,90,0.10) 0%, rgba(139,119,90,0.03) 40%, transparent 70%)'; }
  if (corner === 'br') { s.bottom = 0; s.right = 0; s.background = 'radial-gradient(ellipse at 100% 100%, rgba(139,119,90,0.08) 0%, rgba(139,119,90,0.03) 40%, transparent 70%)'; }
  return <div style={s} aria-hidden="true" />;
}

function CreaseMarks({ positions }: { positions: { vx: string; hy: string } }) {
  return (
    <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 1 }} aria-hidden="true">
      <div className="absolute top-0 bottom-0" style={{ left: positions.vx, width: '1px', background: 'linear-gradient(transparent 5%, rgba(139,119,90,0.05) 20%, rgba(139,119,90,0.08) 50%, rgba(139,119,90,0.05) 80%, transparent 95%)' }} />
      <div className="absolute left-0 right-0" style={{ top: positions.hy, height: '1px', background: 'linear-gradient(to right, transparent 8%, rgba(139,119,90,0.04) 30%, rgba(139,119,90,0.06) 50%, rgba(139,119,90,0.04) 70%, transparent 92%)' }} />
    </div>
  );
}

// ════════════════════════════════════
// DECORATIONS — memoized (never change)
// ════════════════════════════════════

const LeftPageDecorations = memo(function LeftPageDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" style={{ zIndex: 2 }} aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 800" preserveAspectRatio="xMidYMid meet">
        <g transform="translate(50, 55)" opacity="0.14">
          <path d="M0,-7.5 L2.2,-2.2 L7.5,0 L2.2,2.2 L0,7.5 L-2.2,2.2 L-7.5,0 L-2.2,-2.2 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M0.3,-7 L2.3,-2 L7.8,0.3 L2.3,2.3 L0.3,7.8 L-2,2.3 L-7.2,0.3 L-2,-2 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.35" strokeLinecap="round" opacity="0.5" />
        </g>
        <g transform="translate(30, 165)" opacity="0.11">
          <path d="M0,38 Q5,16 0,0 M0,20 Q-7,9 -12,0 M0,14 Q7,7 10,-2" fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" />
          <ellipse cx="-5" cy="12" rx="3" ry="1.3" fill="none" stroke="#5a4a3a" strokeWidth="0.5" transform="rotate(-30 -5 12)" />
          <ellipse cx="4" cy="8" rx="3" ry="1.3" fill="none" stroke="#5a4a3a" strokeWidth="0.5" transform="rotate(25 4 8)" />
        </g>
        <g transform="translate(42, 310)" opacity="0.09"><path d="M0,-5 L1.2,-1.2 L5,0 L1.2,1.2 L0,5 L-1.2,1.2 L-5,0 L-1.2,-1.2 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinejoin="round" /></g>
        <g transform="translate(68, 338)" opacity="0.06"><path d="M0,-3.5 L0.8,-0.8 L3.5,0 L0.8,0.8 L0,3.5 L-0.8,0.8 L-3.5,0 L-0.8,-0.8 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" /></g>
        <g transform="translate(175, 195)" opacity="0.08"><path d="M0,0 C0,-14 14,-14 14,0 C14,14 0,16 -2,8 C-5,0 5,-6 8,3" fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" /></g>
        <g transform="translate(100, 480)" opacity="0.10"><path d="M0,0 L15,0 L15,-3 L22,2 L15,7 L15,4 L0,4 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" /></g>
        <g transform="translate(65, 635)" opacity="0.11">
          <circle cx="0" cy="0" r="2.8" fill="none" stroke="#5a4a3a" strokeWidth="0.5" />
          <circle cx="5.5" cy="-5.5" r="2.2" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="-5.5" cy="-5.5" r="2.2" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="5.5" cy="5.5" r="2.2" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="-5.5" cy="5.5" r="2.2" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <path d="M0,2.8 L0,11" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinecap="round" />
        </g>
        <g transform="translate(310, 160)" opacity="0.08">
          <circle cx="0" cy="0" r="7" fill="none" stroke="#5a4a3a" strokeWidth="0.6" />
          <circle cx="-2.8" cy="-2.5" r="1" fill="#5a4a3a" /><circle cx="2.8" cy="-2.5" r="1" fill="#5a4a3a" />
          <path d="M-3.5,2.5 Q0,6 3.5,2.5" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinecap="round" />
        </g>
        <g transform="translate(30, 740)" opacity="0.08"><path d="M0,18 L0,0 L18,0" fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" /></g>
        <g transform="translate(190, 400)" opacity="0.07"><path d="M0,0 Q7,-5 14,0 Q21,5 28,0 Q35,-5 42,0 Q49,5 56,0" fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinecap="round" /></g>
        <g transform="translate(400, 280)" opacity="0.09"><path d="M0,4 C0,0 -5,-4 -5,-4 C-5,-4 -10,0 -10,4 C-10,8 0,14 0,14 C0,14 10,8 10,4 C10,0 5,-4 5,-4 C5,-4 0,0 0,4 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" /></g>
        <g transform="translate(210, 610)" opacity="0.05">
          <circle cx="0" cy="0" r="15" fill="none" stroke="#6b4e2a" strokeWidth="2.2" />
          <circle cx="0" cy="0" r="13" fill="none" stroke="#6b4e2a" strokeWidth="0.7" opacity="0.5" />
          <circle cx="17" cy="-9" r="0.9" fill="#6b4e2a" opacity="0.45" /><circle cx="-12" cy="17" r="0.7" fill="#6b4e2a" opacity="0.35" />
        </g>
        <g transform="translate(360, 530)" opacity="0.09">
          {[0,1,2].flatMap(r => [0,1,2].map(c => <circle key={`${r}-${c}`} cx={c*9} cy={r*9} r="2" fill="none" stroke="#5a4a3a" strokeWidth="0.5" />))}
        </g>
        <rect x="185" y="565" width="38" height="6" rx="1" fill="#d4b896" opacity="0.15" transform="rotate(-16 204 568)" />
        <g transform="translate(330, 690) rotate(-10)">
          <rect x="0" y="0" width="26" height="16" rx="1.5" fill="none" stroke="#8b7355" strokeWidth="0.6" opacity="0.13" />
          <line x1="7" y1="0" x2="7" y2="16" stroke="#8b7355" strokeWidth="0.4" opacity="0.09" />
          <circle cx="16" cy="8" r="2.5" fill="none" stroke="#8b7355" strokeWidth="0.4" opacity="0.09" />
        </g>
        <g transform="translate(440, 180)" opacity="0.09"><path d="M0,9 L6,-5 L12,9 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" /></g>
        <g transform="translate(145, 140)" opacity="0.07"><path d="M0,6 L6,0 L12,6 L6,12 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" /></g>
        <g transform="translate(290, 100)" opacity="0.09"><path d="M0,0 L0,14 M-7,7 L7,7" fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinecap="round" /></g>
        {[[80,175,3.5],[87,180,1.8],[145,655,4],[152,650,1.5],[345,125,3],[425,505,3.5],[60,715,2.5],[215,735,3],[265,100,2.2],[405,395,2],[115,365,2.8],[315,665,3.2],[180,290,2],[380,480,2.5],[50,450,2.2]].map(([cx,cy,r],i) => (
          <circle key={`fl-${i}`} cx={cx} cy={cy} r={r} fill="#8b6914" opacity={0.02 + Math.random() * 0.045} />
        ))}
      </svg>
      <span style={{ position:'absolute', left:'18%', top:'5%', fontFamily:"'Segoe Script','Apple Chancery','Bradley Hand',cursive", color:'rgba(65,45,25,0.18)', transform:'rotate(-11deg)', fontSize:'13px' }}>记得那天...</span>
      <span style={{ position:'absolute', left:'11%', top:'50%', fontFamily:"'Segoe Script','Apple Chancery','Bradley Hand',cursive", color:'rgba(65,45,25,0.14)', transform:'rotate(-7deg)', fontSize:'10px' }}>珍藏</span>
      <span style={{ position:'absolute', left:'32%', top:'79%', fontFamily:"'Segoe Script','Apple Chancery','Bradley Hand',cursive", color:'rgba(65,45,25,0.11)', transform:'rotate(-4deg)', fontSize:'9px' }}>2024.春</span>
      <span style={{ position:'absolute', left:'50%', top:'43%', fontFamily:"'Segoe Script','Apple Chancery','Bradley Hand',cursive", color:'rgba(65,45,25,0.12)', transform:'rotate(5deg)', fontSize:'10px' }}>日常~</span>
      <span style={{ position:'absolute', left:'38%', top:'72%', fontFamily:"'Segoe Script','Apple Chancery','Bradley Hand',cursive", color:'rgba(65,45,25,0.09)', transform:'rotate(-2deg)', fontSize:'8px' }}>雨天的咖啡馆</span>
      <StrayTape x="22%" y="89%" r={-15} w="32px" color="rgba(252,248,238,0.40)" />
      <StrayTape x="58%" y="17%" r={8} w="26px" color="rgba(248,242,228,0.38)" />
      <WashiStrip x="14%" y="93%" r={-4} w="46px" color="#d4b896" />
      <WashiStrip x="54%" y="76%" r={-9} w="32px" color="#b8c9a8" />
    </div>
  );
});

const RightPageDecorations = memo(function RightPageDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" style={{ zIndex: 2 }} aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 800" preserveAspectRatio="xMidYMid meet">
        <g transform="translate(445, 40)" opacity="0.13">
          <path d="M0,-10 L2.8,-2.8 L10,0 L2.8,2.8 L0,10 L-2.8,2.8 L-10,0 L-2.8,-2.8 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinejoin="round" />
          <path d="M0.2,-9 L2.9,-2.6 L10.2,0.2 L2.9,3 L0.2,10.2 L-2.6,3 L-9.8,0.2 L-2.6,-2.6 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.35" strokeLinejoin="round" opacity="0.5" />
        </g>
        <g transform="translate(385, 210)" opacity="0.08"><path d="M0,0 C0,-12 12,-12 12,0 C12,12 0,14 -2,7 C-5,0 5,-5 7,3" fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" /></g>
        <g transform="translate(300, 250)" opacity="0.10"><path d="M0,7 L0,0 L-3.5,3.5 M0,0 L3.5,3.5" fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinecap="round" /></g>
        <g transform="translate(340, 510)" opacity="0.08">
          <circle cx="0" cy="0" r="2.2" fill="#5a4a3a" /><circle cx="7" cy="4" r="1.3" fill="#5a4a3a" />
          <circle cx="-6" cy="7" r="1.6" fill="#5a4a3a" /><circle cx="4" cy="-6" r="1.1" fill="#5a4a3a" />
        </g>
        <g transform="translate(405, 660)" opacity="0.10">
          <rect x="0" y="0" width="24" height="16" rx="1.5" fill="none" stroke="#5a4a3a" strokeWidth="0.7" />
          <path d="M0,0 L12,10 L24,0" fill="none" stroke="#5a4a3a" strokeWidth="0.7" strokeLinejoin="round" />
        </g>
        <g transform="translate(475, 25)" opacity="0.07"><path d="M0,0 L-20,0 L-20,20" fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinecap="round" /></g>
        <g transform="translate(440, 340)" opacity="0.08"><path d="M0,-7 C5,-7 5,7 0,7 C2.5,5 2.5,-5 0,-7 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinejoin="round" /></g>
        <g transform="translate(260, 175)" opacity="0.08"><path d="M0,0 L-3.5,7 L0,7 L-2.5,14 L5,5 L1.5,5 L4,-3 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinejoin="round" /></g>
        <g transform="translate(195, 700)" opacity="0.09">
          <circle cx="0" cy="0" r="2.2" fill="none" stroke="#5a4a3a" strokeWidth="0.5" />
          <circle cx="4.5" cy="-4.5" r="1.8" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="-4.5" cy="-4.5" r="1.8" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="4.5" cy="4.5" r="1.8" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <circle cx="-4.5" cy="4.5" r="1.8" fill="none" stroke="#5a4a3a" strokeWidth="0.4" />
          <path d="M0,2.2 L0,8" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinecap="round" />
        </g>
        <g transform="translate(110, 370)" opacity="0.04">
          <circle cx="0" cy="0" r="13" fill="none" stroke="#6b4e2a" strokeWidth="2.8" />
          <circle cx="0" cy="0" r="11" fill="none" stroke="#6b4e2a" strokeWidth="0.6" opacity="0.4" />
        </g>
        <g transform="translate(75, 270)" opacity="0.09">
          {[0,1,2].flatMap(r => [0,1,2].map(c => <circle key={`${r}-${c}`} cx={c*9} cy={r*9} r="1.8" fill="none" stroke="#5a4a3a" strokeWidth="0.5" />))}
        </g>
        <rect x="240" y="410" width="40" height="6" rx="1" fill="#c9b8a0" opacity="0.14" transform="rotate(12 260 413)" />
        <g transform="translate(150, 480) rotate(8)">
          <rect x="0" y="0" width="22" height="14" rx="1" fill="none" stroke="#8b7355" strokeWidth="0.6" opacity="0.12" />
          <circle cx="11" cy="7" r="2.5" fill="none" stroke="#8b7355" strokeWidth="0.4" opacity="0.08" />
        </g>
        <g transform="translate(360, 140)" opacity="0.08"><path d="M0,11 L7,-5 L14,11 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" /></g>
        <g transform="translate(100, 450)" opacity="0.06"><path d="M0,4.5 L3.5,0 L10,0 L13.5,4.5 L10,9 L3.5,9 Z" fill="none" stroke="#5a4a3a" strokeWidth="0.5" strokeLinejoin="round" /></g>
        <g transform="translate(290, 630)" opacity="0.07"><path d="M0,0 Q5,-5 10,2 Q15,9 20,2 Q25,-5 30,2 Q35,9 40,0" fill="none" stroke="#5a4a3a" strokeWidth="0.6" strokeLinecap="round" /></g>
        {[[360,300,3],[366,305,1.5],[90,570,4],[215,195,2.5],[460,470,3],[130,740,2.2],[420,130,2.5],[300,730,3],[175,380,2],[405,580,2]].map(([cx,cy,r],i) => (
          <circle key={`fr-${i}`} cx={cx} cy={cy} r={r} fill="#8b6914" opacity={0.02 + Math.random() * 0.04} />
        ))}
      </svg>
      <span style={{ position:'absolute', right:'22%', top:'10%', fontFamily:"'Segoe Script','Apple Chancery','Bradley Hand',cursive", color:'rgba(65,45,25,0.17)', transform:'rotate(9deg)', fontSize:'12px' }}>好时光</span>
      <span style={{ position:'absolute', right:'14%', top:'58%', fontFamily:"'Segoe Script','Apple Chancery','Bradley Hand',cursive", color:'rgba(65,45,25,0.13)', transform:'rotate(6deg)', fontSize:'9px' }}>日常碎片</span>
      <span style={{ position:'absolute', left:'26%', top:'87%', fontFamily:"'Segoe Script','Apple Chancery','Bradley Hand',cursive", color:'rgba(65,45,25,0.11)', transform:'rotate(-8deg)', fontSize:'10px' }}>夏天见</span>
      <StrayTape x="70%" y="88%" r={13} w="30px" color="rgba(250,245,235,0.38)" />
      <WashiStrip x="64%" y="26%" r={7} w="38px" color="#c9b8a0" />
    </div>
  );
});

function StrayTape({ x, y, r, w, color }: { x: string; y: string; r: number; w: string; color: string }) {
  return (
    <div className="absolute pointer-events-none select-none rounded-sm" style={{
      left: x, top: y, width: w, height: '10px', transform: `rotate(${r}deg)`, background: color,
      border: '1px solid rgba(180,170,150,0.08)', zIndex: 2,
      boxShadow: '0 0 1px rgba(180,170,145,0.08), 1px 2px 3px rgba(0,0,0,0.03)',
    }} aria-hidden="true" />
  );
}

function WashiStrip({ x, y, r, color, w }: { x: string; y: string; r: number; color: string; w: string }) {
  return (
    <div className="absolute pointer-events-none select-none" style={{
      left: x, top: y, width: w, height: '5px', transform: `rotate(${r}deg)`, background: color,
      opacity: 0.28, borderRadius: '1px', zIndex: 2,
    }} aria-hidden="true" />
  );
}

// ════════════════════════════════════
// PAGE PAPER
// ════════════════════════════════════

const PAGE_BG_LEFT = 'radial-gradient(ellipse at 30% 20%, rgba(190,155,110,0.27) 0%, transparent 56%), radial-gradient(ellipse at 65% 60%, rgba(168,138,92,0.19) 0%, transparent 50%), radial-gradient(ellipse at 35% 80%, rgba(178,142,98,0.21) 0%, transparent 46%), linear-gradient(178deg, #f3e9d0 0%, #efe1c2 20%, #ecdfbf 45%, #f0e4c8 68%, #ede0c0 100%)';
const PAGE_BG_RIGHT = 'radial-gradient(ellipse at 70% 22%, rgba(188,152,108,0.26) 0%, transparent 54%), radial-gradient(ellipse at 30% 68%, rgba(165,135,90,0.18) 0%, transparent 50%), linear-gradient(177deg, #f4ebd4 0%, #f0e3c5 22%, #ede1c2 48%, #efe5ca 70%, #ece0c0 100%)';

function PagePaper({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  return (
    <div className="absolute inset-0 overflow-hidden" style={{
      background: isLeft ? PAGE_BG_LEFT : PAGE_BG_RIGHT,
      boxShadow: isLeft
        ? 'inset -5px 0 18px rgba(120,100,70,0.16), inset 2px 0 10px rgba(120,100,70,0.08), inset 0 5px 14px rgba(120,100,70,0.06), inset 0 -5px 14px rgba(120,100,70,0.06)'
        : 'inset 5px 0 18px rgba(120,100,70,0.16), inset -2px 0 10px rgba(120,100,70,0.08), inset 0 5px 14px rgba(120,100,70,0.06), inset 0 -5px 14px rgba(120,100,70,0.06)',
      borderLeft: isLeft ? '0.5px solid rgba(139,119,90,0.06)' : 'none',
      borderRight: !isLeft ? '0.5px solid rgba(139,119,90,0.06)' : 'none',
    }}>
      <PaperTextureOverlay />
      <RuledLines />
      <CreaseMarks positions={isLeft ? { vx: '80%', hy: '55%' } : { vx: '22%', hy: '63%' }} />
      {isLeft && <CornerCurl corner="bl" />}
      {isLeft && <CornerCurl corner="tr" />}
      {!isLeft && <CornerCurl corner="tr" />}
      <PageThickness side={side} />
      <SpineCurve side={side} />
      <EdgeCurve side={side} edge="top" />
      <EdgeCurve side={side} edge="bottom" />
      {isLeft ? <LeftPageDecorations /> : <RightPageDecorations />}
    </div>
  );
}

// ════════════════════════════════════
// SPINE
// ════════════════════════════════════

function Spine() {
  return (
    <div className="relative shrink-0 pointer-events-none select-none"
      style={{ width: 'clamp(26px, 5vw, 40px)' }} aria-hidden="true">
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(90deg, rgba(105,75,45,0.28) 0%, rgba(95,65,38,0.16) 16%, rgba(90,60,35,0.06) 36%, rgba(90,60,35,0.01) 50%, rgba(90,60,35,0.05) 64%, rgba(95,65,38,0.14) 84%, rgba(100,75,45,0.24) 100%)',
      }} />
      <div className="absolute top-[2%] bottom-[2%]" style={{ left: '8%', width: '3px', background: 'rgba(190,170,140,0.22)' }} />
      <div className="absolute top-[2%] bottom-[2%]" style={{ right: '14%', width: '2px', background: 'rgba(185,165,135,0.16)' }} />
      <div className="absolute left-1/2 top-[3%] bottom-[3%]" style={{ width: '3px', background: 'repeating-linear-gradient(rgba(65,40,20,0.22) 0px, rgba(65,40,20,0.22) 6px, transparent 6px, transparent 15px)' }} />
      <div className="absolute top-[3%] bottom-[3%]" style={{ left: '26%', width: '1.5px', background: 'repeating-linear-gradient(rgba(65,40,20,0.14) 0px, rgba(65,40,20,0.14) 4px, transparent 4px, transparent 12px)' }} />
      <div className="absolute top-[3%] bottom-[3%]" style={{ right: '34%', width: '1.5px', background: 'repeating-linear-gradient(rgba(65,40,20,0.10) 0px, rgba(65,40,20,0.10) 3px, transparent 3px, transparent 11px)' }} />
    </div>
  );
}

// ════════════════════════════════════
// POLAROID CARD — CSS hover, no Framer Motion
// ════════════════════════════════════

type TapePos = 'tc' | 'tl' | 'tr';

function tapePos(seed: number): { pos: TapePos; rot: number } {
  const positions: TapePos[] = ['tc', 'tc', 'tl', 'tr', 'tl', 'tr', 'tc'];
  return { pos: positions[seed % positions.length], rot: (seed * 13) % 16 - 8 };
}

function TapePiece({ seed }: { seed: number }) {
  const { pos, rot } = tapePos(seed);
  const colors = ['rgba(252,248,238,0.46)', 'rgba(248,242,228,0.44)', 'rgba(250,245,235,0.48)', 'rgba(245,238,220,0.42)'];
  const w = 28 + (seed % 18);
  const s: React.CSSProperties = {
    position: 'absolute', zIndex: 10, borderRadius: '1px', width: `${w}px`, height: `${10 + (seed % 6)}px`,
    background: colors[seed % colors.length], border: '0.5px solid rgba(180,170,145,0.10)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04), 1px 2px 3px rgba(0,0,0,0.02), inset 0 0 2px rgba(255,255,250,0.2)',
  };
  if (pos === 'tc') return <div style={{ ...s, top: '-11px', left: '50%', transform: `translateX(-50%) rotate(${rot}deg)` }} aria-hidden="true" />;
  if (pos === 'tl') return <div style={{ ...s, top: '-9px', left: '-8px', transform: `rotate(${rot}deg)` }} aria-hidden="true" />;
  return <div style={{ ...s, top: '-9px', right: '-8px', transform: `rotate(${rot}deg)` }} aria-hidden="true" />;
}

const PolaroidCard = memo(function PolaroidCard({
  photo, spot, onView, onDelete, isAdmin,
}: {
  photo: PolaroidPhoto; spot: Spot; onView: () => void;
  onDelete?: () => void; isAdmin?: boolean;
}) {
  const tapeSeed = photo.id.charCodeAt(0) + photo.id.charCodeAt(photo.id.length - 1);

  return (
    // Outer: rotation + position (no hover animation)
    <div
      className="absolute"
      style={{
        left: `${spot.x}%`, top: `${spot.y}%`, zIndex: spot.z,
        transform: `rotate(${spot.rotation}deg)`,
      }}
      onClick={onView}
    >
      {/* Inner: hover lift + scale (CSS-driven, GPU composited) */}
      <div className="polaroid-card group cursor-pointer relative">
        <TapePiece seed={tapeSeed} />
        <div className="rounded-sm flex flex-col" style={{
          width: 'clamp(130px, 16vw, 190px)',
          padding: 'clamp(5px, 0.7vw, 9px)',
          paddingBottom: 'clamp(24px, 3vw, 32px)',
          background: 'linear-gradient(180deg, #faf5ea 0%, #f7f0e2 50%, #f5eddc 100%)',
          boxShadow: '2px 3px 6px rgba(0,0,0,0.06), 3px 5px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02), inset 0 0 0 0.5px rgba(195,175,145,0.16)',
          border: '0.5px solid rgba(175,155,125,0.13)',
        }}>
          <div className="aspect-square overflow-hidden rounded-sm bg-gray-100" style={{ boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.05)' }}>
            {photo.imageUrl ? (
              <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" loading="lazy" draggable={false} />
            ) : (
              <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${photo.colors[0]}, ${photo.colors[1]})` }} />
            )}
          </div>
          <p className="text-center text-[10px] sm:text-[11px] mt-2 px-0.5 truncate leading-tight"
            style={{ color: 'rgba(65,45,25,0.46)', fontFamily: "'Segoe Script','Apple Chancery','Bradley Hand',cursive" }}>{photo.title}</p>
        </div>
        {isAdmin && onDelete && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-white shadow border border-gray-200 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] z-20">✕</button>
        )}
      </div>
    </div>
  );
});

// ════════════════════════════════════
// LIGHTBOX — Framer Motion (only on open/close, not continuous)
// ════════════════════════════════════

function LightboxModal({ photo, onClose }: { photo: PolaroidPhoto; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="rounded-sm flex flex-col shadow-2xl" style={{
        width: 'min(420px, 85vw)', padding: 'min(16px, 2vw)', paddingBottom: 'min(42px, 5vw)',
        background: 'linear-gradient(180deg, #faf5ea 0%, #f7f0e2 50%, #f5eddc 100%)', border: '1px solid rgba(180,160,130,0.15)',
      }}
        initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }} onClick={(e) => e.stopPropagation()}>
        <div className="aspect-square overflow-hidden rounded-sm bg-gray-100" style={{ boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.04)' }}>
          {photo.imageUrl ? <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" draggable={false} />
            : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${photo.colors[0]}, ${photo.colors[1]})` }} />}
        </div>
        <p className="text-center text-base font-medium mt-3" style={{ color: '#5a4a3a', fontFamily: "'Segoe Script','Apple Chancery','Bradley Hand',cursive" }}>{photo.title}</p>
        {photo.date && <p className="text-center text-xs text-gray-400 mt-1">{photo.date}</p>}
      </motion.div>
      <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors text-lg">✕</button>
    </motion.div>
  );
}

// ════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════

export default function PolaroidScatter({ photos }: { photos: PolaroidPhoto[] }) {
  const [viewPhoto, setViewPhoto] = useState<PolaroidPhoto | null>(null);
  const spots = useMemo(() => scatter(photos), [photos.map(p => p.id).join()]);
  const minHeight = Math.max(580, photos.length * 230 + 340);

  if (photos.length === 0) return <p className="text-sm text-text-muted">暂无日常碎片</p>;

  const leftPhotos = photos.map((p, i) => ({ photo: p, spot: spots[i] })).filter(({ spot }) => spot.page === 'left');
  const rightPhotos = photos.map((p, i) => ({ photo: p, spot: spots[i] })).filter(({ spot }) => spot.page === 'right');

  return (
    <>
      <PaperFilter />

      <div className="polaroid-book" style={{
        transform: 'perspective(900px) rotateX(-2.5deg) rotateY(-0.8deg) translateZ(0)',
        transformOrigin: 'center center',
        filter: 'drop-shadow(10px 14px 32px rgba(0,0,0,0.13)) drop-shadow(18px 22px 64px rgba(0,0,0,0.07)) drop-shadow(4px 6px 10px rgba(0,0,0,0.06))',
      }}>
        <div className="flex overflow-hidden" style={{ minHeight: `${minHeight}px`, borderRadius: '8px' }}>
          <div className="relative flex-1" style={{ minWidth: 0 }}>
            <PagePaper side="left" />
            {leftPhotos.map(({ photo, spot }) => (
              <PolaroidCard key={photo.id} photo={photo} spot={spot} onView={() => setViewPhoto(photo)} />
            ))}
          </div>
          <Spine />
          <div className="relative flex-1" style={{ minWidth: 0 }}>
            <PagePaper side="right" />
            {rightPhotos.map(({ photo, spot }) => (
              <PolaroidCard key={photo.id} photo={photo} spot={spot} onView={() => setViewPhoto(photo)} />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {viewPhoto && <LightboxModal photo={viewPhoto} onClose={() => setViewPhoto(null)} />}
      </AnimatePresence>
    </>
  );
}
