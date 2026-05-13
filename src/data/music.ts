export interface MusicItem {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  rating: number;
  review: string;
  link?: string;
  coverColors: [string, string];
}

const music: MusicItem[] = [
  {
    id: 'ok-computer',
    title: 'OK Computer',
    artist: 'Radiohead',
    year: 1997,
    genre: 'Alternative Rock',
    rating: 5,
    review: '每次听都能发现新的细节。从 Karma Police 到 No Surprises，这张专辑定义了世纪末的不安与迷惘。',
    coverColors: ['#1a3a5c', '#c4a35a'],
  },
  {
    id: 'kind-of-blue',
    title: 'Kind of Blue',
    artist: 'Miles Davis',
    year: 1959,
    genre: 'Jazz',
    rating: 5,
    review: '深夜写代码时的最佳伴侣。Modal jazz 的开山之作，每个音符都恰到好处。',
    coverColors: ['#1a2a3a', '#4a6a8a'],
  },
  {
    id: 'random-access-memories',
    title: 'Random Access Memories',
    artist: 'Daft Punk',
    year: 2013,
    genre: 'Electronic',
    rating: 5,
    review: 'Get Lucky 只是冰山一角。整张专辑是对音乐本身的致敬，制作精良到令人发指。',
    coverColors: ['#1a1a1a', '#c4a040'],
  },
  {
    id: 'in-rainbows',
    title: 'In Rainbows',
    artist: 'Radiohead',
    year: 2007,
    genre: 'Alternative Rock',
    rating: 4,
    review: '从 15 Step 到 Videotape，每首歌都像被雨水洗过一样清澈。',
    coverColors: ['#2a1a0a', '#c46020'],
  },
  {
    id: 'blonde',
    title: 'Blonde',
    artist: 'Frank Ocean',
    year: 2016,
    genre: 'R&B',
    rating: 5,
    review: '极简的制作 + 极致的表达 = 一张改变 R&B 规则的专辑。',
    coverColors: ['#1a2a1a', '#c4a0a0'],
  },
  {
    id: 'selected-ambient-works',
    title: 'Selected Ambient Works 85-92',
    artist: 'Aphex Twin',
    year: 1992,
    genre: 'Ambient / Electronic',
    rating: 4,
    review: '专注工作时循环播放。二十多年前的声音放到今天依然前卫。',
    coverColors: ['#0a0a1a', '#4a6a8a'],
  },
];

export default music;
