import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-24">
      <motion.div
        className="max-w-2xl mx-auto px-6 md:px-10"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* ===== 1. 自我介绍 ===== */}
        <motion.section className="mb-20" variants={item}>
          <h1 className="text-[32px] font-semibold text-[#1d1d1f] tracking-[-0.5px] mb-6">
            Hi, I'm Dazhu
          </h1>
          <p className="text-[15px] text-[#86868B] leading-relaxed">
            这里写一段关于你自己的简短介绍。
          </p>
        </motion.section>

        {/* ===== 2. 邮箱联系方式 ===== */}
        <motion.section className="mb-20" variants={item}>
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-3">
            联系方式
          </h2>
          <p className="text-[15px] text-[#86868B] leading-relaxed">
            <a
              href="mailto:hello@dazhu.dev"
              className="text-[#0071E3] hover:underline transition"
            >
              hello@dazhu.dev
            </a>
          </p>
        </motion.section>

        {/* ===== 3. 关于本站 ===== */}
        <motion.section className="mb-20" variants={item}>
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-3">
            关于本站
          </h2>
          <div className="text-[15px] text-[#86868B] leading-relaxed space-y-2">
            <p>
              网站定位：这里写网站的定位说明。
            </p>
            <p>
              内容来源：这里写内容的来源说明。
            </p>
            <p>
              版权声明：这里写版权相关信息。
            </p>
          </div>
        </motion.section>

        {/* ===== 4. 关于我 ===== */}
        <motion.section className="mb-20" variants={item}>
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-3">
            关于我
          </h2>
          <ul className="text-[15px] text-[#86868B] leading-relaxed space-y-1 list-none">
            <li>职业：这里写你的职业</li>
            <li>爱好：这里写你的爱好</li>
            <li>兴趣：这里写你的兴趣方向</li>
          </ul>
        </motion.section>

        {/* ===== 5. 大事记 ===== */}
        <motion.section variants={item}>
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-3">
            大事记
          </h2>
          <ul className="text-[15px] text-[#86868B] leading-relaxed space-y-3">
            <li className="flex gap-4">
              <span className="shrink-0 text-[#6E6E73]">2024-01</span>
              <span>这里写事件描述。</span>
            </li>
            <li className="flex gap-4">
              <span className="shrink-0 text-[#6E6E73]">2024-06</span>
              <span>这里写事件描述。</span>
            </li>
            <li className="flex gap-4">
              <span className="shrink-0 text-[#6E6E73]">2025-01</span>
              <span>这里写事件描述。</span>
            </li>
          </ul>
        </motion.section>
      </motion.div>
    </main>
  );
}
