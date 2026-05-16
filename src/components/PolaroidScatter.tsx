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
}

// ── Random scatter positions ──

function scatter(count: number): Spot[] {
  return Array.from({ length: count }, () => ({
    x: 6 + Math.random() * 70,
    y: 4 + Math.random() * 70,
    rotation: (Math.random() - 0.5) * 7,
    z: Math.floor(Math.random() * 10),
  }));
}

// ── Notebook doodles (viewBox 0 0 1000 1000) ──

const doodles = (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none select-none"
    viewBox="0 0 1000 1000"
    preserveAspectRatio="none"
  >
    <path
      d="M870,90 L873,65 L876,90 L901,93 L876,96 L873,121 L870,96 L845,93 Z"
      fill="none"
      stroke="rgba(139,119,90,0.15)"
      strokeWidth="1.5"
    />
    <path
      d="M65,380 C65,350 95,350 95,380 C95,410 65,410 65,380 C65,320 125,320 125,380"
      fill="none"
      stroke="rgba(139,119,90,0.12)"
      strokeWidth="1.2"
    />
    <path
      d="M520,820 Q535,813 550,820 Q565,827 580,820 Q595,813 610,820"
      fill="none"
      stroke="rgba(139,119,90,0.13)"
      strokeWidth="1"
    />
    <circle cx="780" cy="520" r="2" fill="rgba(139,119,90,0.12)" />
    <circle cx="790" cy="525" r="1.3" fill="rgba(139,119,90,0.09)" />
    <circle cx="774" cy="530" r="1.5" fill="rgba(139,119,90,0.1)" />
    <path
      d="M230,160 L230,180 M220,170 L240,170"
      fill="none"
      stroke="rgba(139,119,90,0.1)"
      strokeWidth="0.8"
    />
    <path
      d="M160,620 C160,615 163,610 166,612 C169,610 172,615 172,620 C172,628 166,633 166,633 C166,633 160,628 160,620 Z"
      fill="none"
      stroke="rgba(139,119,90,0.1)"
      strokeWidth="0.8"
    />
  </svg>
);

// ── NotebookBackground ──

function NotebookBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Paper base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(175deg, #f6f1e4 0%, #f1e9d6 40%, #ede3cc 100%)',
        }}
      />
      {/* Ruled lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 27px, rgba(156,138,115,0.1) 27px, rgba(156,138,115,0.1) 28px)',
          maskImage:
            'linear-gradient(to right, transparent 5%, black 7.5%, black 92.5%, transparent 95%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 5%, black 7.5%, black 92.5%, transparent 95%)',
        }}
      />
      {/* Red margin line */}
      <div
        className="absolute top-0 bottom-0"
        style={{
          left: '7%',
          width: '1px',
          background: 'rgba(185,130,120,0.15)',
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(156,138,115,0.18) 100%)',
        }}
      />
      {doodles}
    </div>
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
  return (
    <motion.div
      className="absolute group cursor-pointer"
      style={{
        left: `${spot.x}%`,
        top: `${spot.y}%`,
        zIndex: spot.z,
      }}
      whileHover={{
        y: -10,
        scale: 1.04,
        zIndex: 50,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      onClick={onView}
    >
      {/* Tape */}
      <div
        className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 rounded-sm"
        style={{
          width: '36%',
          height: '14px',
          background: 'rgba(255,255,245,0.55)',
          border: '1px solid rgba(200,190,170,0.18)',
          transform: `rotate(${(spot.x * 13) % 6 - 3}deg)`,
        }}
      />

      {/* Card body */}
      <div
        className="bg-white rounded-sm flex flex-col"
        style={{
          width: 'clamp(140px, 18vw, 200px)',
          padding: 'clamp(6px, 0.8vw, 10px)',
          paddingBottom: 'clamp(26px, 3.2vw, 34px)',
          boxShadow:
            '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
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
        <p className="text-center text-[11px] sm:text-xs text-gray-400 mt-2 px-0.5 truncate leading-tight">
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
        <p className="text-center text-base font-medium text-gray-600 mt-3">
          {photo.title}
        </p>
        {photo.date && (
          <p className="text-center text-xs text-gray-400 mt-1">
            {photo.date}
          </p>
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
  const spots = useMemo(() => scatter(photos.length), [photos.length]);
  const minHeight = Math.max(450, photos.length * 180 + 200);

  if (photos.length === 0) {
    return <p className="text-sm text-text-muted">暂无日常碎片</p>;
  }

  return (
    <>
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          minHeight: `${minHeight}px`,
          boxShadow:
            '0 1px 4px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.03)',
        }}
      >
        <NotebookBackground />
        {photos.map((photo, i) => (
          <PolaroidCard
            key={photo.id}
            photo={photo}
            spot={spots[i]}
            onView={() => setViewPhoto(photo)}
          />
        ))}
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
