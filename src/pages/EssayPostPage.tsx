import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPost } from '@/hooks/useBlogPosts';

const categoryLabel: Record<string, string> = {
  life: '生活',
  work: '工作',
  inspiration: '灵感',
};

export default function EssayPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = useMemo(() => (slug ? getPost(slug) : undefined), [slug]);

  if (!post) {
    return (
      <main className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">文章未找到</p>
          <Link to="/essays" className="text-accent text-sm hover:underline">返回随笔列表</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 pb-20">
      <div className="content-width">
        <motion.article
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            to="/essays"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors duration-200 mb-8"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            返回随笔列表
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-accent font-medium px-2 py-0.5 rounded-md bg-accent/5">
              {categoryLabel[post.category] || post.category}
            </span>
            <span className="text-xs text-text-muted">{post.date}</span>
          </div>

          <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
            {post.title}
          </h1>
          <p className="text-text-muted mb-10">{post.description}</p>

          {/* 纯文本渲染，无代码高亮 */}
          <div className="prose prose-sm md:prose-base max-w-none
            prose-headings:text-text-primary prose-headings:font-semibold
            prose-p:text-text-secondary prose-p:leading-relaxed
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-strong:text-text-primary
            prose-code:text-text-secondary prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-bg-secondary prose-pre:border prose-pre:border-border prose-pre:rounded-xl
            prose-li:text-text-secondary
            prose-blockquote:border-l-accent prose-blockquote:text-text-muted
            prose-hr:border-border
            prose-img:rounded-xl
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </motion.article>

        <div className="max-w-2xl mx-auto mt-16 pt-8 border-t border-border">
          <Link
            to="/essays"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            返回随笔列表
          </Link>
        </div>
      </div>
    </main>
  );
}
