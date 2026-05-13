import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { supabase, type NoteRecord } from '@/lib/supabase';
import { type NoteItem } from '@/hooks/useSupabaseNotes';

const categoryLabel: Record<string, string> = { dev: '开发', design: '设计', life: '生活' };

function toItem(r: NoteRecord): NoteItem {
  return {
    id: r.id, title: r.title, category: r.category,
    description: r.description, content: r.content,
    tags: r.tags || [], difficulty: r.difficulty || '进阶',
    readingTime: r.reading_time || 5, createdAt: r.created_at,
  };
}

export default function NotesPostPage() {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<NoteItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from('notes').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setNote(toItem(data as NoteRecord));
      setLoading(false);
    });
  }, [id]);

  if (loading) return <main className="min-h-screen pt-20 flex items-center justify-center text-text-muted text-sm">加载中...</main>;
  if (!note) return (
    <main className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center"><p className="text-text-muted mb-4">笔记未找到</p><Link to="/notes" className="text-accent text-sm hover:underline">返回笔记列表</Link></div>
    </main>
  );

  return (
    <main className="min-h-screen pt-20 pb-20">
      <div className="content-width">
        <motion.article className="max-w-2xl mx-auto" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <Link to="/notes" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors duration-200 mb-8">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            返回笔记列表
          </Link>

          {/* Meta badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-accent font-medium px-2 py-0.5 rounded-md bg-accent/5">{categoryLabel[note.category] || note.category}</span>
            <span className="text-xs text-text-muted border border-border rounded-md px-2 py-0.5">{note.difficulty}</span>
            <span className="text-xs text-text-muted">{note.readingTime} 分钟</span>
            <span className="text-xs text-text-muted">{new Date(note.createdAt).toLocaleDateString('zh-CN')}</span>
          </div>

          {note.tags.length > 0 && (
            <div className="flex gap-1.5 mb-4">
              {note.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-[11px] rounded-md bg-bg-secondary text-text-muted border border-border">{tag}</span>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">{note.title}</h1>
          {note.description && <p className="text-text-muted mb-10">{note.description}</p>}

          {/* Markdown 渲染 + 代码高亮 */}
          <div className="prose prose-sm md:prose-base max-w-none
            prose-headings:text-text-primary prose-headings:font-semibold
            prose-p:text-text-secondary prose-p:leading-relaxed
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-strong:text-text-primary
            prose-code:text-accent prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:p-0 prose-pre:bg-transparent
            prose-li:text-text-secondary
            prose-blockquote:border-l-accent prose-blockquote:text-text-muted
            prose-hr:border-border
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
                          background:  '#1a1a1a',
                          fontSize: '0.875rem',
                        }}
                      >
                        {codeStr}
                      </SyntaxHighlighter>
                    );
                  }
                  return <code className="px-1.5 py-0.5 rounded-md bg-bg-secondary text-text-secondary text-sm" {...rest}>{children}</code>;
                },
              }}
            >
              {note.content}
            </ReactMarkdown>
          </div>
        </motion.article>
      </div>
    </main>
  );
}
