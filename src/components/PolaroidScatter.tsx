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
// Left page: x 2–46%, Right page: x 54–98%, Rotation: ±30°

function scatter(photos: PolaroidPhoto[]): Spot[] {
  // Build balanced left/right assignments
  const n = photos.length;
  const assignments: ('left' | 'right')[] = [];
  for (let i = 0; i < n; i++) {
    assignments.push(i < n / 2 ? 'left' : 'right');
  }
  // Shuffle
  for (let i = assignments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
  }

  return assignments.map((page) => ({
    x: page === 'left' ? 3 + Math.random() * 42 : 55 + Math.random() * 42,
    y: 3 + Math.random() * 74,
    rotation: (Math.random() - 0.5) * 60, // ±30°
    z: Math.floor(Math.random() * 10),
    page,
  }));
}

// ── SVG Paper Texture Filter ──

const paperTextureId = 'paper-texture-filter';

function PaperTextureSVG() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      <defs>
        <filter
          id={paperTextureId}
          x="0%"
          y="0%"
          width="100%"
          height="100%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="4"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            type="matrix"
            values="
              0 0 0 0 0.45
              0 0 0 0 0.38
              0 0 0 0 0.28
              0 0 0 0.06 0
            "
            in="noise"
            result="colorNoise"
          />
        </filter>
      </defs>
      <rect
        width="100%"
        height="100%"
        filter={`url(#${paperTextureId})`}
        style={{ mixBlendMode: 'multiply' }}
      />
    </svg>
  );
}

// ── Page Decorations (fixed, hand-drawn style, per page) ──

function LeftPageDecorations() {
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
        {/* Small botanical sprig — top left */}
        <g transform="translate(40, 50)" opacity="0.2">
          <path
            d="M0,40 Q5,20 0,0 M0,20 Q-8,10 -12,0 M0,15 Q8,8 10,0"
            fill="none"
            stroke="#6b5b4a"
            strokeWidth="0.8"
          />
        </g>

        {/* Hand-drawn star cluster — mid-left */}
        <g transform="translate(30, 250)" opacity="0.14">
          <path
            d="M0,-6 L1.5,-1.5 L6,0 L1.5,1.5 L0,6 L-1.5,1.5 L-6,0 L-1.5,-1.5 Z"
            fill="none"
            stroke="#6b5b4a"
            strokeWidth="0.7"
          />
        </g>
        <g transform="translate(50, 280)" opacity="0.1">
          <path
            d="M0,-4 L1,-1 L4,0 L1,1 L0,4 L-1,1 L-4,0 L-1,-1 Z"
            fill="none"
            stroke="#6b5b4a"
            strokeWidth="0.6"
          />
        </g>

        {/* Swirl — mid area */}
        <g transform="translate(120, 420)" opacity="0.12">
          <path
            d="M0,0 C0,-10 10,-10 10,0 C10,10 0,12 -2,6 C-4,0 4,-4 6,2"
            fill="none"
            stroke="#6b5b4a"
            strokeWidth="0.7"
          />
        </g>

        {/* Small arrow */}
        <g transform="translate(180, 120)" opacity="0.13">
          <path
            d="M0,0 L12,0 L12,-3 L18,2 L12,7 L12,4 L0,4 Z"
            fill="none"
            stroke="#6b5b4a"
            strokeWidth="0.6"
          />
        </g>

        {/* Age spots / foxing */}
        <circle cx="80" cy="180" r="2.5" fill="#8b6914" opacity="0.06" />
        <circle cx="85" cy="183" r="1.2" fill="#8b6914" opacity="0.04" />
        <circle cx="150" cy="650" r="3" fill="#8b6914" opacity="0.05" />
        <circle cx="155" cy="648" r="1" fill="#8b6914" opacity="0.03" />
        <circle cx="350" cy="120" r="2" fill="#8b6914" opacity="0.05" />
        <circle cx="420" cy="500" r="2.5" fill="#8b6914" opacity="0.04" />
        <circle cx="60" cy="700" r="1.8" fill="#8b6914" opacity="0.05" />

        {/* Tiny flower sketch — bottom left */}
        <g transform="translate(50, 650)" opacity="0.14">
          <circle cx="0" cy="0" r="2" fill="none" stroke="#6b5b4a" strokeWidth="0.5" />
          <circle cx="4" cy="-4" r="1.5" fill="none" stroke="#6b5b4a" strokeWidth="0.4" />
          <circle cx="-4" cy="-4" r="1.5" fill="none" stroke="#6b5b4a" strokeWidth="0.4" />
          <circle cx="4" cy="4" r="1.5" fill="none" stroke="#6b5b4a" strokeWidth="0.4" />
          <circle cx="-4" cy="4" r="1.5" fill="none" stroke="#6b5b4a" strokeWidth="0.4" />
          <path d="M0,2 L0,8" fill="none" stroke="#6b5b4a" strokeWidth="0.5" />
        </g>

        {/* Wavy underline near bottom */}
        <g transform="translate(200, 700)" opacity="0.1">
          <path
            d="M0,0 Q8,-4 16,0 Q24,4 32,0 Q40,-4 48,0"
            fill="none"
            stroke="#6b5b4a"
            strokeWidth="0.7"
          />
        </g>
      </svg>

      {/* Handwritten text snippets */}
      <span
        className="absolute text-[13px] tracking-wider"
        style={{
          left: '14%',
          top: '8%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(80,60,35,0.22)',
          transform: 'rotate(-8deg)',
        }}
      >
        记得那天...
      </span>
      <span
        className="absolute text-[11px]"
        style={{
          left: '8%',
          top: '55%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(80,60,35,0.18)',
          transform: 'rotate(-4deg)',
        }}
      >
        珍藏
      </span>
    </div>
  );
}

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
        {/* Star — top right */}
        <g transform="translate(420, 40)" opacity="0.16">
          <path
            d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2 Z"
            fill="none"
            stroke="#6b5b4a"
            strokeWidth="0.8"
          />
        </g>

        {/* Small spiral — upper area */}
        <g transform="translate(380, 180)" opacity="0.11">
          <path
            d="M0,0 C0,-8 8,-8 8,0 C8,8 0,9 -1,4 C-2,-1 3,-3 5,1"
            fill="none"
            stroke="#6b5b4a"
            strokeWidth="0.7"
          />
        </g>

        {/* Dots cluster */}
        <g transform="translate(300, 500)" opacity="0.12">
          <circle cx="0" cy="0" r="1.8" fill="#6b5b4a" />
          <circle cx="5" cy="3" r="1" fill="#6b5b4a" />
          <circle cx="-4" cy="5" r="1.2" fill="#6b5b4a" />
        </g>

        {/* Small sketch — bottom right corner (envelope icon) */}
        <g transform="translate(400, 650)" opacity="0.13">
          <rect x="0" y="0" width="20" height="14" rx="1" fill="none" stroke="#6b5b4a" strokeWidth="0.7" />
          <path d="M0,0 L10,8 L20,0" fill="none" stroke="#6b5b4a" strokeWidth="0.7" />
        </g>

        {/* Decorative corner lines — top right */}
        <g transform="translate(460, 20)" opacity="0.1">
          <path d="M0,0 L-15,0 L-15,15" fill="none" stroke="#6b5b4a" strokeWidth="0.6" />
        </g>

        {/* Age spots / foxing */}
        <circle cx="350" cy="300" r="2" fill="#8b6914" opacity="0.05" />
        <circle cx="355" cy="303" r="1" fill="#8b6914" opacity="0.03" />
        <circle cx="80" cy="550" r="3" fill="#8b6914" opacity="0.04" />
        <circle cx="200" cy="180" r="2" fill="#8b6914" opacity="0.05" />
        <circle cx="450" cy="450" r="2.5" fill="#8b6914" opacity="0.04" />
        <circle cx="120" cy="720" r="1.8" fill="#8b6914" opacity="0.05" />

        {/* Tiny arrow */}
        <g transform="translate(300, 280)" opacity="0.12">
          <path d="M0,6 L0,0 L-3,3 M0,0 L3,3" fill="none" stroke="#6b5b4a" strokeWidth="0.7" />
        </g>
      </svg>

      {/* Handwritten text snippets */}
      <span
        className="absolute text-[12px] tracking-wide"
        style={{
          right: '16%',
          top: '12%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(80,60,35,0.2)',
          transform: 'rotate(6deg)',
        }}
      >
        好时光
      </span>
      <span
        className="absolute text-[10px]"
        style={{
          right: '12%',
          top: '60%',
          fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          color: 'rgba(80,60,35,0.16)',
          transform: 'rotate(3deg)',
        }}
      >
        日常碎片
      </span>
    </div>
  );
}

// ── PagePaper (page background with texture & aging) ──

function PagePaper({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        // Uneven aged paper: multiple stains + base gradient
        background: `
          radial-gradient(ellipse at 35% 25%, rgba(185,155,110,0.25) 0%, transparent 55%),
          radial-gradient(ellipse at 65% 70%, rgba(160,130,90,0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 45% 85%, rgba(170,140,100,0.2) 0%, transparent 45%),
          radial-gradient(ellipse at 20% 60%, rgba(175,145,105,0.15) 0%, transparent 40%),
          linear-gradient(178deg, #f3ebd8 0%, #efe3c8 30%, #ece0c2 60%, #f0e4ca 100%)
        `,
        // Paper edge darkening (heavier near spine)
        boxShadow:
          side === 'left'
            ? 'inset -3px 0 8px rgba(139,119,90,0.12)'
            : 'inset 3px 0 8px rgba(139,119,90,0.12)',
      }}
    >
      {/* Texture overlay */}
      <PaperTextureSVG />

      {/* Page decorations */}
      {side === 'left' ? <LeftPageDecorations /> : <RightPageDecorations />}
    </div>
  );
}

// ── Spine ──

function Spine() {
  return (
    <div
      className="relative shrink-0 pointer-events-none select-none"
      style={{ width: 'clamp(18px, 3vw, 30px)' }}
      aria-hidden="true"
    >
      {/* Spine shadow — darker gradient simulating book fold */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(100,80,50,0.18) 0%, rgba(100,80,50,0.08) 30%, rgba(100,80,50,0.02) 50%, rgba(100,80,50,0.08) 70%, rgba(100,80,50,0.18) 100%)',
        }}
      />
      {/* Center thread line */}
      <div
        className="absolute left-1/2 top-[5%] bottom-[5%]"
        style={{
          width: '1px',
          background:
            'repeating-linear-gradient(rgba(80,60,30,0.15) 0px, rgba(80,60,30,0.15) 3px, transparent 3px, transparent 8px)',
        }}
      />
    </div>
  );
}

// ── Photo tape (decorative piece on top of each polaroid) ──

function TapePiece({ seed }: { seed: number }) {
  const rotation = (seed * 17) % 10 - 5;
  const color =
    seed % 3 === 0
      ? 'rgba(255,255,240,0.5)'
      : seed % 3 === 1
        ? 'rgba(245,240,225,0.5)'
        : 'rgba(250,245,235,0.52)';

  return (
    <div
      className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 rounded-sm"
      style={{
        width: `${32 + (seed % 12)}%`,
        height: `${12 + (seed % 6)}px`,
        background: color,
        border: '1px solid rgba(190,180,160,0.16)',
        transform: `rotate(${rotation}deg)`,
      }}
      aria-hidden="true"
    />
  );
}

// ── PolaroidCard ──

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
        y: -12,
        scale: 1.05,
        zIndex: 50,
        rotate: spot.rotation * 0.2,
        transition: { type: 'spring', stiffness: 280, damping: 18 },
      }}
      onClick={onView}
    >
      <TapePiece seed={tapeSeed} />

      {/* Card body */}
      <div
        className="bg-white rounded-sm flex flex-col cursor-pointer"
        style={{
          width: 'clamp(130px, 16vw, 190px)',
          padding: 'clamp(5px, 0.7vw, 9px)',
          paddingBottom: 'clamp(24px, 3vw, 32px)',
          boxShadow:
            '0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)',
        }}
      >
        {/* Image */}
        <div className="aspect-square overflow-hidden rounded-sm bg-gray-100">
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
            color: 'rgba(80,60,35,0.5)',
            fontFamily: "'Segoe Script', 'Apple Chancery', 'Bradley Hand', cursive",
          }}
        >
          {photo.title}
        </p>
      </div>
    </motion.div>
  );
}

// ── LightboxModal ──

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
        className="bg-white rounded-sm flex flex-col shadow-2xl"
        style={{
          width: 'min(420px, 85vw)',
          padding: 'min(16px, 2vw)',
          paddingBottom: 'min(42px, 5vw)',
        }}
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-square overflow-hidden rounded-sm bg-gray-100">
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
          style={{ color: '#5a4a3a' }}
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
  const minHeight = Math.max(500, photos.length * 190 + 260);

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
      {/* Book spread */}
      <div
        className="flex rounded-lg overflow-hidden"
        style={{
          minHeight: `${minHeight}px`,
          boxShadow:
            '0 2px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        {/* Left page */}
        <div
          className="relative flex-1"
          style={{ minWidth: 0 }}
        >
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

        {/* Spine */}
        <Spine />

        {/* Right page */}
        <div
          className="relative flex-1"
          style={{ minWidth: 0 }}
        >
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

      {/* Lightbox */}
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
