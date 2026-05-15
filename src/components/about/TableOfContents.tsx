interface TocItem {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  items: TocItem[];
  activeId: string | null;
}

export default function TableOfContents({ items, activeId }: TableOfContentsProps) {
  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <nav
      className="hidden md:block sticky top-28 w-44 shrink-0 self-start"
      aria-label="目录"
    >
      <h3 className="text-xs tracking-[0.15em] text-[#8a8468] mb-4 font-sans">
        目录
      </h3>
      <ul className="space-y-0.5 border-l border-[#d8d3c0]">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => handleClick(item.id)}
                className={`block w-full text-left py-1.5 pl-4 text-[13px] leading-relaxed transition-colors duration-200 border-l-2 -ml-[1px] ${
                  isActive
                    ? 'text-[#3d3828] border-[#b8a97a] font-medium'
                    : 'text-[#8a8468] border-transparent hover:text-[#5c5640]'
                }`}
              >
                {item.title}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
