import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllPosts, type BlogPost } from '@/hooks/useBlogPosts';
import { useSupabaseEssays, createEssay, deleteEssay } from '@/hooks/useSupabaseEssays';
import { useAuth } from '@/contexts/AuthContext';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

const categoryLabel: Record<string, string> = {
  life: '生活',
  work: '工作',
  inspiration: '灵感',
};

function EssayCard({ post, index, onDelete }: { post: BlogPost | { slug: string; title: string; date: string; category: string; description: string; isSupabase?: boolean }; index: number; onDelete?: (slug: string) => void }) {
  const slug = 'isSupabase' in post && post.isSupabase ? post.slug : (post as BlogPost).slug;
  const isSupabase = 'isSupabase' in post && post.isSupabase;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative group/card">
        <Link
          to={`/essays/${slug}`}
          className="block bg-white rounded-2xl p-8 border border-black/5 hover:border-black/10 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-[#0066cc] font-medium px-2.5 py-0.5 rounded-full bg-[#0066cc]/[0.06]">
              {categoryLabel[post.category] || post.category}
            </span>
            <span className="text-[14px] text-[#7a7a7a]">{post.date}</span>
          </div>
          <h2 className="text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.374px] mb-2 group-hover/card:text-[#0066cc] transition-colors duration-200">
            {post.title}
          </h2>
          <p className="text-[17px] text-[#86868B] leading-relaxed line-clamp-2">
            {post.description}
          </p>
        </Link>
        {isSupabase && onDelete && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(slug); }}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-black/5 text-[#86868B] hover:text-red-500 hover:border-red-200 hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError('');
    setCreating(true);
    const result = await createEssay(title.trim());
    setCreating(false);
    if ('id' in result) {
      onCreated(result.id);
    } else {
      setError(result.error);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        className="bg-white rounded-2xl p-8 w-full max-w-md border border-black/5 shadow-[rgba(0,0,0,0.22)_3px_5px_30px_0]"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="text-[21px] font-semibold text-[#1d1d1f] tracking-[-0.374px] mb-1">新建随笔</h3>
        <p className="text-[14px] text-[#86868B] mb-6">输入标题后即可开始写作</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700 leading-relaxed">
            {error}
          </div>
        )}

        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(''); }}
          className="w-full h-[44px] px-4 rounded-full border border-black/10 text-[17px] text-[#1d1d1f] placeholder:text-[#86868B] outline-none focus:border-[#0066cc]/50 transition-colors mb-6"
          placeholder="文章标题"
          autoFocus
          required
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-black/10 text-[17px] text-[#86868B] hover:text-[#1d1d1f] transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="flex-1 py-2.5 rounded-full bg-[#0066cc] text-white text-[17px] font-medium hover:bg-[#0071e3] transition-colors disabled:opacity-50 active:scale-[0.97]"
          >
            {creating ? '创建中...' : '开始写作'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

export default function EssayListPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const staticPosts = useMemo(() => getAllPosts(), []);
  const { items: supabaseItems, loading, refresh } = useSupabaseEssays();
  const categories = useMemo(() => {
    const allCats = [...new Set([
      ...staticPosts.map((p) => p.category),
      ...supabaseItems.map((p) => p.category),
    ])];
    return allCats;
  }, [staticPosts, supabaseItems]);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(false);

  // Merge static + Supabase essays
  const allPosts = useMemo(() => {
    const supabase: Array<{ slug: string; title: string; date: string; category: string; description: string; isSupabase: true }> = supabaseItems.map((e) => ({
      slug: e.id,
      title: e.title,
      date: e.date,
      category: e.category,
      description: e.description,
      isSupabase: true as const,
    }));
    // Deduplicate: static posts take priority
    const staticSlugs = new Set(staticPosts.map((p) => p.slug));
    const filteredSupabase = supabase.filter((e) => !staticSlugs.has(e.slug));
    return [...staticPosts, ...filteredSupabase].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [staticPosts, supabaseItems]);

  const filtered = activeCategory === 'all'
    ? allPosts
    : allPosts.filter((p) => p.category === activeCategory);

  const handleCreated = useCallback((id: string) => {
    setShowCreate(false);
    navigate(`/essays/${id}/edit`);
  }, [navigate]);

  const handleDeleteOpen = useCallback((slug: string) => {
    setDeleteTarget(slug);
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await deleteEssay(deleteTarget);
    setDeleting(false);
    setDeleteTarget(null);
    if (ok) {
      refresh();
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-24 bg-[#f5f5f7]">
      <div className="content-width">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.h1
            className="text-[40px] font-semibold text-[#1d1d1f] tracking-[-0.5px] leading-[1.1] mb-4"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            随笔
          </motion.h1>
          <motion.p
            className="text-[21px] text-[#86868B] tracking-[0.231px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.5 }}
          >
            思考与记录
          </motion.p>
        </div>

        {/* Toolbar */}
        <motion.div
          className="flex items-center justify-between mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
        >
          {/* Filter pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-1.5 text-xs rounded-full border transition-all duration-200 ${
                  activeCategory === 'all'
                    ? 'border-[#0066cc]/30 bg-[#0066cc] text-white'
                    : 'border-black/10 text-[#86868B] hover:text-[#1d1d1f] hover:border-black/20'
                }`}
              >
                全部
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 text-xs rounded-full border transition-all duration-200 ${
                    activeCategory === cat
                      ? 'border-[#0066cc]/30 bg-[#0066cc] text-white'
                      : 'border-black/10 text-[#86868B] hover:text-[#1d1d1f] hover:border-black/20'
                  }`}
                >
                  {categoryLabel[cat] || cat}
                </button>
              ))}
            </div>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0066cc] text-white text-[14px] font-medium hover:bg-[#0071e3] transition-colors active:scale-[0.97] shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
              新建随笔
            </button>
          )}
        </motion.div>

        {/* List */}
        <div className="max-w-2xl mx-auto space-y-4">
          {loading && supabaseItems.length === 0 && staticPosts.length === 0 ? (
            <p className="text-center text-[#86868B] text-[17px] py-16">加载中...</p>
          ) : (
            <AnimatePresence mode="wait">
              {filtered.map((post, i) => (
                <EssayCard key={'slug' in post ? (post as BlogPost).slug : (post as { slug: string }).slug} post={post} index={i} onDelete={isAdmin ? handleDeleteOpen : undefined} />
              ))}
            </AnimatePresence>
          )}

          {!loading && filtered.length === 0 && (
            <p className="text-center text-[#86868B] text-[17px] py-16">
              该分类下暂无文章
            </p>
          )}
        </div>

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
          {showCreate && (
            <CreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
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
  );
}
