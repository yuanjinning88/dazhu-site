import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CoverImage from '@/components/ui/CoverImage';
import { useMusic } from '@/hooks/useMusic';
import { useMovies } from '@/hooks/useMovies';
import { useNotes } from '@/hooks/useSupabaseNotes';
import { getAllPosts } from '@/hooks/useBlogPosts';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getRandomQuote } from '@/data/quotes';
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

const bgImages = Array.from({ length: 12 }, (_, i) => `/images/bg/bg-${String(i + 1).padStart(2, '0')}.png`);

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

  const randomQuote = useMemo(() => getRandomQuote(), []);

  const [bgUrl] = useState(() => bgImages[Math.floor(Math.random() * bgImages.length)]);
  const [bgLoaded, setBgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setBgLoaded(true);
    }
  }, []);

  const latestPosts = getAllPosts().slice(0, 3);
  const latestMusic = music.slice(0, 3);
  const latestMovies = movies.slice(0, 3);
  const latestNotes = notes.slice(0, 3);
  const latestPhotos = photos.slice(0, 4);

  return (
    <main>
      <section className="h-screen relative overflow-hidden">
        {/* Background image with scale-in animation */}
        <div
          className={`absolute inset-0 transition-all duration-[1.8s] ${
            bgLoaded ? 'scale-100 opacity-100' : 'scale-[1.4] opacity-0'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.5, 0, 0, 1)' }}
        >
          <img
            ref={imgRef}
            src={bgUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onLoad={() => setBgLoaded(true)}
          />
          <div className="absolute inset-0 bg-black/20 z-[1]" />
          <div className="absolute top-0 left-0 w-full h-1/4 min-h-[60px] bg-gradient-to-b from-white to-transparent z-[2]" />
        </div>

        {/* Hero content */}
        <div className="relative z-[4] h-full flex items-center content-width pt-14">
          <div>
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 drop-shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={bgLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.5, 0, 0, 1] }}
            >
              大猪
            </motion.h1>
            <motion.div
              className="max-w-md drop-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={bgLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.5, 0, 0, 1] }}
            >
              <p className="text-lg md:text-xl text-white/80 font-light">
                {randomQuote.text}
              </p>
              <p className="text-sm text-white/50 font-light mt-2">
                —— {randomQuote.source}
              </p>
            </motion.div>
          </div>
        </div>

        {/* SVG Waves */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none z-[3]">
          <svg
            className="w-full h-[80px] md:h-[100px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 24 150 28"
            preserveAspectRatio="none"
            shapeRendering="auto"
          >
            <defs>
              <path
                id="hero-wave"
                d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
              />
            </defs>
            <g>
              <use href="#hero-wave" x="48" y="0" fill="rgba(255,255,255,0.7)"
                style={{ animation: 'wave-move 7s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite', animationDelay: '-2s' }} />
              <use href="#hero-wave" x="48" y="3" fill="rgba(255,255,255,0.5)"
                style={{ animation: 'wave-move 10s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite', animationDelay: '-3s' }} />
              <use href="#hero-wave" x="48" y="5" fill="rgba(255,255,255,0.3)"
                style={{ animation: 'wave-move 13s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite', animationDelay: '-4s' }} />
              <use href="#hero-wave" x="48" y="7" fill="#ffffff"
                style={{ animation: 'wave-move 20s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite', animationDelay: '-5s' }} />
            </g>
          </svg>
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
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs text-text-muted border border-border rounded-md px-2 py-0.5">{item.status === 'inbox' ? '待整理' : item.status === 'archived' ? '已归档' : '草稿'}</span>
                      {item.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs text-text-muted bg-bg-secondary rounded-md px-2 py-0.5">{tag}</span>
                      ))}
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
