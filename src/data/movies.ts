export interface MovieItem {
  id: string;
  title: string;
  titleZh: string;
  director: string;
  year: number;
  rating: number;
  review: string;
  link?: string;
  posterColors: [string, string];
}

const movies: MovieItem[] = [
  {
    id: 'interstellar',
    title: 'Interstellar',
    titleZh: '星际穿越',
    director: 'Christopher Nolan',
    year: 2014,
    rating: 5,
    review: '爱是唯一可以穿越维度的力量。诺兰用硬科幻的外壳讲了一个关于告别与重逢的故事。',
    posterColors: ['#0a1a2a', '#c4a040'],
  },
  {
    id: 'spirited-away',
    title: 'Spirited Away',
    titleZh: '千与千寻',
    director: '宫崎骏',
    year: 2001,
    rating: 5,
    review: '每次重看都有新的理解。小时候看的是冒险，长大看的是成长与告别。',
    posterColors: ['#2a1a1a', '#c44040'],
  },
  {
    id: 'blade-runner-2049',
    title: 'Blade Runner 2049',
    titleZh: '银翼杀手2049',
    director: 'Denis Villeneuve',
    year: 2017,
    rating: 5,
    review: '摄影与美术的极致。每一帧都可以截图当壁纸，维伦纽瓦的节奏感完美。',
    posterColors: ['#1a2a3a', '#c46020'],
  },
  {
    id: 'parasite',
    title: 'Parasite',
    titleZh: '寄生虫',
    director: '奉俊昊',
    year: 2019,
    rating: 5,
    review: '阶级隐喻的教科书。从地下室到豪宅，空间比台词讲了更多。',
    posterColors: ['#1a2a0a', '#4a6a2a'],
  },
  {
    id: 'the-grand-budapest-hotel',
    title: 'The Grand Budapest Hotel',
    titleZh: '布达佩斯大饭店',
    director: 'Wes Anderson',
    year: 2014,
    rating: 4,
    review: '对称构图强迫症的狂欢。韦斯·安德森把电影变成了精美的绘本。',
    posterColors: ['#2a1a2a', '#c46080'],
  },
  {
    id: 'everything-everywhere',
    title: 'Everything Everywhere All at Once',
    titleZh: '瞬息全宇宙',
    director: '关家永 / Daniel Scheinert',
    year: 2022,
    rating: 5,
    review: '荒诞外壳下包裹着代际创伤与和解。两颗石头那场戏看哭了。',
    posterColors: ['#1a0a2a', '#c460c4'],
  },
];

export default movies;
