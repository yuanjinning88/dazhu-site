import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useMovies, addMovie, updateMovie, deleteMovie } from '@/hooks/useMovies';
import { generateCoverColors } from '@/lib/coverGenerator';
import { searchMovieCover } from '@/lib/coverFetcher';
import { useAuth } from '@/contexts/AuthContext';
import CoverImage from '@/components/ui/CoverImage';
import Icon from '@/components/icons';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

function AddMovieForm({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ titleZh: '', director: '', year: '', rating: '4', review: '', link: '', watchUrl: '' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { url } = await searchMovieCover(form.titleZh);
    await addMovie({
      title: form.titleZh,
      titleZh: form.titleZh,
      director: form.director,
      year: parseInt(form.year) || 2024,
      rating: parseInt(form.rating) || 4,
      review: form.review,
      link: form.link || undefined,
      watchUrl: form.watchUrl || undefined,
      coverUrl: url,
      posterColors: generateCoverColors(`${form.titleZh}-${form.director}`),
    });
    setSaving(false);
    onAdded();
    onClose();
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold mb-4">添加电影</h3>
        <div className="space-y-3">
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="片名 *" value={form.titleZh} onChange={(e) => setForm({ ...form, titleZh: e.target.value })} required />
          <div className="flex gap-3">
            <input className="flex-1 px-3 py-2 rounded-lg border border-border text-sm" placeholder="导演" value={form.director} onChange={(e) => setForm({ ...form, director: e.target.value })} />
            <input className="w-24 px-3 py-2 rounded-lg border border-border text-sm" placeholder="年份" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            <select className="w-20 px-2 py-2 rounded-lg border border-border text-sm" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'⭐'.repeat(n)}</option>)}
            </select>
          </div>
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="豆瓣链接" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="观看路径（选填）" value={form.watchUrl} onChange={(e) => setForm({ ...form, watchUrl: e.target.value })} />
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

function EditMovieForm({ item, onClose, onUpdated }: { item: import('@/hooks/useMovies').MovieItem; onClose: () => void; onUpdated: () => void }) {
  const [form, setForm] = useState({
    titleZh: item.titleZh,
    director: item.director,
    year: String(item.year),
    rating: String(item.rating),
    review: item.review,
    link: item.link || '',
    watchUrl: item.watchUrl || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    let coverUrl = item.coverUrl;
    if (form.titleZh !== item.titleZh) {
      const { url } = await searchMovieCover(form.titleZh);
      if (url) coverUrl = url;
    }

    await updateMovie(item.id, {
      title: form.titleZh,
      titleZh: form.titleZh,
      director: form.director,
      year: parseInt(form.year) || 2024,
      rating: parseInt(form.rating) || 4,
      review: form.review,
      link: form.link || undefined,
      watchUrl: form.watchUrl || undefined,
      coverUrl,
    });
    setSaving(false);
    onUpdated();
    onClose();
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold mb-4">编辑电影</h3>
        <div className="space-y-3">
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="片名 *" value={form.titleZh} onChange={(e) => setForm({ ...form, titleZh: e.target.value })} required />
          <div className="flex gap-3">
            <input className="flex-1 px-3 py-2 rounded-lg border border-border text-sm" placeholder="导演" value={form.director} onChange={(e) => setForm({ ...form, director: e.target.value })} />
            <input className="w-24 px-3 py-2 rounded-lg border border-border text-sm" placeholder="年份" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            <select className="w-20 px-2 py-2 rounded-lg border border-border text-sm" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'⭐'.repeat(n)}</option>)}
            </select>
          </div>
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="豆瓣链接" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="观看路径（选填）" value={form.watchUrl} onChange={(e) => setForm({ ...form, watchUrl: e.target.value })} />
          <textarea className="w-full px-3 py-2 rounded-lg border border-border text-sm resize-none" rows={3} placeholder="短评" value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} />
        </div>
        <div className="flex gap-3 mt-4">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm text-text-muted">取消</button>
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-50">{saving ? '保存中...' : '保存'}</button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          className={`w-3.5 h-3.5 ${n <= rating ? 'text-[#f5a623] fill-[#f5a623]' : 'text-[#d4d4d4]'}`}
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export default function MoviesPage() {
  const { items, loading, refresh } = useMovies();
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<import('@/hooks/useMovies').MovieItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await deleteMovie(deleteTarget);
    setDeleting(false);
    setDeleteTarget(null);
    if (ok) {
      refresh();
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    }
  }

  return (
    <><Helmet>
      <title>电影 — 大猪</title>
      <meta name="description" content="看过的电影" />
    </Helmet>
    <main className="min-h-screen pt-24 pb-24 bg-white">
      <div className="w-full px-6 md:px-10 max-w-[1440px] mx-auto">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-[24px] font-semibold text-[#1d1d1f] tracking-tight mb-1.5">
            电影
          </h1>
          <p className="text-[15px] text-[#86868B]">
            共记录了 {loading ? '...' : items.length} 部影视作品
          </p>
        </motion.div>

        {/* Add button */}
        {isAdmin && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
          >
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0066cc] text-white text-[14px] font-medium hover:bg-[#0071e3] transition-colors active:scale-[0.97]"
            >
              <Icon name="check" size={16} /> 添加
            </button>
          </motion.div>
        )}

        {/* Grid */}
        {loading ? (
          <p className="text-[15px] text-[#86868B] py-16 text-center">加载中...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map((item, i) => {
              const hasWatchUrl = !!item.watchUrl;
              const CardTag = hasWatchUrl ? 'a' : 'div';
              const cardProps = hasWatchUrl
                ? { href: item.watchUrl, target: '_blank', rel: 'noopener noreferrer' }
                : {};

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <div className="relative group/card">
                    {/* @ts-ignore — dynamic tag */}
                    <CardTag
                      {...cardProps}
                      className="block cursor-pointer"
                    >
                      <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-shadow duration-300 mb-3">
                        <CoverImage
                          src={item.coverUrl}
                          alt={item.titleZh}
                          colors={item.posterColors}
                          className="w-full h-full"
                        />
                      </div>
                      <h3 className="text-[14px] font-medium text-[#1d1d1f] text-center leading-tight mb-1.5 truncate px-1">
                        {item.titleZh}
                      </h3>
                      <div className="flex items-center justify-center gap-1.5">
                        <StarRating rating={item.rating} />
                        <span className="text-[13px] text-[#86868B]">{item.rating}.0</span>
                      </div>
                    </CardTag>

                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditTarget(item); }}
                          className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-black/5 text-[#86868B] hover:text-[#0071e3] hover:border-blue-200 hover:bg-blue-50 opacity-0 group-hover/card:opacity-100 transition-all duration-200"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(item.id); }}
                          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-black/5 text-[#86868B] hover:text-red-500 hover:border-red-200 hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition-all duration-200"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {toast && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#1d1d1f] text-white text-[14px] rounded-full shadow-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            删除成功
          </motion.div>
        )}

        <AnimatePresence>
          {showForm && <AddMovieForm onClose={() => setShowForm(false)} onAdded={refresh} />}
          {editTarget && (
            <EditMovieForm item={editTarget} onClose={() => setEditTarget(null)} onUpdated={refresh} />
          )}
          {deleteTarget && (
            <DeleteConfirmModal
              onClose={() => setDeleteTarget(null)}
              onConfirm={handleDelete}
              deleting={deleting}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  </>
  );
}
