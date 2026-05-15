import { useRef, useCallback } from 'react';
import { uploadImage } from './utils/uploadImage';

interface Props {
  editor: { chain: () => { focus: () => { setImage: (attrs: { src: string }) => { run: () => void } } } } | null;
}

export default function ImageUploadButton({ editor }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      try {
        const url = await uploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (err) {
        console.error('Image upload failed:', err);
      }
      // reset so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    },
    [editor],
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="p-1.5 rounded-md text-[#86868B] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
        title="插入图片"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </button>
    </>
  );
}
