export interface PhotoItem {
  id: string;
  title: string;
  date: string;
  colors: [string, string];
}

const photos: PhotoItem[] = [
  { id: 'sunset-hike', title: '山顶日落', date: '2026-04', colors: ['#c46020', '#4a2a1a'] },
  { id: 'rainy-cafe', title: '雨天的咖啡馆', date: '2026-03', colors: ['#4a5a6a', '#1a2a2a'] },
  { id: 'cat-sleeping', title: '代码在午睡', date: '2026-02', colors: ['#c4a060', '#2a1a0a'] },
  { id: 'beach-morning', title: '清晨的海滩', date: '2026-01', colors: ['#4a6a8a', '#1a2a3a'] },
  { id: 'night-market', title: '夜市烟火', date: '2025-12', colors: ['#c44020', '#2a0a0a'] },
  { id: 'snow-peak', title: '雪山顶峰', date: '2025-11', colors: ['#8a9aaa', '#2a3a4a'] },
  { id: 'bike-trail', title: '骑行小径', date: '2025-10', colors: ['#4a6a2a', '#1a2a0a'] },
  { id: 'library-corner', title: '图书馆一角', date: '2025-09', colors: ['#6a5a4a', '#1a1a2a'] },
];

export default photos;
