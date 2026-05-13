import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllPosts, getAllCategories, type BlogPost } from '@/hooks/useBlogPosts';

const categoryLabel: Record<string, string> = {
  life: '生活',
  work: '工作',
  inspiration: '灵感',
};

function EssayCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/essays/${post.slug}`}
        className="block group bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-accent font-medium px-2 py-0.5 rounded-md bg-accent/5">
            {categoryLabel[post.category] || post.category}
          </span>
          <span className="text-xs text-text-muted">{post.date}</span>
        </div>
        <h2 className="text-lg font-medium text-text-primary mb-2 group-hover:text-accent transition-colors duration-200">
          {post.title}
        </h2>
        <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
          {post.description}
        </p>
      </Link>
    </motion.div>
  );
}

export default function EssayListPage() {
  const posts = useMemo(() => getAllPosts(), []);
  const categories = useMemo(() => getAllCategories(), []);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = activeCategory === 'all'
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  return (
    <main className="min-h-screen pt-20 pb-20">
      <div className="content-width">
        <div className="text-center mb-10">
          <motion.h1
            className="text-4xl font-bold text-text-primary tracking-tight mb-3"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            随笔
          </motion.h1>
          <motion.p
            className="text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            思考与记录
          </motion.p>
        </div>

        {/* Filter */}
        {categories.length > 0 && (
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-1.5 text-xs rounded-full border transition-all duration-200 ${
                activeCategory === 'all'
                  ? 'border-accent/30 text-accent bg-accent/5'
                  : 'border-border text-text-muted hover:text-text-primary'
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
                    ? 'border-accent/30 text-accent bg-accent/5'
                    : 'border-border text-text-muted hover:text-text-primary'
                }`}
              >
                {categoryLabel[cat] || cat}
              </button>
            ))}
          </motion.div>
        )}

        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence mode="wait">
            {filtered.map((post, i) => (
              <EssayCard key={post.slug} post={post} index={i} />
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <p className="text-center text-text-muted text-sm py-10">
              该分类下暂无文章
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
