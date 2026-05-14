import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { supabase, type NoteRecord } from '@/lib/supabase';
import { type NoteItem, type NoteStatus, STATUS_LABEL, STATUS_STYLE } from '@/hooks/useSupabaseNotes';
import { useAuth } from '@/contexts/AuthContext';

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

export default function NotesPostPage() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const [note, setNote] = useState<NoteItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from('notes').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setNote(toItem(data as NoteRecord));
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <main className="min-h-screen pt-24 flex items-center justify-center bg-[#f5f5f7] text-[15px] text-[#86868B]">
      加载中...
    </main>
  );

  if (!note) return (
    <main className="min-h-screen pt-24 flex items-center justify-center bg-[#f5f5f7]">
      <div className="text-center">
        <p className="text-[15px] text-[#86868B] mb-4">笔记未找到</p>
        <Link to="/notes" className="text-[#0066cc] text-[14px] font-medium hover:underline">返回笔记列表</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen pt-24 pb-24 bg-[#f5f5f7]">
      <div className="content-width max-w-3xl mx-auto">
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/notes"
              className="inline-flex items-center gap-1.5 text-[14px] text-[#86868B] hover:text-[#1d1d1f] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              返回笔记列表
            </Link>
            {isAdmin && (
              <Link
                to={`/notes/${note.id}/edit`}
                className="px-4 py-2 rounded-lg bg-[#0066cc] text-white text-[14px] font-medium hover:bg-[#0071e3] transition-colors active:scale-[0.97]"
              >
                编辑
              </Link>
            )}
          </div>

          {/* Title */}
          <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-[-0.5px] leading-[1.3] mb-5">
            {note.title || '无标题'}
          </h1>

          {/* Meta pills */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className={`text-[12px] font-medium px-2.5 py-0.5 rounded-md border ${STATUS_STYLE[note.status]}`}>
              {STATUS_LABEL[note.status]}
            </span>
            {note.tags.map((tag) => (
              <span key={tag} className="text-[12px] text-[#6E6E73] px-2 py-0.5 rounded-md bg-black/[0.04]">
                {tag}
              </span>
            ))}
            <span className="text-[13px] text-[#86868B]">
              {new Date(note.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>

          {/* Description */}
          {note.description && (
            <p className="text-[16px] text-[#86868B] leading-[1.5] mb-10 pb-8 border-b border-black/[0.06]">
              {note.description}
            </p>
          )}

          {/* Content */}
          <div className="bg-white rounded-xl border border-black/5 p-10">
            <div className="prose max-w-none
              prose-p:text-[16px] prose-p:text-[#1d1d1f] prose-p:leading-[1.55]
              prose-headings:text-[#1d1d1f] prose-headings:font-semibold
              prose-h2:text-[22px] prose-h2:mt-10 prose-h2:mb-3
              prose-h3:text-[18px] prose-h3:mt-8 prose-h3:mb-2
              prose-a:text-[#0066cc] prose-a:no-underline hover:prose-a:text-[#005bab]
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
                {note.content || '*暂无内容*'}
              </ReactMarkdown>
            </div>
          </div>

          {/* Source link */}
          {note.source && (
            <div className="mt-6 pt-6 border-t border-black/[0.06]">
              <a
                href={note.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[14px] text-[#0066cc] hover:text-[#005bab] transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
                来源链接
              </a>
            </div>
          )}
        </motion.article>

        {/* Bottom nav */}
        <div className="mt-16 pt-8 border-t border-black/[0.06]">
          <Link
            to="/notes"
            className="inline-flex items-center gap-1.5 text-[14px] text-[#86868B] hover:text-[#1d1d1f] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            返回笔记列表
          </Link>
        </div>
      </div>
    </main>
  );
}
