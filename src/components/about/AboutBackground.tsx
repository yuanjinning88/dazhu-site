export default function AboutBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-white" />

      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.012 }}
      >
        <filter id="paper-fiber">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.35"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-fiber)" />
      </svg>
    </div>
  );
}
