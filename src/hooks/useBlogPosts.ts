import { useState, useEffect } from 'react';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  description: string;
  content: string;
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*"?(.*?)"?$/);
    if (m) meta[m[1]] = m[2];
  }
  return { meta, body: match[2].trim() };
}

const modules = import.meta.glob('@/content/blog/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function getAllPosts(): BlogPost[] {
  return Object.entries(modules)
    .map(([path, raw]) => {
      const slug = path.split('/').pop()!.replace('.md', '');
      const { meta, body } = parseFrontmatter(raw);
      return {
        slug,
        title: meta.title || slug,
        date: meta.date || '',
        category: meta.category || 'uncategorized',
        description: meta.description || '',
        content: body,
      };
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export function getPost(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getAllCategories(): string[] {
  return [...new Set(getAllPosts().map((p) => p.category))];
}

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  useEffect(() => { setPosts(getAllPosts()); }, []);
  return posts;
}
