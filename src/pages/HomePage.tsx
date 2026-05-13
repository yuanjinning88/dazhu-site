import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CoverImage from '@/components/ui/CoverImage';
import { useMusic } from '@/hooks/useMusic';
import { useMovies } from '@/hooks/useMovies';
import { useNotes } from '@/hooks/useSupabaseNotes';
import { getAllPosts } from '@/hooks/useBlogPosts';
import { useState, useEffect, useCallback } from 'react';
import { supabase, type PhotoRecord } from '@/lib/supabase';

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <h2 className="text-xl font-semibold text-text-primary tracking-tight">{title}</h2>
      <Link to={href} className="text-sm text-text-muted hover:text-accent transition-colors duration-200">查看全部</Link>
    </div>
  );
}

const cardReveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } }),
};

export default function HomePage() {
  const { items: music } = useMusic();
  const { items: movies } = useMovies();
  const { items: notes } = useNotes();
  const [photos, setPhotos] = useState<{ id: string; title: string; imageUrl: string | null; colors: [string, string] }[]>([]);

  const fetchPhotos = useCallback(async () => {
    const { data } = await supabase.from('photos').select('*').order('created_at', { ascending: false }).limit(4);
    if (data) setPhotos((data as PhotoRecord[]).map((r) => ({ id: r.id, title: r.title, imageUrl: r.image_url, colors: (r.cover_colors?.length === 2 ? r.cover_colors : ['#6a5a4a', '#1a1a2a']) as [string, string] })));
  }, []);
  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const latestPosts = getAllPosts().slice(0, 3);
  const latestMusic = music.slice(0, 3);
  const latestMovies = movies.slice(0, 3);
  const latestNotes = notes.slice(0, 3);
  const latestPhotos = photos.slice(0, 4);

  return (
    <main>
      <section className="min-h-[70vh] flex items-center pt-14">
        <div className="content-width">
          <motion.h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary tracking-tight mb-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            大猪
          </motion.h1>
          <motion.p className="text-lg md:text-xl text-text-secondary font-light max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
            写代码，听音乐，看电影，偶尔拍照。
          </motion.p>
        </div>
      </section>

      {latestPosts.length > 0 && (
        <SectionWrapper>
          <div className="content-width">
            <SectionHeader title="随笔" href="/essays" />
            <div className="grid md:grid-cols-3 gap-5">
              {latestPosts.map((post, i) => (
                <motion.div key={post.slug} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={cardReveal}>
                  <Link to={`/essays/${post.slug}`} className="block group bg-bg-secondary rounded-2xl p-6 h-full hover:shadow-card-hover transition-shadow duration-300">
                    <p className="text-xs text-text-muted mb-3">{post.date}</p>
                    <h3 className="text-base font-medium text-text-primary mb-2 group-hover:text-accent transition-colors duration-200">{post.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed line-clamp-2">{post.description}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      )}

      {latestMusic.length > 0 && (
        <SectionWrapper className="bg-bg-secondary">
          <div className="content-width">
            <SectionHeader title="最近在听" href="/music" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {latestMusic.map((item, i) => (
                <motion.div key={item.id} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={cardReveal}>
                  <Link to={`/music/${item.id}`} className="block group cursor-pointer">
                    <CoverImage src={item.coverUrl} alt={item.title} colors={item.coverColors} className="aspect-square rounded-2xl mb-3 transition-transform duration-300 group-hover:scale-[1.02]" />
                    <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{item.title}</p>
                    <p className="text-xs text-text-muted">{item.artist} · {item.year}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      )}

      {latestMovies.length > 0 && (
        <SectionWrapper>
          <div className="content-width">
            <SectionHeader title="最近在看" href="/movies" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {latestMovies.map((item, i) => (
                <motion.div key={item.id} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={cardReveal}>
                  <Link to={`/movies/${item.id}`} className="block group cursor-pointer">
                    <CoverImage src={item.coverUrl} alt={item.titleZh} colors={item.posterColors} className="aspect-[2/3] rounded-2xl mb-3 transition-transform duration-300 group-hover:scale-[1.02]" />
                    <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{item.titleZh}</p>
                    <p className="text-xs text-text-muted">{item.director} · {item.year}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      )}

      {latestNotes.length > 0 && (
        <SectionWrapper className="bg-bg-secondary">
          <div className="content-width">
            <SectionHeader title="笔记" href="/notes" />
            <div className="grid md:grid-cols-3 gap-5">
              {latestNotes.map((item, i) => (
                <motion.div key={item.id} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={cardReveal}>
                  <Link to={`/notes/${item.id}`} className="block group bg-white rounded-2xl p-6 h-full shadow-card hover:shadow-card-hover transition-shadow duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-text-muted border border-border rounded-md px-2 py-0.5">{item.difficulty}</span>
                      <span className="text-xs text-text-muted">{item.readingTime} 分钟</span>
                    </div>
                    <h3 className="text-base font-medium text-text-primary mb-2 group-hover:text-accent transition-colors duration-200">{item.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed line-clamp-2">{item.description}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      )}

      {latestPhotos.length > 0 && (
        <SectionWrapper>
          <div className="content-width">
            <SectionHeader title="照片" href="/photos" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {latestPhotos.map((item, i) => (
                <motion.div key={item.id} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={cardReveal}>
                  <div className="group cursor-pointer">
                    {item.imageUrl ? (
                      <div className="aspect-square rounded-2xl mb-2 overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-2xl mb-2 transition-transform duration-300 group-hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${item.colors[0]}, ${item.colors[1]})` }} />
                    )}
                    <p className="text-xs text-text-muted">{item.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      )}
    </main>
  );
}
