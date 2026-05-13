import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusic, addMusic, type MusicItem } from '@/hooks/useMusic';
import { generateCoverColors } from '@/lib/coverGenerator';
import { searchMusicCover } from '@/lib/coverFetcher';
import CoverImage from '@/components/ui/CoverImage';
import Icon from '@/components/icons';

function AddMusicForm({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ title: '', artist: '', year: '', genre: '', rating: '4', review: '', link: '' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { url } = await searchMusicCover(form.artist, form.title);
    await addMusic({
      title: form.title,
      artist: form.artist,
      year: parseInt(form.year) || 2024,
      genre: form.genre,
      rating: parseInt(form.rating) || 4,
      review: form.review,
      link: form.link || undefined,
      coverUrl: url,
      coverColors: generateCoverColors(`${form.title}-${form.artist}`),
    });
    setSaving(false);
    onAdded();
    onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="text-lg font-semibold mb-4">添加音乐</h3>
        <div className="space-y-3">
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="专辑名 *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="艺人 *" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} required />
          <div className="flex gap-3">
            <input className="w-24 px-3 py-2 rounded-lg border border-border text-sm" placeholder="年份" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            <input className="flex-1 px-3 py-2 rounded-lg border border-border text-sm" placeholder="风格" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
            <select className="w-20 px-2 py-2 rounded-lg border border-border text-sm" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'⭐'.repeat(n)}</option>)}
            </select>
          </div>
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="链接（选填）" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <textarea className="w-full px-3 py-2 rounded-lg border border-border text-sm resize-none" rows={3} placeholder="短评" value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} />
        </div>
        <div className="flex gap-3 mt-4">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm text-text-muted">取消</button>
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-50">{saving ? '保存中...' : '添加'}</button>
        </div>
      </motion.form>
    </motion.div>
  );
}

export default function MusicPage() {
  const { items, loading, refresh } = useMusic();
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="min-h-screen pt-20 pb-20">
      <div className="content-width">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.h1 className="text-4xl font-bold text-text-primary tracking-tight mb-2" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>音乐</motion.h1>
            <p className="text-text-muted">最近在听的专辑与单曲</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Icon name="check" size={16} /> 添加
          </button>
        </div>

        {loading ? (
          <p className="text-text-muted text-sm">加载中...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                <Link to={`/music/${item.id}`} className="block group">
                  <CoverImage src={item.coverUrl} alt={item.title} colors={item.coverColors} className="aspect-square rounded-2xl mb-3 transition-transform duration-300 group-hover:scale-[1.02]" />
                  <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{item.title}</h3>
                  <p className="text-xs text-text-muted">{item.artist} · {item.year}</p>
                  {item.review && <p className="text-xs text-text-muted mt-1 line-clamp-2">{item.review}</p>}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>{showForm && <AddMusicForm onClose={() => setShowForm(false)} onAdded={refresh} />}</AnimatePresence>
      </div>
    </main>
  );
}
