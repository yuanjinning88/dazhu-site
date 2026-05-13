import { motion } from 'framer-motion';
import { useScrollProgress } from '@/hooks/useScrollProgress';

export default function ScrollProgress() {
  const { progress } = useScrollProgress();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-[2px] origin-left bg-accent"
      style={{ scaleX: progress }}
    />
  );
}
