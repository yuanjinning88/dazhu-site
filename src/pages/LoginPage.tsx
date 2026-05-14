import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { isAdmin, login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAdmin) return <Navigate to="/" replace />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (login(password)) {
      navigate('/', { replace: true });
    } else {
      setError('密码错误');
      setPassword('');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
      <motion.div
        className="bg-white rounded-2xl p-10 w-full max-w-sm border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center mb-8">
          <svg viewBox="0 0 32 32" fill="none" className="w-10 h-10 mx-auto mb-4">
            <ellipse cx="16" cy="17" rx="11" ry="10" fill="#FFB8B8" />
            <ellipse cx="8" cy="9" rx="4" ry="5" fill="#FFA0A0" />
            <ellipse cx="24" cy="9" rx="4" ry="5" fill="#FFA0A0" />
            <circle cx="12" cy="16" r="1.5" fill="#4A4A4A" />
            <circle cx="20" cy="16" r="1.5" fill="#4A4A4A" />
            <ellipse cx="16" cy="20" rx="4.5" ry="3.5" fill="#FFA0A0" />
            <ellipse cx="14" cy="20" rx="0.8" ry="1" fill="#D48888" />
            <ellipse cx="18" cy="20" rx="0.8" ry="1" fill="#D48888" />
          </svg>
          <h1 className="text-[21px] font-semibold text-[#1d1d1f] tracking-[-0.374px] mb-1">管理员登录</h1>
          <p className="text-[14px] text-[#86868B]">请输入密码以继续</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className="w-full h-[44px] px-4 rounded-xl border border-black/10 text-[16px] text-[#1d1d1f] placeholder:text-[#86868B] outline-none focus:border-[#0066cc]/50 transition-colors mb-4"
            placeholder="密码"
            autoFocus
          />

          {error && (
            <p className="text-[13px] text-red-500 mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!password}
            className="w-full py-2.5 rounded-xl bg-[#0066cc] text-white text-[15px] font-medium hover:bg-[#0071e3] transition-colors disabled:opacity-40 active:scale-[0.98]"
          >
            登录
          </button>
        </form>
      </motion.div>
    </main>
  );
}
