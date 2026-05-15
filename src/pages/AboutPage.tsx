import { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import AboutBackground from '@/components/about/AboutBackground';
import AboutSection from '@/components/about/AboutSection';
import TableOfContents from '@/components/about/TableOfContents';
import EditableSection from '@/components/about/EditableSection';
import TimelineEditor from '@/components/about/TimelineEditor';
import useActiveSection from '@/hooks/useActiveSection';
import { useAboutSections, updateAboutSection, type AboutSection as AboutSectionData } from '@/hooks/useAboutSections';
import { useAuth } from '@/contexts/AuthContext';

const heroTransition = { duration: 0.7, ease: [0.16, 1, 0.3, 1] };

interface SectionDef {
  id: string;
  title: string;
}

const sectionDefs: SectionDef[] = [
  { id: 'contact', title: '联系方式' },
  { id: 'about-site', title: '关于本站' },
  { id: 'about-me', title: '关于我' },
  { id: 'timeline', title: '大事记' },
];

// Default values used when Supabase data is absent
const defaults: Record<string, string> = {
  hero_name: 'Dazhu',
  hero_intro: '这里写一段关于你自己的简短介绍。',
  contact: 'hello@dazhu.dev',
  about_site: '["网站定位：这里写网站的定位说明。","内容来源：这里写内容的来源说明。","版权声明：这里写版权相关信息。"]',
  about_me: '["职业：这里写你的职业","爱好：这里写你的爱好","兴趣：这里写你的兴趣方向"]',
  timeline: '[{"date":"2024-01","text":"这里写事件描述。"},{"date":"2024-06","text":"这里写事件描述。"},{"date":"2025-01","text":"这里写事件描述。"}]',
};

function parseJsonArray(content: string): string[] | null {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed;
    }
  } catch {}
  return null;
}

interface TimelineItem {
  date: string;
  text: string;
}

function parseTimeline(content: string): TimelineItem[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.every((item) => item && typeof item.date === 'string' && typeof item.text === 'string')) {
      return parsed;
    }
  } catch {}
  return [];
}

export default function AboutPage() {
  const sectionIds = useMemo(() => sectionDefs.map((s) => s.id), []);
  const activeId = useActiveSection({ sectionIds });
  const { isAdmin } = useAuth();
  const { sections, loading, refresh } = useAboutSections();

  // Build lookup map: section_key → AboutSectionData
  const dataMap = useMemo(() => {
    const map: Record<string, AboutSectionData> = {};
    sections.forEach((s) => { map[s.section_key] = s; });
    return map;
  }, [sections]);

  const getContent = useCallback(
    (key: string) => dataMap[key]?.content ?? defaults[key] ?? '',
    [dataMap]
  );

  async function handleSave(id: string, content: string) {
    const ok = await updateAboutSection(id, { content });
    if (ok) refresh();
    return ok;
  }

  // Resolved values
  const heroName = getContent('hero_name');
  const heroIntro = getContent('hero_intro');
  const contact = getContent('contact');
  const aboutSiteRaw = getContent('about_site');
  const aboutMeRaw = getContent('about_me');
  const timelineRaw = getContent('timeline');

  const aboutSiteItems = parseJsonArray(aboutSiteRaw) ?? [aboutSiteRaw];
  const aboutMeItems = parseJsonArray(aboutMeRaw) ?? [aboutMeRaw];
  const timelineItems = parseTimeline(timelineRaw);

  // Editable section wrappers
  function wrapEdit(key: string, type: 'input' | 'textarea' = 'textarea') {
    const entry = dataMap[key];
    if (!entry) return null;
    return { id: entry.id, type };
  }

  const heroNameEdit = wrapEdit('hero_name', 'input');
  const heroIntroEdit = wrapEdit('hero_intro');
  const contactEdit = wrapEdit('contact', 'input');
  const aboutSiteEdit = wrapEdit('about_site');
  const aboutMeEdit = wrapEdit('about_me');
  const timelineEdit = dataMap['timeline'] ?? null;

  const [timelineEditing, setTimelineEditing] = useState(false);

  return (
    <main className="relative min-h-screen bg-white overflow-hidden font-serif">
      <AboutBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="flex gap-10 md:gap-16">
          {/* ===== 正文纸张面板 ===== */}
          <div className="relative flex-1 min-w-0 bg-[#fdfaf2] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.03),0_3px_12px_rgba(0,0,0,0.02)] p-6 md:p-10">
            {/* Paper noise */}
            <svg
              className="absolute inset-0 w-full h-full rounded-lg pointer-events-none"
              style={{ opacity: 0.022 }}
            >
              <filter id="panel-texture">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.35"
                  numOctaves="3"
                  stitchTiles="stitch"
                />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#panel-texture)" />
            </svg>

            <div className="relative">
            {/* Hero */}
            <motion.header
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={heroTransition}
            >
              <h1 className="text-[34px] md:text-[44px] font-semibold tracking-[-0.01em] leading-[1.2] mb-5 text-[#3d3828]">
                Hi, I&rsquo;m{' '}
                {heroNameEdit ? (
                  <EditableSection
                    isAdmin={isAdmin}
                    value={heroName}
                    onSave={(v) => handleSave(heroNameEdit.id, v)}
                    type="input"
                    placeholder="你的名字"
                  >
                    <span className="text-[#8b7d5c]">{heroName}</span>
                  </EditableSection>
                ) : (
                  <span className="text-[#8b7d5c]">{heroName}</span>
                )}
              </h1>
              <p className="text-base md:text-lg text-[#6b6552] leading-relaxed max-w-xl">
                {heroIntroEdit ? (
                  <EditableSection
                    isAdmin={isAdmin}
                    value={heroIntro}
                    onSave={(v) => handleSave(heroIntroEdit.id, v)}
                    placeholder="介绍你自己"
                  >
                    {heroIntro}
                  </EditableSection>
                ) : (
                  heroIntro
                )}
              </p>
            </motion.header>

            <hr className="my-12 md:my-14 border-[#d8d3c0]" />

            {/* 联系方式 */}
            <AboutSection delay={0.1}>
              <section id="contact">
                <h2 className="text-xl md:text-2xl font-medium text-[#3d3828] mb-4 tracking-[-0.01em]">
                  联系方式
                </h2>
                <p className="text-[15px] text-[#6b6552] leading-relaxed">
                  {contactEdit ? (
                    <EditableSection
                      isAdmin={isAdmin}
                      value={contact}
                      onSave={(v) => handleSave(contactEdit.id, v)}
                      type="input"
                      placeholder="your@email.com"
                    >
                      <a
                        href={`mailto:${contact}`}
                        className="text-[#8b7d5c] hover:text-[#6b5d3c] transition-colors duration-200"
                      >
                        {contact}
                      </a>
                    </EditableSection>
                  ) : (
                    <a
                      href={`mailto:${contact}`}
                      className="text-[#8b7d5c] hover:text-[#6b5d3c] transition-colors duration-200"
                    >
                      {contact}
                    </a>
                  )}
                </p>
              </section>
            </AboutSection>

            <hr className="my-12 md:my-14 border-[#d8d3c0]" />

            {/* 关于本站 */}
            <AboutSection delay={0.15}>
              <section id="about-site">
                <h2 className="text-xl md:text-2xl font-medium text-[#3d3828] mb-4 tracking-[-0.01em]">
                  关于本站
                </h2>
                {aboutSiteEdit ? (
                  <EditableSection
                    isAdmin={isAdmin}
                    value={aboutSiteItems.join('\n')}
                    onSave={(v) => {
                      const lines = v.split('\n').filter((l) => l.trim());
                      return handleSave(aboutSiteEdit.id, JSON.stringify(lines));
                    }}
                    placeholder="每行一个段落"
                  >
                    <div className="text-[15px] text-[#6b6552] leading-relaxed space-y-2.5">
                      {aboutSiteItems.map((item, i) => (
                        <p key={i}>{item}</p>
                      ))}
                    </div>
                  </EditableSection>
                ) : (
                  <div className="text-[15px] text-[#6b6552] leading-relaxed space-y-2.5">
                    {aboutSiteItems.map((item, i) => (
                      <p key={i}>{item}</p>
                    ))}
                  </div>
                )}
              </section>
            </AboutSection>

            <hr className="my-12 md:my-14 border-[#d8d3c0]" />

            {/* 关于我 */}
            <AboutSection delay={0.2}>
              <section id="about-me">
                <h2 className="text-xl md:text-2xl font-medium text-[#3d3828] mb-4 tracking-[-0.01em]">
                  关于我
                </h2>
                {aboutMeEdit ? (
                  <EditableSection
                    isAdmin={isAdmin}
                    value={aboutMeItems.join('\n')}
                    onSave={(v) => {
                      const lines = v.split('\n').filter((l) => l.trim());
                      return handleSave(aboutMeEdit.id, JSON.stringify(lines));
                    }}
                    placeholder="每行一个条目"
                  >
                    <ul className="text-[15px] text-[#6b6552] leading-relaxed space-y-1.5 list-none">
                      {aboutMeItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </EditableSection>
                ) : (
                  <ul className="text-[15px] text-[#6b6552] leading-relaxed space-y-1.5 list-none">
                    {aboutMeItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            </AboutSection>

            <hr className="my-12 md:my-14 border-[#d8d3c0]" />

            {/* 大事记 */}
            <AboutSection delay={0.25}>
              <section id="timeline">
                <h2 className="text-xl md:text-2xl font-medium text-[#3d3828] mb-4 tracking-[-0.01em]">
                  大事记
                </h2>
                {timelineEdit && timelineEditing ? (
                  <TimelineEditor
                    value={timelineItems}
                    onSave={async (v) => {
                      const ok = await handleSave(timelineEdit.id, v);
                      if (ok) setTimelineEditing(false);
                      return ok;
                    }}
                    onCancel={() => setTimelineEditing(false)}
                  />
                ) : (
                  <div className="relative group/section">
                    <ul className="text-[15px] text-[#6b6552] leading-relaxed space-y-3">
                      {timelineItems.map((item) => (
                        <li key={item.date + item.text} className="flex gap-4">
                          <span className="shrink-0 text-[#8a8468] tabular-nums">
                            {item.date}
                          </span>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                    {isAdmin && timelineEdit && (
                      <button
                        onClick={() => setTimelineEditing(true)}
                        className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-black/10 text-[#86868B] hover:text-[#0066cc] hover:border-[#0066cc]/30 opacity-0 group-hover/section:opacity-100 transition-all duration-200 shadow-sm"
                        title="编辑时间线"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </section>
            </AboutSection>
            </div>
          </div>

          {/* ===== 右侧目录 ===== */}
          <TableOfContents items={sectionDefs} activeId={activeId} />
        </div>
      </div>
    </main>
  );
}
