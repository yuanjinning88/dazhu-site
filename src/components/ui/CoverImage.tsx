interface CoverImageProps {
  src: string | null;
  alt: string;
  colors: [string, string];
  className?: string;
}

export default function CoverImage({ src, alt, colors, className = '' }: CoverImageProps) {
  if (src) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
      </div>
    );
  }
  return (
    <div
      className={className}
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
    />
  );
}
