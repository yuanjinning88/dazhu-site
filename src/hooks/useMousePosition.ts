import { useState, useEffect, useRef } from 'react';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

interface Options {
  smoothFactor?: number;
}

export default function useMousePosition(options: Options = {}): MousePosition {
  const { smoothFactor = 0.075 } = options;

  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0.5,
    normalizedY: 0.5,
  });

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  const disabled = typeof window !== 'undefined' && (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  );

  useEffect(() => {
    if (disabled) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setPosition({ x: cx, y: cy, normalizedX: 0.5, normalizedY: 0.5 });
      return;
    }

    targetRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    currentRef.current = { ...targetRef.current };

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
    };

    const animate = () => {
      const tx = targetRef.current.x;
      const ty = targetRef.current.y;
      const cx = currentRef.current.x;
      const cy = currentRef.current.y;

      currentRef.current.x = cx + (tx - cx) * smoothFactor;
      currentRef.current.y = cy + (ty - cy) * smoothFactor;

      setPosition({
        x: currentRef.current.x,
        y: currentRef.current.y,
        normalizedX: currentRef.current.x / window.innerWidth,
        normalizedY: currentRef.current.y / window.innerHeight,
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [disabled, smoothFactor]);

  return position;
}
