import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuLink {
  label: string;
  to: string;
}

// 预留扩展：后续加链接只需在此数组新增
const links: MenuLink[] = [
  { label: '关于', to: '/about' },
  // { label: '书单', to: '/books' },
  // { label: '友链', to: '/links' },
];

export default function SideMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // 路由变化关闭
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <>
      {/* 汉堡按钮 */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="菜单"
        className="fixed left-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-[5px] p-2 group"
      >
        <motion.span
          animate={open ? { rotate: 45, y: 6.5, width: 18 } : { rotate: 0, y: 0, width: 18 }}
          className="block h-[1.5px] bg-text-muted group-hover:bg-text-primary transition-colors duration-200 origin-center"
        />
        <motion.span
          animate={open ? { opacity: 0, width: 0 } : { opacity: 1, width: 18 }}
          className="block h-[1.5px] bg-text-muted group-hover:bg-text-primary transition-colors duration-200"
        />
        <motion.span
          animate={open ? { rotate: -45, y: -6.5, width: 18 } : { rotate: 0, y: 0, width: 18 }}
          className="block h-[1.5px] bg-text-muted group-hover:bg-text-primary transition-colors duration-200 origin-center"
        />
      </button>

      {/* 背景遮罩 */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 hidden md:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* 侧边栏面板 */}
      <AnimatePresence>
        {open && (
          <motion.aside
            ref={ref}
            className="fixed left-0 top-0 bottom-0 z-50 hidden md:flex flex-col
              w-48 bg-white/95 backdrop-blur-xl border-r border-border shadow-sm"
            initial={{ x: -192 }}
            animate={{ x: 0 }}
            exit={{ x: -192 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* 占位：与导航栏等高 */}
            <div className="h-14" />

            {/* 链接列表 */}
            <div className="flex-1 flex flex-col justify-center px-8 pb-14">
              <div className="space-y-1">
                {links.map((link) => {
                  const active = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block text-sm transition-colors duration-200 ${
                        active
                          ? 'text-text-primary'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
