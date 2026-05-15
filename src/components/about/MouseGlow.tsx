import { useEffect, useRef, type ReactNode } from 'react';
import useMousePosition from '@/hooks/useMousePosition';

interface MouseGlowProps {
  children: ReactNode;
}

export default function MouseGlow({ children }: MouseGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty('--mouse-x', `${mouse.x}px`);
    el.style.setProperty('--mouse-y', `${mouse.y}px`);
  }, [mouse.x, mouse.y]);

  return <div ref={containerRef}>{children}</div>;
}
