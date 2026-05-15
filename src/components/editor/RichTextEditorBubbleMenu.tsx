import { useState, useEffect, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/react';

const FONTS = [
  { label: 'SF Pro', value: '"SF Pro Display", "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif' },
  { label: '衬线', value: '"Noto Serif SC", "Source Han Serif SC", Georgia, serif' },
  { label: '等宽', value: '"SF Mono", "Fira Code", monospace' },
];

const SIZES = [
  { label: '14', value: '14px' },
  { label: '17', value: '17px' },
  { label: '21', value: '21px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
];

const COLORS = [
  '#1d1d1f', '#0066cc', '#86868B', '#6E6E73',
  '#1aae39', '#ff3b30', '#ff9500', '#5645d4',
  '#0071e3', '#ff6b35', '#8e44ad', '#2c3e50',
];

interface Props {
  editor: Editor | null;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export default function RichTextEditorBubbleMenu({ editor, containerRef }: Props) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showFonts, setShowFonts] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!editor) return;
    const { from, to, empty } = editor.state.selection;
    if (empty || from === to) {
      setVisible(false);
      return;
    }

    const editorDom = editor.view.dom;
    const editorRect = editorDom.getBoundingClientRect();

    // Get selection bounding rect
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      setVisible(false);
      return;
    }

    // Check if selection is inside our editor
    if (!editorDom.contains(range.commonAncestorContainer)) {
      setVisible(false);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (!rect || rect.width === 0) {
      setVisible(false);
      return;
    }

    // Position above selection, centered horizontally, clamped to editor bounds
    const menuWidth = 360; // approximate
    let left = rect.left + rect.width / 2 - menuWidth / 2;
    left = Math.max(editorRect.left + 8, Math.min(left, editorRect.right - menuWidth - 8));
    const top = rect.top - 48;

    setPosition({ top, left });
    setVisible(true);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.on('selectionUpdate', updatePosition);
    editor.on('blur', () => {
      // Delay hide so clicks on menu buttons register
      setTimeout(() => {
        if (menuRef.current?.contains(document.activeElement)) return;
        setVisible(false);
      }, 150);
    });
    return () => {
      editor.off('selectionUpdate', updatePosition);
    };
  }, [editor, updatePosition]);

  // Hide all dropdowns when menu becomes invisible
  useEffect(() => {
    if (!visible) {
      setShowFonts(false);
      setShowSizes(false);
      setShowColors(false);
      setShowLink(false);
    }
  }, [visible]);

  if (!editor || !visible) return null;

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setShowLink(false);
    setLinkUrl('');
  };

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 100 }}
      className="flex items-center gap-0.5 bg-white/95 backdrop-blur-xl border border-black/10 rounded-full px-1 py-1 shadow-lg"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Bold */}
      <button
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
        className={`p-1.5 rounded-full transition-colors ${editor.isActive('bold') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="加粗"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" /></svg>
      </button>

      {/* Italic */}
      <button
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
        className={`p-1.5 rounded-full transition-colors ${editor.isActive('italic') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="斜体"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" /></svg>
      </button>

      {/* Underline */}
      <button
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
        className={`p-1.5 rounded-full transition-colors ${editor.isActive('underline') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="下划线"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" /></svg>
      </button>

      {/* Strike */}
      <button
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }}
        className={`p-1.5 rounded-full transition-colors ${editor.isActive('strike') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="删除线"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6.85 7.08C6.85 4.37 9.45 3 12.24 3c1.64 0 3 .49 3.9 1.28.77.65 1.46 1.73 1.46 3.24h-3.01c0-.31-.05-.59-.15-.85-.29-.86-1.06-1.32-2.08-1.32-.9 0-1.75.44-1.75 1.37 0 .48.21.79.61 1.03.11.07.23.13.36.19L8.3 7.08h-1.45zM4 13h16v-2H4v2zm8.5 6c1.86 0 3.22-.74 3.92-1.66l-1.67-2c-.48.65-1.2.99-2.25.99-1.26 0-2.15-.73-2.15-2.03h6.9c.13-.55.16-1.12.15-1.56H8.53c.06 1.31.15 2.36.65 3.25.72 1.28 1.87 2.01 3.32 2.01z" /></svg>
      </button>

      {/* Highlight */}
      <button
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHighlight().run(); }}
        className={`p-1.5 rounded-full transition-colors ${editor.isActive('highlight') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="高亮"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 3L4 9v12h16V9l-8-6zm4 13.06L14 15v1c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1v-1.94l-2-1.5V10h12v4.56l-2 1.5z" /></svg>
      </button>

      {/* Subscript */}
      <button
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleSubscript().run(); }}
        className={`p-1.5 rounded-full transition-colors ${editor.isActive('subscript') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="下标"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 18h-2v1h3v1h-4v-2c0-.55.45-1 1-1h2v-1h-3v-1h3c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.85 4H6.19l4.32 6.73L5.88 18z" /></svg>
      </button>

      {/* Superscript */}
      <button
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleSuperscript().run(); }}
        className={`p-1.5 rounded-full transition-colors ${editor.isActive('superscript') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
        title="上标"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 7h-2v1h3v1h-4V7c0-.55.45-1 1-1h2V5h-3V4h3c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.85 6H6.19l4.32 6.73L5.88 20z" /></svg>
      </button>

      <span className="w-px h-4 bg-black/10 mx-0.5" />

      {/* Font Family */}
      <div className="relative">
        <button
          onMouseDown={(e) => { e.preventDefault(); setShowFonts(!showFonts); setShowSizes(false); setShowColors(false); setShowLink(false); }}
          className="p-1.5 rounded-full text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors text-[11px] font-medium min-w-[32px]"
          title="字体"
        >
          Aa
        </button>
        {showFonts && (
          <div className="absolute bottom-full left-0 mb-2 bg-white/95 backdrop-blur-xl border border-black/10 rounded-xl p-1 shadow-lg min-w-[120px]">
            {FONTS.map((f) => (
              <button
                key={f.value}
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setFontFamily(f.value).run(); setShowFonts(false); }}
                className={`block w-full text-left px-3 py-2 text-[13px] rounded-lg hover:bg-black/[0.04] transition-colors ${editor.isActive('textStyle', { fontFamily: f.value }) ? 'text-[#0066cc]' : 'text-[#1d1d1f]'}`}
                style={{ fontFamily: f.value }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Font Size */}
      <div className="relative">
        <button
          onMouseDown={(e) => { e.preventDefault(); setShowSizes(!showSizes); setShowFonts(false); setShowColors(false); setShowLink(false); }}
          className="p-1.5 rounded-full text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors text-[11px] font-medium min-w-[32px]"
          title="字号"
        >
          T
        </button>
        {showSizes && (
          <div className="absolute bottom-full left-0 mb-2 bg-white/95 backdrop-blur-xl border border-black/10 rounded-xl p-1 shadow-lg">
            {SIZES.map((s) => (
              <button
                key={s.value}
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setFontSize(s.value).run(); setShowSizes(false); }}
                className={`block w-full text-left px-3 py-1.5 text-[13px] rounded-lg hover:bg-black/[0.04] transition-colors ${editor.isActive('textStyle', { fontSize: s.value }) ? 'text-[#0066cc]' : 'text-[#1d1d1f]'}`}
                style={{ fontSize: s.value }}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color */}
      <div className="relative">
        <button
          onMouseDown={(e) => { e.preventDefault(); setShowColors(!showColors); setShowFonts(false); setShowSizes(false); setShowLink(false); }}
          className="p-1.5 rounded-full hover:bg-black/[0.04] transition-colors"
          title="文字颜色"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#86868B]"><path d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 16.5c-4.14 0-7.5-3.36-7.5-7.5S7.86 4.5 12 4.5s7.5 3.36 7.5 7.5-3.36 7.5-7.5 7.5z" /><path d="M12 7a5 5 0 00-5 5h10a5 5 0 00-5-5z" /></svg>
        </button>
        {showColors && (
          <div className="absolute bottom-full right-0 mb-2 bg-white/95 backdrop-blur-xl border border-black/10 rounded-xl p-2 shadow-lg">
            <div className="grid grid-cols-6 gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); setShowColors(false); }}
                  className="w-6 h-6 rounded-full border border-black/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <button
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setShowColors(false); }}
              className="mt-1.5 w-full text-center text-[11px] text-[#86868B] hover:text-[#1d1d1f] py-0.5"
            >
              重置
            </button>
          </div>
        )}
      </div>

      <span className="w-px h-4 bg-black/10 mx-0.5" />

      {/* Link */}
      <div className="relative">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setShowLink(!showLink); setShowFonts(false); setShowSizes(false); setShowColors(false);
            const prev = editor.getAttributes('link').href || '';
            setLinkUrl(prev);
          }}
          className={`p-1.5 rounded-full transition-colors ${editor.isActive('link') ? 'text-[#0066cc] bg-[#0066cc]/[0.08]' : 'text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04]'}`}
          title="链接"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
        </button>
        {showLink && (
          <div className="absolute bottom-full right-0 mb-2 bg-white/95 backdrop-blur-xl border border-black/10 rounded-xl p-2 shadow-lg flex items-center gap-1">
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="粘贴链接..."
              className="text-[13px] px-2 py-1 rounded-lg border border-black/10 outline-none focus:border-[#0066cc]/30 w-[180px]"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') setLink(); }}
            />
            <button
              onMouseDown={(e) => { e.preventDefault(); setLink(); }}
              className="px-2 py-1 text-[12px] font-medium bg-[#0066cc] text-white rounded-lg hover:bg-[#0071e3]"
            >
              确认
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
