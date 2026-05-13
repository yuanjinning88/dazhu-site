import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function SectionWrapper({
  id,
  children,
  className = '',
  delay = 0,
}: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      className={`section-padding ${className}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.section>
  );
}
