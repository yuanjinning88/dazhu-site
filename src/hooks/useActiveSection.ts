import { useState, useEffect, useRef } from 'react';

interface UseActiveSectionOptions {
  sectionIds: string[];
  rootMargin?: string;
}

export default function useActiveSection({
  sectionIds,
  rootMargin = '-80px 0px -60% 0px',
}: UseActiveSectionOptions) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => {
            const aEl = a.target as HTMLElement;
            const bEl = b.target as HTMLElement;
            return aEl.getBoundingClientRect().top - bEl.getBoundingClientRect().top;
          });

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin,
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [sectionIds, rootMargin]);

  return activeId;
}
