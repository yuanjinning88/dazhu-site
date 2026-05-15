import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AboutSectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AboutSection({
  id,
  children,
  className = '',
  delay = 0,
}: AboutSectionProps) {
  return (
    <motion.section
      id={id}
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.section>
  );
}
