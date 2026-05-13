-- 在 Supabase SQL Editor 中运行，插入初始示例数据

INSERT INTO music (title, artist, year, genre, rating, review, cover_colors) VALUES
('OK Computer', 'Radiohead', 1997, 'Alternative Rock', 5, '每次听都能发现新的细节。从 Karma Police 到 No Surprises，这张专辑定义了世纪末的不安与迷惘。', ARRAY['#1a3a5c', '#c4a35a']),
('Kind of Blue', 'Miles Davis', 1959, 'Jazz', 5, '深夜写代码时的最佳伴侣。Modal jazz 的开山之作，每个音符都恰到好处。', ARRAY['#1a2a3a', '#4a6a8a']),
('Random Access Memories', 'Daft Punk', 2013, 'Electronic', 5, 'Get Lucky 只是冰山一角。整张专辑是对音乐本身的致敬，制作精良到令人发指。', ARRAY['#1a1a1a', '#c4a040']),
('In Rainbows', 'Radiohead', 2007, 'Alternative Rock', 4, '从 15 Step 到 Videotape，每首歌都像被雨水洗过一样清澈。', ARRAY['#2a1a0a', '#c46020']),
('Blonde', 'Frank Ocean', 2016, 'R&B', 5, '极简的制作 + 极致的表达 = 一张改变 R&B 规则的专辑。', ARRAY['#1a2a1a', '#c4a0a0']),
('Selected Ambient Works 85-92', 'Aphex Twin', 1992, 'Ambient / Electronic', 4, '专注工作时循环播放。二十多年前的声音放到今天依然前卫。', ARRAY['#0a0a1a', '#4a6a8a']);

INSERT INTO movies (title, title_zh, director, year, rating, review, cover_colors) VALUES
('Interstellar', '星际穿越', 'Christopher Nolan', 2014, 5, '爱是唯一可以穿越维度的力量。诺兰用硬科幻的外壳讲了一个关于告别与重逢的故事。', ARRAY['#0a1a2a', '#c4a040']),
('Spirited Away', '千与千寻', '宫崎骏', 2001, 5, '每次重看都有新的理解。小时候看的是冒险，长大看的是成长与告别。', ARRAY['#2a1a1a', '#c44040']),
('Blade Runner 2049', '银翼杀手2049', 'Denis Villeneuve', 2017, 5, '摄影与美术的极致。每一帧都可以截图当壁纸。', ARRAY['#1a2a3a', '#c46020']),
('Parasite', '寄生虫', '奉俊昊', 2019, 5, '阶级隐喻的教科书。从地下室到豪宅，空间比台词讲了更多。', ARRAY['#1a2a0a', '#4a6a2a']),
('The Grand Budapest Hotel', '布达佩斯大饭店', 'Wes Anderson', 2014, 4, '对称构图强迫症的狂欢。韦斯·安德森把电影变成了精美的绘本。', ARRAY['#2a1a2a', '#c46080']),
('Everything Everywhere All at Once', '瞬息全宇宙', '关家永 / Daniel Scheinert', 2022, 5, '荒诞外壳下包裹着代际创伤与和解。两颗石头那场戏看哭了。', ARRAY['#1a0a2a', '#c460c4']);

INSERT INTO notes (title, category, description, content) VALUES
('Git 工作流笔记', 'dev', '日常使用的 Git 命令和工作流记录', '## 分支策略\n\n使用 trunk-based development：main 始终可部署，功能分支从 main 切出，合并后立即删除。\n\n## 常用命令\n\ngit branch --sort=-committerdate | head -5  # 最近分支\ngit rebase -i HEAD~3                        # 交互式 rebase\ngit reflog | grep checkout                   # 找回误删分支\n\n## 提交规范\n\nfeat: 新功能\nfix: 修复\nrefactor: 重构\ndocs: 文档\nchore: 杂项'),
('React 性能优化随手记', 'dev', '工作中积累的 React 性能优化技巧', '## 为什么慢？\n\n用 React DevTools Profiler 找瓶颈，不是凭感觉优化。\n\n## 常见模式\n\n避免在 render 中创建对象，善用 useMemo 和 useCallback 但不滥用。\n\n列表超过 100 条用 react-window 虚拟化。\n\n图片原生 loading="lazy" 即可。\n\n## 心得\n\n优化前先量化——截图记录优化前后的渲染耗时。数据比直觉有说服力。');

INSERT INTO photos (title, date, image_url, cover_colors) VALUES
('山顶日落', '2026-04', NULL, ARRAY['#c46020', '#4a2a1a']),
('雨天的咖啡馆', '2026-03', NULL, ARRAY['#4a5a6a', '#1a2a2a']),
('代码在午睡', '2026-02', NULL, ARRAY['#c4a060', '#2a1a0a']),
('清晨的海滩', '2026-01', NULL, ARRAY['#4a6a8a', '#1a2a3a']),
('夜市烟火', '2025-12', NULL, ARRAY['#c44020', '#2a0a0a']),
('雪山顶峰', '2025-11', NULL, ARRAY['#8a9aaa', '#2a3a4a']),
('骑行小径', '2025-10', NULL, ARRAY['#4a6a2a', '#1a2a0a']),
('图书馆一角', '2025-09', NULL, ARRAY['#6a5a4a', '#1a1a2a']);
