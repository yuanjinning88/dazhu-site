import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

interface Props {
  content: string;
  contentFormat: string;
  className?: string;
}

export default function RichTextRenderer({ content, contentFormat, className }: Props) {
  if (!content) {
    return <p className="text-[#86868B] text-center py-20">暂无内容</p>;
  }

  // Old Markdown content — render with ReactMarkdown
  if (contentFormat === 'markdown' || !contentFormat) {
    return (
      <div className={className}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // New TipTap JSON content — generate HTML
  let html = '';
  try {
    const json = JSON.parse(content);
    html = generateHTML(json, [
      StarterKit.configure({ codeBlock: false }),
      CodeBlock,
      ImageExt,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Underline,
      Link,
      TaskList,
      TaskItem,
      Highlight,
      TextAlign,
      Subscript,
      Superscript,
      Table,
      TableRow,
      TableCell,
      TableHeader,
    ]);
    // Add lazy loading to images
    html = html.replace(/<img /g, '<img loading="lazy" ');
  } catch {
    // Fallback: render as plain text if JSON parse fails
    return (
      <div className={className}>
        <p className="text-[#86868B]">内容格式错误，无法渲染。</p>
      </div>
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
