import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchData, type SearchableItem } from '@/hooks/useSearchData';

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  essay: { label: '随笔', color: 'text-rose-500 bg-rose-50' },
  music: { label: '音乐', color: 'text-purple-500 bg-purple-50' },
  movie: { label: '电影', color: 'text-blue-500 bg-blue-50' },
  note:  { label: '笔记', color: 'text-amber-500 bg-amber-50' },
  photo: { label: '照片', color: 'text-emerald-500 bg-emerald-50' },
};

const MAX_PER_GROUP = 3;
const typeOrder = ['essay', 'music', 'movie', 'note', 'photo'] as const;

interface FlatItem {
  type: string;
  item: SearchableItem;
  config: (typeof TYPE_CONFIG)[string];
}

function filterItems(items: SearchableItem[], query: string): SearchableItem[] {
  const keywords = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (keywords.length === 0) return [];
  return items.filter((item) => keywords.every((kw) => item.searchText.includes(kw)));
}

export default function SearchBar() {
  const navigate = useNavigate();
  const { index } = useSearchData();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const results = query.trim() ? filterItems(index, query) : [];

  // flatten visible results (respecting MAX_PER_GROUP) for keyboard nav
  const flatResults = useMemo<FlatItem[]>(() => {
    const flat: FlatItem[] = [];
    for (const type of typeOrder) {
      const items = results.filter((r) => r.type === type);
      if (items.length === 0) continue;
      const config = TYPE_CONFIG[type];
      for (const item of items.slice(0, MAX_PER_GROUP)) {
        flat.push({ type, item, config });
      }
    }
    return flat;
  }, [results]);

  // reset selection when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  // click outside → close
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // keyboard: Escape, ArrowUp/Down, Enter
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        setQuery('');
        return;
      }

      if (flatResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
      } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < flatResults.length) {
        e.preventDefault();
        setOpen(false);
        setQuery('');
        navigate(flatResults[selectedIndex].item.url);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, flatResults, selectedIndex, navigate]);

  // scroll selected item into view
  useEffect(() => {
    if (selectedIndex < 0 || !dropdownRef.current) return;
    const el = dropdownRef.current.querySelector('[data-search-selected]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleSelect = useCallback((url: string) => {
    setOpen(false);
    setQuery('');
    navigate(url);
  }, [navigate]);

  // group remaining count by type
  const groupRemaining = useMemo(() => {
    const map: Record<string, number> = {};
    for (const type of typeOrder) {
      const items = results.filter((r) => r.type === type);
      if (items.length > MAX_PER_GROUP) {
        map[type] = items.length - MAX_PER_GROUP;
      }
    }
    return map;
  }, [results]);

  // render: group headers appear when type changes
  const renderedItems = useMemo(() => {
    const rows: ({ kind: 'header'; label: string } | { kind: 'item'; flatIndex: number })[] = [];
    let lastType = '';
    for (let i = 0; i < flatResults.length; i++) {
      const f = flatResults[i];
      if (f.type !== lastType) {
        rows.push({ kind: 'header', label: f.config.label });
        lastType = f.type;
      }
      rows.push({ kind: 'item', flatIndex: i });
    }
    return rows;
  }, [flatResults]);

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Closed state: search icon */}
      <AnimatePresence mode="wait">
        {!open && (
          <motion.button
            key="icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={handleOpen}
            className="p-1.5 text-[#86868B] hover:text-[#1d1d1f] transition-colors"
            aria-label="搜索"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Open state: input + dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex items-center"
          >
            <div className="relative">
              <svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#86868B] pointer-events-none"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索..."
                className="w-[140px] sm:w-[200px] h-8 pl-9 pr-8 rounded-full bg-[#f5f5f7] text-sm text-[#1d1d1f] placeholder:text-[#86868B] outline-none focus:ring-2 focus:ring-[#0071e3]/30 transition-shadow"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#86868B] hover:text-[#1d1d1f]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-[14px] h-[14px]">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown */}
      <AnimatePresence>
        {open && query.trim() && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[360px] max-h-[480px] overflow-y-auto bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#f0f0f0] py-3"
          >
            {results.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[#86868B]">没有找到相关内容</p>
            ) : (
              renderedItems.map((row, i) => {
                if (row.kind === 'header') {
                  return (
                    <div key={`h-${row.label}-${i}`} className="px-4 py-1.5 text-[11px] font-medium text-[#86868B] uppercase tracking-wider">
                      {row.label}
                    </div>
                  );
                }

                const { flatIndex } = row;
                const f = flatResults[flatIndex];
                const isSelected = flatIndex === selectedIndex;

                return (
                  <button
                    key={`${f.type}-${f.item.id}`}
                    data-search-selected={isSelected ? '' : undefined}
                    onClick={() => handleSelect(f.item.url)}
                    onPointerEnter={() => setSelectedIndex(flatIndex)}
                    className={`w-full text-left px-4 py-2 transition-colors ${
                      isSelected ? 'bg-[#f5f5f7]' : 'hover:bg-[#f5f5f7]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${f.config.color}`}>
                        {f.config.label}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm text-[#1d1d1f] truncate">{f.item.title}</div>
                        {f.item.subtitle && (
                          <div className="text-xs text-[#86868B] truncate mt-0.5">{f.item.subtitle}</div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
            {/* remaining counts */}
            {Object.entries(groupRemaining).map(([type, count]) => (
              <p key={`remain-${type}`} className="px-4 py-1 text-[11px] text-[#86868B]">
                还有 {count} 条{TYPE_CONFIG[type]?.label || ''}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
