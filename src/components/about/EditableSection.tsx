import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditableSectionProps {
  isAdmin: boolean;
  value: string;
  onSave: (value: string) => Promise<boolean>;
  type?: 'input' | 'textarea';
  placeholder?: string;
  children: React.ReactNode;
}

export default function EditableSection({
  isAdmin,
  value,
  onSave,
  type = 'textarea',
  placeholder = '',
  children,
}: EditableSectionProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [error, setError] = useState('');

  if (!editing) {
    return (
      <div className="relative group/section">
        {children}
        {isAdmin && (
          <button
            onClick={() => { setEditValue(value); setError(''); setEditing(true); }}
            className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-black/10 text-[#86868B] hover:text-[#0066cc] hover:border-[#0066cc]/30 opacity-0 group-hover/section:opacity-100 transition-all duration-200 shadow-sm"
            title="编辑此板块"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    const ok = await onSave(editValue);
    setSaving(false);
    if (ok) {
      setSaveOk(true);
      setTimeout(() => { setSaveOk(false); setEditing(false); }, 600);
    } else {
      setError('保存失败，请检查网络或权限');
    }
  }

  function handleCancel() {
    setEditing(false);
    setEditValue(value);
    setError('');
  }

  return (
    <div className="relative">
      {type === 'input' ? (
        <input
          value={editValue}
          onChange={(e) => { setEditValue(e.target.value); setError(''); }}
          className="w-full h-[44px] px-4 rounded-xl border border-[#0066cc]/30 text-[15px] text-[#1d1d1f] bg-white outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]/20 transition-all"
          placeholder={placeholder}
          autoFocus
        />
      ) : (
        <textarea
          value={editValue}
          onChange={(e) => { setEditValue(e.target.value); setError(''); }}
          className="w-full min-h-[120px] p-4 rounded-xl border border-[#0066cc]/30 text-[15px] text-[#1d1d1f] bg-white outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]/20 transition-all resize-y leading-relaxed"
          placeholder={placeholder}
          autoFocus
        />
      )}

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 rounded-lg bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0071e3] transition-colors disabled:opacity-50 active:scale-[0.97]"
        >
          {saving ? '保存中...' : saveOk ? '已保存 ✓' : '保存'}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="px-4 py-1.5 rounded-lg border border-black/10 text-[13px] text-[#86868B] hover:text-[#1d1d1f] transition-colors"
        >
          取消
        </button>
        <AnimatePresence>
          {error && (
            <motion.span
              className="text-[13px] text-red-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
