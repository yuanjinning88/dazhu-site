# 大猪个人网站 — 项目总控

> Apple 白底极简风格 / 个人内容站 / 云端数据库驱动

---

## 关键路径

| 文件/目录 | 用途 |
|-----------|------|
| [docs/requirements.md](docs/requirements.md) | 产品需求文档 v2 |
| [docs/tech-spec.md](docs/tech-spec.md) | 技术规范（栈、路由、数据流） |
| [docs/design-spec.md](docs/design-spec.md) | 设计规范（配色、排版、动画） |
| [docs/implementation-steps.md](docs/implementation-steps.md) | 执行步骤 & 进度追踪 |
| [devlog/](devlog/) | 每日开发日志 |
| [.env](.env) | Supabase 密钥（不提交） |

---

## 工作原则

1. **小步推进** — 每完成一个独立功能就暂停，等确认后再继续。
2. **每日日志** — 每次编码会话开始/结束时更新 `devlog/YYYY-MM-DD.md`。
3. **规范先行** — 改设计先去 `docs/design-spec.md` 对齐。
4. **不跨步** — 逐个组件完成、验证、再下一个。
5. **不引入外部图片** — 图标、装饰一律 SVG/代码生成。封面通过 API 匹配。

---

## 技术速览

- React 18 + TypeScript + Vite 6
- Tailwind CSS（Apple 白底自定义色板）
- Framer Motion（动画）
- React Router v6（路由）
- Supabase（PostgreSQL 云端数据库）
- react-markdown + react-syntax-highlighter（随笔/笔记）

## 核心命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 生产构建
npm run preview  # 预览生产构建
```

## 新增内容方式

- **音乐/电影/笔记/照片**：网页上点「添加」→ 弹窗表单 → 写入 Supabase → 即刻生效
- **随笔**：`src/content/blog/` 下新增 `.md` 文件，category 填 `life`/`work`/`inspiration`
