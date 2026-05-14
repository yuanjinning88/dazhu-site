export interface Quote {
  text: string;
  source: string;
}

export const quotes: Quote[] = [
  { text: '人只有在忘记自我的时候，才会真正变得强大。', source: '《进击的巨人》' },
  { text: '世界上没有什么偶然，只有必然。', source: '《xxxHOLiC》' },
  { text: '正因为是看不见的东西，才更需要去相信。', source: '《夏目友人帐》' },
  { text: '所谓的生存，就是吞噬他人的生命。', source: '《东京食尸鬼》' },
  { text: '能让你一眼心动的，永远是意料之外的温柔。', source: '《天气之子》' },
  { text: '孤独的人，连孤独的方式都和别人不一样。', source: '村上春树' },
  { text: '我什么都没忘，只是有些事只适合收藏。', source: '史铁生' },
  { text: '万物皆有裂痕，那是光照进来的地方。', source: '莱昂纳德·科恩' },
  { text: '你是我的半截诗，不许别人改一个字。', source: '张嘉佳' },
  { text: '我曾踏月而来，只因你在山中。', source: '席慕蓉' },
  { text: '人生和电影不一样，人生辛苦多了。', source: '《天堂电影院》' },
  { text: '我们一路奋战，不是为了改变世界，而是为了不让世界改变我们。', source: '《熔炉》' },
  { text: '有些鱼是关不住的，它们的每一片鳞片都闪耀着自由的光辉。', source: '《肖申克的救赎》' },
  { text: '如果再也不能见到你，祝你早安、午安、晚安。', source: '《楚门的世界》' },
  { text: '爱不是互相凝望，而是一起朝着同一个方向展望。', source: '《小王子》' },
  { text: "What I'm doing now, I'm chasing perfection.", source: 'Kobe Bryant' },
  { text: "I can accept failure, but I can't accept not trying.", source: 'Kobe Bryant' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', source: 'Eleanor Roosevelt' },
  { text: 'We are all in the gutter, but some of us are looking at the stars.', source: 'Oscar Wilde' },
  { text: 'Not all who wander are lost.', source: 'J.R.R. Tolkien' },
  { text: "In the end, we only regret the chances we didn't take.", source: 'Lewis Carroll' },
  { text: 'I fell in love the way you fall asleep: slowly, then all at once.', source: 'John Green' },
  { text: 'Hope is a good thing, maybe the best of things, and no good thing ever dies.', source: 'Stephen King' },
  { text: 'May your choices reflect your hopes, not your fears.', source: 'Nelson Mandela' },
  { text: 'You only live once, but if you do it right, once is enough.', source: 'Mae West' },
  { text: 'The darkest nights produce the brightest stars.', source: 'Rumi' },
  { text: 'Live in the moment.', source: 'Marcus Aurelius' },
  { text: 'It does not do to dwell on dreams and forget to live.', source: 'J.K. Rowling' },
  { text: 'All good things are wild and free.', source: 'Henry David Thoreau' },
  { text: 'One day you will leave this world behind, so live a life you will remember.', source: 'Avicii' },
];

export function getRandomQuote(): Quote {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
