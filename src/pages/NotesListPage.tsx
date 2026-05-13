import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes, addNote } from '@/hooks/useSupabaseNotes';
import Icon from '@/components/icons';

const categoryLabel: Record<string, string> = { dev: '开发', design: '设计', life: '生活' };
const difficultyLabel: Record<string, string> = { '入门': '入门', '进阶': '进阶', '深入': '深入' };

function AddNoteForm({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ title: '', category: 'dev', description: '', content: '', tags: '', difficulty: '进阶', readingTime: '5' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await addNote({
      title: form.title,
      category: form.category,
      description: form.description,
      content: form.content,
      tags: form.tags ? form.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
      difficulty: form.difficulty,
      readingTime: parseInt(form.readingTime) || 5,
    });
    setSaving(false);
    onAdded();
    onClose();
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold mb-4">添加笔记</h3>
        <div className="space-y-3">
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="标题 *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="flex gap-3">
            <select className="flex-1 px-3 py-2 rounded-lg border border-border text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {Object.entries(categoryLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select className="flex-1 px-3 py-2 rounded-lg border border-border text-sm" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {Object.keys(difficultyLabel).map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <select className="w-24 px-2 py-2 rounded-lg border border-border text-sm" value={form.readingTime} onChange={(e) => setForm({ ...form, readingTime: e.target.value })}>
              {[3, 5, 8, 10, 15, 20].map((n) => <option key={n} value={n}>{n}分钟</option>)}
            </select>
          </div>
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="标签（用逗号分隔，如：React, TypeScript）" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <input className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="一句话描述" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <textarea className="w-full px-3 py-2 rounded-lg border border-border text-sm resize-none" rows={5} placeholder="笔记内容（支持 Markdown）" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </div>
        <div className="flex gap-3 mt-4">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm text-text-muted">取消</button>
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-50">{saving ? '保存中...' : '添加'}</button>
        </div>
      </motion.form>
    </motion.div>
  );
}

export default function NotesListPage() {
  const { items, loading, refresh } = useNotes();
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="min-h-screen pt-20 pb-20">
      <div className="content-width">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.h1 className="text-4xl font-bold text-text-primary tracking-tight mb-2" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>笔记</motion.h1>
            <p className="text-text-muted">技术记录与知识备忘</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Icon name="check" size={16} /> 添加
          </button>
        </div>

        {loading ? (
          <p className="text-text-muted text-sm">加载中...</p>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                <Link to={`/notes/${item.id}`} className="block group bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs text-accent font-medium px-2 py-0.5 rounded-md bg-accent/5">{categoryLabel[item.category] || item.category}</span>
                    <span className="text-xs text-text-muted border border-border rounded-md px-2 py-0.5">{item.difficulty}</span>
                    <span className="text-xs text-text-muted">{item.readingTime} 分钟</span>
                    <span className="text-xs text-text-muted">{new Date(item.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <h3 className="text-base font-medium text-text-primary group-hover:text-accent transition-colors duration-200">{item.title}</h3>
                  {item.description && <p className="text-sm text-text-muted mt-1">{item.description}</p>}
                  {item.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-3">
                      {item.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-[11px] rounded-md bg-bg-secondary text-text-muted border border-border">{tag}</span>
                      ))}
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>{showForm && <AddNoteForm onClose={() => setShowForm(false)} onAdded={refresh} />}</AnimatePresence>
      </div>
    </main>
  );
}
