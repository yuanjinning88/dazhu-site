import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSupabaseEssay, updateEssay } from '@/hooks/useSupabaseEssays';
import RichTextEditor from '@/components/editor/RichTextEditor';

const categoryLabel: Record<string, string> = {
  life: '生活',
  work: '工作',
  inspiration: '灵感',
};

export default function EssayEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { essay, loading } = useSupabaseEssay(slug);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('life');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [contentFormat, setContentFormat] = useState('markdown');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (essay) {
      setTitle(essay.title);
      setCategory(essay.category);
      setDescription(essay.description);
      setContent(essay.content);
      setContentFormat(essay.contentFormat || 'markdown');
    }
  }, [essay]);

  async function handleSave() {
    if (!slug) return;
    setSaving(true);
    const result = await updateEssay(slug, {
      title,
      category,
      description,
      content,
      content_format: 'tiptap-json',
    });
    setSaving(false);
    if ('ok' in result) {
      setSaved(true);
      setContentFormat('tiptap-json');
      setTimeout(() => setSaved(false), 2500);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center bg-[#f5f5f7]">
        <p className="text-[17px] text-[#86868B]">加载中...</p>
      </main>
    );
  }

  if (!essay) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center">
          <p className="text-[17px] text-[#86868B] mb-4">文章未找到</p>
          <Link to="/essays" className="text-[#0066cc] text-[17px] hover:underline">返回随笔列表</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-24 bg-[#f5f5f7]">
      <div className="content-width">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top toolbar */}
          <div className="flex items-center justify-between mb-10">
            <Link
              to="/essays"
              className="inline-flex items-center gap-1.5 text-[15px] text-[#86868B] hover:text-[#1d1d1f] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              返回列表
            </Link>

            <div className="flex items-center gap-3">
              {saved && (
                <motion.span
                  className="text-[14px] text-[#1aae39] font-medium"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  保存成功
                </motion.span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-full bg-[#0066cc] text-white text-[14px] font-medium hover:bg-[#0071e3] transition-colors disabled:opacity-50 active:scale-[0.97]"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-[34px] font-semibold text-[#1d1d1f] tracking-[-0.374px] leading-[1.47] bg-transparent border-none outline-none placeholder:text-[#86868B]/50 mb-3"
            placeholder="无标题"
          />

          {/* Meta */}
          <div className="flex items-center gap-3 mb-8">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs text-[#0066cc] font-medium px-2.5 py-1 rounded-full bg-[#0066cc]/[0.06] border-none outline-none cursor-pointer"
            >
              {Object.entries(categoryLabel).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 text-[15px] text-[#86868B] bg-transparent border-none outline-none placeholder:text-[#86868B]/40"
              placeholder="添加摘要（可选）"
            />
          </div>

          {/* Rich Text Editor */}
          <RichTextEditor
            content={content}
            contentFormat={contentFormat}
            onChange={setContent}
            placeholder="开始写作..."
          />
        </motion.div>
      </div>
    </main>
  );
}
