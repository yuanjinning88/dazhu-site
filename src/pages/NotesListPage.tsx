import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes, createNote, deleteNote, STATUS_LABEL, STATUS_STYLE, type NoteStatus } from '@/hooks/useSupabaseNotes';
import { useAuth } from '@/contexts/AuthContext';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const id = await createNote(title.trim());
    setCreating(false);
    if (id) onCreated(id);
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
        className="bg-white rounded-2xl p-8 w-full max-w-md border border-black/5 shadow-[rgba(0,0,0,0.08)_0px_8px_32px_0px]"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="text-[18px] font-semibold text-[#1d1d1f] tracking-[-0.374px] mb-1">新建笔记</h3>
        <p className="text-[14px] text-[#86868B] mb-6">标题可留空，稍后在编辑页补充</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full h-[44px] px-4 rounded-xl border border-black/10 text-[16px] text-[#1d1d1f] placeholder:text-[#86868B] outline-none focus:border-[#0066cc]/50 transition-colors mb-6"
          placeholder="笔记标题（可选）"
          autoFocus
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-black/10 text-[14px] text-[#86868B] hover:text-[#1d1d1f] transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={creating}
            className="flex-1 py-2.5 rounded-xl bg-[#0066cc] text-white text-[14px] font-medium hover:bg-[#0071e3] transition-colors disabled:opacity-50 active:scale-[0.97]"
          >
            {creating ? '创建中...' : '开始写作'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

export default function NotesListPage() {
  const { items, loading, refresh } = useNotes();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<NoteStatus | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(false);

  // Extract all unique tags from notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((item) => item.tags.forEach((t) => tagSet.add(t)));
    return [...tagSet].sort();
  }, [items]);

  // Filter notes by search + status + tag
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (tagFilter && !item.tags.includes(tagFilter)) return false;
      if (q) {
        const inTitle = item.title.toLowerCase().includes(q);
        const inTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const inContent = item.content.toLowerCase().includes(q);
        if (!inTitle && !inTags && !inContent) return false;
      }
      return true;
    });
  }, [items, search, statusFilter, tagFilter]);

  function handleCreated(id: string) {
    setShowCreate(false);
    navigate(`/notes/${id}/edit`);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await deleteNote(deleteTarget);
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
      <title>笔记 — 大猪</title>
      <meta name="description" content="学习笔记与资料整理" />
    </Helmet>
    <main className="min-h-screen pt-24 pb-24 bg-[#f5f5f7]">
      <div className="content-width max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <motion.h1
            className="text-[34px] font-semibold text-[#1d1d1f] tracking-[-0.374px] leading-[1.2] mb-2"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            笔记
          </motion.h1>
          <p className="text-[15px] text-[#86868B]">个人知识库</p>
        </div>

        {/* Toolbar: search + create */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
        >
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setTagFilter(null); }}
              className="w-full h-[40px] pl-10 pr-4 rounded-xl border border-black/10 bg-white text-[15px] text-[#1d1d1f] placeholder:text-[#86868B] outline-none focus:border-[#0066cc]/50 focus:bg-white transition-all"
              placeholder="按标题/标签/内容搜索..."
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1d1d1f]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0066cc] text-white text-[14px] font-medium hover:bg-[#0071e3] transition-colors active:scale-[0.97] shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
              新建笔记
            </button>
          )}
        </motion.div>

        {/* Status filter */}
        <motion.div
          className="flex items-center gap-2 mb-4 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
        >
          <span className="text-[12px] text-[#86868B] mr-1">状态</span>
          {(['all', 'inbox', 'draft', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-[12px] font-medium rounded-md border transition-all duration-200 ${
                statusFilter === s
                  ? 'border-[#0066cc]/30 bg-[#0066cc] text-white'
                  : 'border-black/5 bg-white text-[#86868B] hover:text-[#1d1d1f] hover:border-black/10'
              }`}
            >
              {s === 'all' ? '全部' : STATUS_LABEL[s]}
            </button>
          ))}
        </motion.div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <motion.div
            className="flex items-center gap-1.5 mb-8 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16 }}
          >
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={`px-2.5 py-0.5 text-[12px] rounded-md border transition-all duration-200 ${
                  tagFilter === tag
                    ? 'border-[#0066cc]/30 bg-[#0066cc]/[0.08] text-[#0066cc]'
                    : 'border-transparent bg-black/[0.04] text-[#6E6E73] hover:text-[#1d1d1f] hover:bg-black/[0.06]'
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}

        {/* List */}
        {loading ? (
          <p className="text-[15px] text-[#86868B] py-16 text-center">加载中...</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                >
                  <div className="relative group/card">
                    <Link
                      to={`/notes/${item.id}`}
                      className="block bg-white rounded-xl px-5 py-4 border border-black/5 hover:border-black/10 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${STATUS_STYLE[item.status]}`}>
                              {STATUS_LABEL[item.status]}
                            </span>
                            {item.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[11px] text-[#6E6E73] px-1.5 py-0.5 rounded bg-black/[0.03]">
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="text-[11px] text-[#86868B]">+{item.tags.length - 3}</span>
                            )}
                          </div>
                          <h3 className="text-[15px] font-medium text-[#1d1d1f] group-hover/card:text-[#0066cc] transition-colors duration-200 truncate">
                            {item.title || '无标题'}
                          </h3>
                          {item.description && (
                            <p className="text-[13px] text-[#86868B] mt-0.5 line-clamp-1">{item.description}</p>
                          )}
                        </div>
                        <span className="text-[12px] text-[#86868B] shrink-0 mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(item.id); }}
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
              ))}
            </AnimatePresence>

            {!loading && filtered.length === 0 && (
              <p className="text-center text-[15px] text-[#86868B] py-20">
                {search || tagFilter || statusFilter !== 'all' ? '没有匹配的笔记' : '还没有笔记，点击上方按钮创建'}
              </p>
            )}
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
  </>
  );
}
