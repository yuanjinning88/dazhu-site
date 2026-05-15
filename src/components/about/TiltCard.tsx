import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export default function TiltCard({ children, className = '' }: TiltCardProps) {
  return (
    <>
      {/* Desktop: subtle lift on hover */}
      <motion.div
        className={`relative hidden md:block ${className}`}
        whileHover={{ y: -1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>

      {/* Mobile: static */}
      <div className={`relative md:hidden ${className}`}>
        {children}
      </div>
    </>
  );
}
