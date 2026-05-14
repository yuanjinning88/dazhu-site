import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { supabase, type NoteRecord } from '@/lib/supabase';
import { type NoteItem, type NoteStatus, STATUS_LABEL, STATUS_STYLE, updateNote } from '@/hooks/useSupabaseNotes';

function toItem(r: NoteRecord): NoteItem {
  return {
    id: r.id,
    title: r.title,
    status: (r.category as NoteStatus) || 'draft',
    description: r.description,
    content: r.content,
    tags: r.tags || [],
    source: r.difficulty || '',
    createdAt: r.created_at,
  };
}

export default function NotesEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [note, setNote] = useState<NoteItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<NoteStatus>('draft');
  const [tagsInput, setTagsInput] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from('notes').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        const n = toItem(data as NoteRecord);
        setNote(n);
        setTitle(n.title);
        setStatus(n.status);
        setTagsInput(n.tags.join(', '));
        setSource(n.source);
        setDescription(n.description);
        setContent(n.content);
      }
      setLoading(false);
    });
  }, [id]);

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    const tags = tagsInput
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const ok = await updateNote(id, { title, status, description, content, tags, source: source.trim() });
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center bg-[#f5f5f7]">
        <p className="text-[15px] text-[#86868B]">加载中...</p>
      </main>
    );
  }

  if (!note) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center">
          <p className="text-[15px] text-[#86868B] mb-4">笔记未找到</p>
          <Link to="/notes" className="text-[#0066cc] text-[14px] font-medium hover:underline">返回笔记列表</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-24 bg-[#f5f5f7]">
      <div className="content-width max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to={`/notes/${id}`}
              className="inline-flex items-center gap-1.5 text-[14px] text-[#86868B] hover:text-[#1d1d1f] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              返回笔记
            </Link>

            <div className="flex items-center gap-3">
              {saved && (
                <motion.span
                  className="text-[13px] text-[#1aae39] font-medium"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  保存成功
                </motion.span>
              )}
              <div className="flex items-center bg-white rounded-lg border border-black/10 p-0.5">
                <button
                  onClick={() => setPreview(false)}
                  className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 ${!preview ? 'bg-[#1d1d1f] text-white' : 'text-[#86868B] hover:text-[#1d1d1f]'}`}
                >
                  编辑
                </button>
                <button
                  onClick={() => setPreview(true)}
                  className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 ${preview ? 'bg-[#1d1d1f] text-white' : 'text-[#86868B] hover:text-[#1d1d1f]'}`}
                >
                  预览
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-[#0066cc] text-white text-[14px] font-medium hover:bg-[#0071e3] transition-colors disabled:opacity-50 active:scale-[0.97]"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-[28px] font-semibold text-[#1d1d1f] tracking-[-0.5px] leading-[1.3] bg-transparent border-none outline-none placeholder:text-[#86868B]/50 mb-6"
            placeholder="无标题"
          />

          {/* Notion-style properties */}
          <div className="bg-white rounded-xl border border-black/5 overflow-hidden mb-8">
            {/* Status row */}
            <div className="flex items-center px-5 py-3 border-b border-black/[0.04] gap-4">
              <span className="text-[13px] text-[#86868B] w-14 shrink-0">状态</span>
              <div className="flex gap-2">
                {(['inbox', 'draft', 'archived'] as NoteStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1 text-[12px] font-medium rounded-md border transition-all duration-200 ${
                      status === s
                        ? `${STATUS_STYLE[s]} ring-1 ring-offset-0`
                        : 'border-transparent bg-black/[0.03] text-[#86868B] hover:text-[#1d1d1f]'
                    }`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags row */}
            <div className="flex items-center px-5 py-3 border-b border-black/[0.04] gap-4">
              <span className="text-[13px] text-[#86868B] w-14 shrink-0">标签</span>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="flex-1 text-[14px] text-[#1d1d1f] bg-transparent outline-none placeholder:text-[#86868B]/50"
                placeholder="用逗号分隔多个标签，如：React, TypeScript, 前端"
              />
            </div>

            {/* Source row */}
            <div className="flex items-center px-5 py-3 border-b border-black/[0.04] gap-4">
              <span className="text-[13px] text-[#86868B] w-14 shrink-0">来源</span>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="flex-1 text-[14px] text-[#0066cc] bg-transparent outline-none placeholder:text-[#86868B]/50"
                placeholder="参考链接（可选）"
              />
            </div>

            {/* Description row */}
            <div className="flex items-center px-5 py-3 gap-4">
              <span className="text-[13px] text-[#86868B] w-14 shrink-0">摘要</span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 text-[14px] text-[#1d1d1f] bg-transparent outline-none placeholder:text-[#86868B]/50"
                placeholder="一句话描述（可选）"
              />
            </div>
          </div>

          {/* Editor / Preview */}
          {preview ? (
            <div className="bg-white rounded-xl border border-black/5 p-10 min-h-[500px]">
              <div className="prose max-w-none
                prose-p:text-[16px] prose-p:text-[#1d1d1f] prose-p:leading-[1.55]
                prose-headings:text-[#1d1d1f] prose-headings:font-semibold
                prose-h2:text-[22px] prose-h2:mt-10 prose-h2:mb-3
                prose-h3:text-[18px] prose-h3:mt-8 prose-h3:mb-2
                prose-a:text-[#0066cc] prose-a:no-underline
                prose-strong:text-[#1d1d1f]
                prose-code:text-[14px] prose-code:text-[#6E6E73] prose-code:before:content-none prose-code:after:content-none prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:bg-[#f5f5f7] prose-code:font-medium
                prose-pre:p-0 prose-pre:bg-transparent
                prose-li:text-[16px] prose-li:text-[#1d1d1f]
                prose-blockquote:border-l-[#0066cc] prose-blockquote:text-[#86868B]
                prose-hr:border-black/5
                prose-img:rounded-xl
              ">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...rest }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeStr = String(children).replace(/\n$/, '');
                      if (match) {
                        return (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: '0.75rem',
                              background: '#1a1a1a',
                              fontSize: '0.875rem',
                            }}
                          >
                            {codeStr}
                          </SyntaxHighlighter>
                        );
                      }
                      return <code className="px-1.5 py-0.5 rounded-md bg-[#f5f5f7] text-[#6E6E73] text-[14px] font-medium" {...rest}>{children}</code>;
                    },
                  }}
                >
                  {content || '*暂无内容*'}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[500px] bg-white rounded-xl border border-black/5 p-10 text-[16px] text-[#1d1d1f] leading-[1.55] resize-y outline-none focus:border-[#0066cc]/30 focus:shadow-sm transition-all placeholder:text-[#86868B]/50"
              placeholder="开始写作...（支持 Markdown）"
              autoFocus
            />
          )}
        </motion.div>
      </div>
    </main>
  );
}
