import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, type MovieRecord } from '@/lib/supabase';
import { type MovieItem } from '@/hooks/useMovies';
import CoverImage from '@/components/ui/CoverImage';
import Icon from '@/components/icons';

function toItem(r: MovieRecord): MovieItem {
  return {
    id: r.id, title: r.title, titleZh: r.title_zh, director: r.director,
    year: r.year, rating: r.rating, review: r.review,
    link: r.link || undefined,
    coverUrl: r.cover_url || null,
    posterColors: (r.cover_colors?.length === 2 ? r.cover_colors : ['#1a1a2a', '#4a5a6a']) as [string, string],
  };
}

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<MovieItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from('movies').select('*').eq('id', id).single().then(({ data }) => {
      if (data) { const m = toItem(data as MovieRecord); setItem(m); setReview(m.review); }
      setLoading(false);
    });
  }, [id]);

  async function saveReview() {
    if (!id) return;
    setSaving(true);
    await supabase.from('movies').update({ review }).eq('id', id);
    setSaving(false);
    setEditing(false);
    if (item) setItem({ ...item, review });
  }

  if (loading) return <main className="min-h-screen pt-20 flex items-center justify-center text-text-muted text-sm">加载中...</main>;
  if (!item) return (
    <main className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center"><p className="text-text-muted mb-4">未找到</p><Link to="/movies" className="text-accent text-sm hover:underline">返回电影库</Link></div>
    </main>
  );

  return (
    <main className="min-h-screen pt-20 pb-20">
      <div className="content-width">
        <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <Link to="/movies" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-8">
            <Icon name="arrow-left" size={16} /> 返回电影库
          </Link>

          <div className="flex gap-6 mb-8">
            <CoverImage src={item.coverUrl} alt={item.titleZh} colors={item.posterColors} className="w-28 h-40 md:w-32 md:h-44 rounded-2xl flex-shrink-0" />
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">{item.titleZh}</h1>
              <p className="text-text-muted text-sm mt-1">{item.title}</p>
              <p className="text-text-secondary text-sm mt-2">{item.director} · {item.year}</p>
              <p className="text-sm mt-1">{'⭐'.repeat(item.rating)}</p>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm text-accent hover:underline">
                  查看链接 <Icon name="external" size={14} />
                </a>
              )}
            </div>
          </div>

          <div className="bg-bg-secondary rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-text-primary">备注</h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="text-xs text-accent hover:underline">编辑</button>
              )}
            </div>
            {editing ? (
              <div>
                <textarea className="w-full px-3 py-2 rounded-lg border border-border text-sm resize-none bg-white" rows={4} value={review} onChange={(e) => setReview(e.target.value)} />
                <div className="flex gap-2 mt-2">
                  <button onClick={saveReview} disabled={saving} className="px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-medium disabled:opacity-50">{saving ? '保存中...' : '保存'}</button>
                  <button onClick={() => { setReview(item.review); setEditing(false); }} className="px-4 py-1.5 rounded-lg border border-border text-xs text-text-muted">取消</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{item.review || '暂无备注'}</p>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
