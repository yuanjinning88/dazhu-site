import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSupabaseEssay } from '@/hooks/useSupabaseEssays';
import { useAuth } from '@/contexts/AuthContext';
import RichTextRenderer from '@/components/editor/RichTextRenderer';

const categoryLabel: Record<string, string> = {
  life: '生活',
  work: '工作',
  inspiration: '灵感',
};

export default function EssayPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAdmin } = useAuth();
  const { essay, loading } = useSupabaseEssay(slug);

  const post = essay
    ? { title: essay.title, date: essay.date, category: essay.category, description: essay.description, content: essay.content, contentFormat: essay.contentFormat, id: essay.id }
    : null;

  if (!post && !loading) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center">
          <p className="text-[17px] text-[#86868B] mb-4">文章未找到</p>
          <Link to="/essays" className="text-[#0066cc] text-[17px] hover:underline">返回随笔列表</Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center bg-[#f5f5f7]">
        <p className="text-[17px] text-[#86868B]">加载中...</p>
      </main>
    );
  }

  if (!post) return null;

  return (
    <>
      <Helmet>
        <title>{post.title ? `${post.title} — 大猪` : '大猪'}</title>
        <meta name="description" content={post.description || '随笔文章'} />
      </Helmet>
      <main className="min-h-screen pt-24 pb-24 bg-white">
      <div className="content-width">
        <motion.article
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between mb-10">
            <Link
              to="/essays"
              className="inline-flex items-center gap-1.5 text-[17px] text-[#0066cc] hover:text-[#0071e3] transition-colors duration-200"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              返回随笔列表
            </Link>

            {isAdmin && post.id && (
              <Link
                to={`/essays/${post.id}/edit`}
                className="px-4 py-2 rounded-full bg-[#0066cc] text-white text-[14px] font-medium hover:bg-[#0071e3] transition-colors active:scale-[0.97]"
              >
                编辑
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs text-[#0066cc] font-medium px-2.5 py-0.5 rounded-full bg-[#0066cc]/[0.06]">
              {categoryLabel[post.category] || post.category}
            </span>
            <span className="text-[14px] text-[#7a7a7a]">{post.date}</span>
          </div>

          <h1 className="text-[34px] font-semibold text-[#1d1d1f] tracking-[-0.374px] leading-[1.47] mb-3">
            {post.title}
          </h1>
          <p className="text-[24px] font-light text-[#86868B] leading-[1.5] mb-14">
            {post.description}
          </p>

          <div className="prose max-w-none
            prose-p:text-[17px] prose-p:text-[#1d1d1f] prose-p:leading-[1.47]
            prose-headings:text-[#1d1d1f] prose-headings:font-semibold prose-headings:tracking-[-0.374px]
            prose-h2:text-[28px] prose-h2:mt-14 prose-h2:mb-4 prose-h3:text-[21px] prose-h3:mt-10 prose-h3:mb-3
            prose-a:text-[#0066cc] prose-a:no-underline hover:prose-a:text-[#0071e3]
            prose-strong:text-[#1d1d1f]
            prose-code:text-[15px] prose-code:text-[#6E6E73] prose-code:before:content-none prose-code:after:content-none prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:bg-[#f5f5f7]
            prose-pre:bg-[#f5f5f7] prose-pre:border prose-pre:border-black/5 prose-pre:rounded-2xl prose-pre:shadow-none
            prose-li:text-[17px] prose-li:text-[#1d1d1f]
            prose-blockquote:border-l-[#0066cc] prose-blockquote:text-[#86868B] prose-blockquote:text-[17px]
            prose-hr:border-black/5
            prose-img:rounded-2xl
          ">
            <RichTextRenderer
              content={post.content}
              contentFormat={post.contentFormat || 'markdown'}
            />
          </div>
        </motion.article>

        <div className="max-w-2xl mx-auto mt-20 pt-8 border-t border-black/5">
          <Link
            to="/essays"
            className="inline-flex items-center gap-1.5 text-[17px] text-[#0066cc] hover:text-[#0071e3] transition-colors duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            返回随笔列表
          </Link>
        </div>
      </div>
    </main>
  </>
  );
}
