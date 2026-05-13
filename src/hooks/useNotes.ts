export interface NoteItem {
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

const modules = import.meta.glob('@/content/notes/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function getAllNotes(): NoteItem[] {
  return Object.entries(modules)
    .map(([path, raw]) => {
      const slug = path.split('/').pop()!.replace('.md', '');
      const { meta, body } = parseFrontmatter(raw);
      return {
        slug,
        title: meta.title || slug,
        date: meta.date || '',
        category: meta.category || '',
        description: meta.description || '',
        content: body,
      };
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export function getNote(slug: string): NoteItem | undefined {
  return getAllNotes().find((p) => p.slug === slug);
}
