import { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
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
import CharacterCount from '@tiptap/extension-character-count';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { markdownToTiptap } from './utils/markdownToTiptap';
import { uploadImage } from './utils/uploadImage';
import RichTextEditorToolbar from './RichTextEditorToolbar';
import RichTextEditorBubbleMenu from './RichTextEditorBubbleMenu';
import './styles/editor.css';

interface Props {
  content: string;
  contentFormat: string;
  onChange: (json: string) => void;
  placeholder?: string;
  extraExtensions?: any[];
}

export default function RichTextEditor({
  content,
  contentFormat,
  onChange,
  placeholder = '开始写作...',
  extraExtensions = [],
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        horizontalRule: {},
      }),
      Placeholder.configure({ placeholder }),
      ImageExt,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      CodeBlock,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Subscript,
      Superscript,
      CharacterCount.configure({ limit: 50000 }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      ...extraExtensions,
    ],
    content: contentFormat === 'tiptap-json' && content
      ? JSON.parse(content)
      : contentFormat === 'markdown' && content
        ? markdownToTiptap(content)
        : undefined,
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror',
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved) return false;
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          const file = files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            uploadImage(file).then((url) => {
              editor?.chain().focus().setImage({ src: url }).run();
            }).catch(console.error);
            return true;
          }
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              uploadImage(file).then((url) => {
                editor?.chain().focus().setImage({ src: url }).run();
              }).catch(console.error);
            }
            return true;
          }
        }
        return false;
      },
    },
  });

  const characterCount = editor?.storage?.characterCount?.characters?.() ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm" ref={containerRef}>
      <RichTextEditorToolbar editor={editor} />
      <div className="px-8 sm:px-12 py-8">
        <EditorContent editor={editor} />
      </div>
      <div className="px-8 sm:px-12 pb-6 flex items-center justify-end">
        <span className="text-[11px] text-[#86868B]">{characterCount} 字</span>
      </div>
      <RichTextEditorBubbleMenu editor={editor} containerRef={containerRef} />
    </div>
  );
}
