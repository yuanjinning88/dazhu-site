# 技术规范 v2

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 样式 | Tailwind CSS 3（自定义 Apple 白底主题） |
| 动画 | Framer Motion 11 |
| 路由 | React Router 6 |
| 数据库 | Supabase（PostgreSQL，免费版） |
| 客户端 | @supabase/supabase-js |
| Markdown | react-markdown + remark-gfm |
| 代码高亮 | react-syntax-highlighter（懒加载） |

## 路由

```
/               HomePage
/about          AboutPage
/essays         EssayListPage
/essays/:slug   EssayPostPage (lazy)
/music          MusicPage
/music/:id      MusicDetailPage
/movies         MoviesPage
/movies/:id     MovieDetailPage
/notes          NotesListPage
/notes/:id      NotesPostPage
/photos         PhotosPage
```

## 数据流

- 文稿：`content/blog/*.md` → `import.meta.glob` → `useBlogPosts`
- 动态内容：Supabase REST API → hooks（useMusic/useMovies/useNotes）→ 组件
- 封面：前端调用 iTunes/TMDB API → 存入 Supabase `cover_url`
- 环境变量：`.env` → Vite `import.meta.env`

## 目录结构

```
src/
├── lib/          # Supabase 客户端、封面搜索、封面生成
├── hooks/        # 数据 hooks（useMusic/useMovies/useNotes/useBlogPosts/useScrollProgress）
├── components/   # layout/ ui/ icons/
├── pages/        # 11 个页面组件
├── content/      # blog/*.md notes/*.md
└── data/         # 静态数据（备用）
```
