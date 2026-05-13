import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, type PhotoRecord } from '@/lib/supabase';
import { generateCoverColors } from '@/lib/coverGenerator';
import Icon from '@/components/icons';

interface PhotoItem {
  id: string;
  title: string;
  date: string;
  imageUrl: string | null;
  colors: [string, string];
}

function AddPhotoForm({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ title: '', date: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { error: err } = await supabase.from('photos').insert({
      title: form.title,
      date: form.date,
      image_url: form.imageUrl || null,
      cover_colors: generateCoverColors(form.title || Date.now().toString()),
    });
    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    onAdded();
    onClose();
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold mb-4">添加照片</h3>
        <div className="space-y-3">
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="标题 *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="日期（如 2026-05）" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="图片链接（粘贴 URL，选填）" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm text-text-muted">取消</button>
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-50">{saving ? '保存中...' : '添加'}</button>
        </div>
      </motion.form>
    </motion.div>
  );
}

export default function PhotosPage() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const fetch = useCallback(async () => {
    setFetchError('');
    const { data, error } = await supabase.from('photos').select('*').order('created_at', { ascending: false });
    console.log('Supabase photos fetch:', { data, error: error?.message });
    if (error) {
      setFetchError(error.message);
      setLoading(false);
      return;
    }
    if (data) setItems((data as PhotoRecord[]).map((r) => ({ id: r.id, title: r.title, date: r.date, imageUrl: r.image_url, colors: (r.cover_colors?.length === 2 ? r.cover_colors : ['#6a5a4a', '#1a1a2a']) as [string, string] })));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <main className="min-h-screen pt-20 pb-20">
      <div className="content-width">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.h1 className="text-4xl font-bold text-text-primary tracking-tight mb-2" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>照片</motion.h1>
            <p className="text-text-muted">生活里的瞬间</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Icon name="check" size={16} /> 添加
          </button>
        </div>

        {fetchError && <p className="text-red-500 text-sm mb-4">读取错误：{fetchError}</p>}

        {loading ? (
          <p className="text-text-muted text-sm">加载中...</p>
        ) : items.length === 0 ? (
          <p className="text-text-muted text-sm">暂无照片，点右上角「添加」</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}>
                <div className="group cursor-pointer">
                  {item.imageUrl ? (
                    <div className="aspect-square rounded-2xl mb-2 overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-2xl mb-2 transition-transform duration-300 group-hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${item.colors[0]}, ${item.colors[1]})` }} />
                  )}
                  <p className="text-xs text-text-muted">{item.title}</p>
                  {item.date && <p className="text-xs text-text-muted/60">{item.date}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>{showForm && <AddPhotoForm onClose={() => setShowForm(false)} onAdded={fetch} />}</AnimatePresence>
      </div>
    </main>
  );
}
