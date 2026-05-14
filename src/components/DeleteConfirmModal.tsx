import { motion } from 'framer-motion';

interface DeleteConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
  deleting?: boolean;
}

export default function DeleteConfirmModal({ onClose, onConfirm, deleting }: DeleteConfirmModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 w-full max-w-sm border border-black/5 shadow-[rgba(0,0,0,0.12)_0px_8px_32px_0px]"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-red-500">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>

        <h3 className="text-[17px] font-semibold text-[#1d1d1f] text-center mb-1.5">确认删除</h3>
        <p className="text-[14px] text-[#86868B] text-center mb-6 leading-relaxed">
          确定要删除这条内容吗？此操作无法撤销。
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-black/10 text-[14px] text-[#86868B] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[14px] font-medium hover:bg-red-600 transition-colors disabled:opacity-50 active:scale-[0.97]"
          >
            {deleting ? '删除中...' : '确认删除'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
