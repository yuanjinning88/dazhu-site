import ImageUploadButton from './ImageUploadButton';

interface Props {
  editor: any;
}

export default function RichTextEditorToolbar({ editor }: Props) {
  if (!editor) return null;

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-black/[0.04] bg-white/80 backdrop-blur-sm rounded-t-2xl overflow-x-auto hidden sm:flex">
      {/* Heading */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-md transition-colors text-[13px] font-medium ${editor.isActive('heading', { level: 2 }) ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="标题"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded-md transition-colors text-[13px] font-medium ${editor.isActive('heading', { level: 3 }) ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="副标题"
      >
        H3
      </button>

      <span className="w-px h-4 bg-black/10 mx-0.5" />

      {/* Bold */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-md transition-colors ${editor.isActive('bold') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="加粗"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" /></svg>
      </button>

      {/* Italic */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-md transition-colors ${editor.isActive('italic') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="斜体"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" /></svg>
      </button>

      {/* Underline */}
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded-md transition-colors ${editor.isActive('underline') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="下划线"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" /></svg>
      </button>

      {/* Strike */}
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-md transition-colors ${editor.isActive('strike') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="删除线"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6.85 7.08C6.85 4.37 9.45 3 12.24 3c1.64 0 3 .49 3.9 1.28.77.65 1.46 1.73 1.46 3.24h-3.01c0-.31-.05-.59-.15-.85-.29-.86-1.06-1.32-2.08-1.32-.9 0-1.75.44-1.75 1.37 0 .48.21.79.61 1.03.11.07.23.13.36.19L8.3 7.08h-1.45zM4 13h16v-2H4v2zm8.5 6c1.86 0 3.22-.74 3.92-1.66l-1.67-2c-.48.65-1.2.99-2.25.99-1.26 0-2.15-.73-2.15-2.03h6.9c.13-.55.16-1.12.15-1.56H8.53c.06 1.31.15 2.36.65 3.25.72 1.28 1.87 2.01 3.32 2.01z" /></svg>
      </button>

      <span className="w-px h-4 bg-black/10 mx-0.5" />

      {/* Bullet list */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-md transition-colors ${editor.isActive('bulletList') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="无序列表"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" /></svg>
      </button>

      {/* Ordered list */}
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-md transition-colors ${editor.isActive('orderedList') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="有序列表"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" /></svg>
      </button>

      {/* Blockquote */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded-md transition-colors ${editor.isActive('blockquote') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="引用"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" /></svg>
      </button>

      {/* Code block */}
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1.5 rounded-md transition-colors ${editor.isActive('codeBlock') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="代码块"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" /></svg>
      </button>

      {/* Horizontal rule */}
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-1.5 rounded-md text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
        title="分隔线"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6 11h12v2H6z" /></svg>
      </button>

      <span className="w-px h-4 bg-black/10 mx-0.5" />

      {/* Text Align */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-1.5 rounded-md transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="左对齐"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" /></svg>
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-1.5 rounded-md transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="居中"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" /></svg>
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-1.5 rounded-md transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="右对齐"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3 3h18v2H3V3zm0 8h18v2H3v-2zm6 6h12v2H9v-2zM3 5h12v2H3V5zm0 12h12v2H3v-2z" /></svg>
      </button>

      <span className="w-px h-4 bg-black/10 mx-0.5" />

      {/* Highlight */}
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`p-1.5 rounded-md transition-colors ${editor.isActive('highlight') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="高亮"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 3L4 9v12h16V9l-8-6zm4 13.06L14 15v1c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1v-1.94l-2-1.5V10h12v4.56l-2 1.5z" /></svg>
      </button>

      {/* Subscript */}
      <button
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        className={`p-1.5 rounded-md transition-colors ${editor.isActive('subscript') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="下标"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 18h-2v1h3v1h-4v-2c0-.55.45-1 1-1h2v-1h-3v-1h3c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.85 4H6.19l4.32 6.73L5.88 18z" /></svg>
      </button>

      {/* Superscript */}
      <button
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        className={`p-1.5 rounded-md transition-colors ${editor.isActive('superscript') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="上标"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 7h-2v1h3v1h-4V7c0-.55.45-1 1-1h2V5h-3V4h3c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.85 6H6.19l4.32 6.73L5.88 20z" /></svg>
      </button>

      <span className="w-px h-4 bg-black/10 mx-0.5" />

      {/* Image upload */}
      <ImageUploadButton editor={editor} />

      <span className="w-px h-4 bg-black/10 mx-0.5" />

      {/* Insert Table */}
      <button
        onClick={insertTable}
        className="p-1.5 rounded-md text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
        title="插入表格"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z" /></svg>
      </button>
    </div>
  );
}
