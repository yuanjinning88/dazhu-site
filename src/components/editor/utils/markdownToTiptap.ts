// Simple Markdown to TipTap JSON converter
// Handles common constructs: headings, paragraphs, bold, italic, inline code,
// links, images, code blocks, blockquotes, lists, horizontal rules

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: TiptapMark[];
}

interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export function markdownToTiptap(md: string): { type: string; content: TiptapNode[] } {
  if (!md || !md.trim()) {
    return { type: 'doc', content: [] };
  }

  const lines = md.split('\n');
  const content: TiptapNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(---|\*\*\*|___)\s*$/.test(line.trim())) {
      content.push({ type: 'horizontalRule' });
      i++;
      continue;
    }

    // Code block (fenced)
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      content.push({
        type: 'codeBlock',
        attrs: lang ? { language: lang } : {},
        content: codeLines.length
          ? [{ type: 'text', text: codeLines.join('\n') }]
          : undefined,
      });
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      content.push({
        type: 'heading',
        attrs: { level },
        content: parseInline(headingMatch[2]),
      });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      content.push({
        type: 'blockquote',
        content: quoteLines.length
          ? [{ type: 'paragraph', content: parseInline(quoteLines.join(' ')) }]
          : undefined,
      });
      continue;
    }

    // Unordered list
    if (/^[-*+]\s+/.test(line)) {
      const listItems: TiptapNode[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^[-*+]\s+/, '');
        listItems.push({
          type: 'listItem',
          content: [{ type: 'paragraph', content: parseInline(itemText) }],
        });
        i++;
      }
      content.push({ type: 'bulletList', content: listItems });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const listItems: TiptapNode[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\d+\.\s+/, '');
        listItems.push({
          type: 'listItem',
          content: [{ type: 'paragraph', content: parseInline(itemText) }],
        });
        i++;
      }
      content.push({ type: 'orderedList', content: listItems });
      continue;
    }

    // Image (standalone)
    const imgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      content.push({
        type: 'image',
        attrs: { src: imgMatch[2], alt: imgMatch[1] || null },
      });
      i++;
      continue;
    }

    // Regular paragraph
    content.push({
      type: 'paragraph',
      content: parseInline(line),
    });
    i++;
  }

  return { type: 'doc', content };
}

function parseInline(text: string): TiptapNode[] {
  if (!text) return [];
  const nodes: TiptapNode[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Bold + Italic
    let match = remaining.match(/^(\*\*\*|___)(.+?)\1/);
    if (match) {
      nodes.push({
        type: 'text',
        text: match[2],
        marks: [{ type: 'bold' }, { type: 'italic' }],
      });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Bold
    match = remaining.match(/^(\*\*|__)(.+?)\1/);
    if (match) {
      nodes.push({
        type: 'text',
        text: match[2],
        marks: [{ type: 'bold' }],
      });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Italic
    match = remaining.match(/^(\*|_)(.+?)\1/);
    if (match) {
      nodes.push({
        type: 'text',
        text: match[2],
        marks: [{ type: 'italic' }],
      });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Inline code
    match = remaining.match(/^`(.+?)`/);
    if (match) {
      nodes.push({
        type: 'text',
        text: match[1],
        marks: [{ type: 'code' }],
      });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Strikethrough
    match = remaining.match(/^~~(.+?)~~/);
    if (match) {
      nodes.push({
        type: 'text',
        text: match[1],
        marks: [{ type: 'strike' }],
      });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Link
    match = remaining.match(/^\[(.+?)\]\((.+?)\)/);
    if (match) {
      nodes.push({
        type: 'text',
        text: match[1],
        marks: [{ type: 'link', attrs: { href: match[2] } }],
      });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Image inline
    match = remaining.match(/^!\[(.*?)\]\((.+?)\)/);
    if (match) {
      nodes.push({
        type: 'image',
        attrs: { src: match[2], alt: match[1] || null },
      });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Plain text up to next markdown token
    match = remaining.match(/^(.+?)(?=[*_`[!~]|$)/);
    if (match) {
      nodes.push({ type: 'text', text: match[1] });
      remaining = remaining.slice(match[1].length);
      continue;
    }

    // Single character fallback
    nodes.push({ type: 'text', text: remaining[0] });
    remaining = remaining.slice(1);
  }

  return nodes;
}
