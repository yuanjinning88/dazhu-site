import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineItem {
  date: string;
  text: string;
}

interface TimelineEditorProps {
  value: TimelineItem[];
  onSave: (value: string) => Promise<boolean>;
  onCancel: () => void;
}

export default function TimelineEditor({ value, onSave, onCancel }: TimelineEditorProps) {
  const [items, setItems] = useState<TimelineItem[]>(() =>
    value.length > 0 ? value : [{ date: '', text: '' }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateItem(index: number, field: 'date' | 'text', val: string) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
    setError('');
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems((prev) => [...prev, { date: '', text: '' }]);
  }

  async function handleSave() {
    const filtered = items.filter((item) => item.date.trim() || item.text.trim());
    if (filtered.length === 0) return;
    setSaving(true);
    const ok = await onSave(JSON.stringify(filtered));
    setSaving(false);
    if (ok) {
      onCancel();
    } else {
      setError('保存失败，请检查网络或权限');
    }
  }

  return (
    <div>
      <ul className="space-y-3 mb-4">
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-3 items-start"
            >
              <input
                value={item.date}
                onChange={(e) => updateItem(i, 'date', e.target.value)}
                className="w-[110px] shrink-0 h-[38px] px-3 rounded-lg border border-black/10 text-[14px] text-[#1d1d1f] bg-white outline-none focus:border-[#0066cc]/30 transition-all font-mono"
                placeholder="2024-01"
              />
              <input
                value={item.text}
                onChange={(e) => updateItem(i, 'text', e.target.value)}
                className="flex-1 h-[38px] px-3 rounded-lg border border-black/10 text-[14px] text-[#1d1d1f] bg-white outline-none focus:border-[#0066cc]/30 transition-all"
                placeholder="事件描述"
              />
              <button
                onClick={() => removeItem(i)}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#86868B] hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <button
        onClick={addItem}
        className="flex items-center gap-1.5 text-[13px] text-[#0066cc] hover:text-[#0071e3] transition-colors mb-4"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
        添加事件
      </button>

      {error && (
        <p className="text-[13px] text-red-500 mb-3">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 rounded-lg bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0071e3] transition-colors disabled:opacity-50 active:scale-[0.97]"
        >
          {saving ? '保存中...' : '保存'}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-1.5 rounded-lg border border-black/10 text-[13px] text-[#86868B] hover:text-[#1d1d1f] transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
}
