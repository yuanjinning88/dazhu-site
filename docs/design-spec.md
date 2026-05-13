# 设计规范 v2 — Apple 白底风

## 配色

| Token | 值 | 用途 |
|-------|-----|------|
| bg-primary | `#FFFFFF` | 页面主背景 |
| bg-secondary | `#F5F5F7` | 区块交替背景 |
| text-primary | `#1D1D1F` | 主文字 |
| text-secondary | `#6E6E73` | 次级文字 |
| text-muted | `#86868B` | 辅助文字 |
| accent | `#0071E3` | 链接/按钮蓝 |
| border | `rgba(0,0,0,0.08)` | 边框 |
| shadow-card | 轻微阴影 | 卡片悬浮 |

## 排版

| 层级 | 字号 | 字重 |
|------|------|------|
| 页面标题 | 4xl (36px) | bold 700 |
| Hero 大标题 | 5-7xl | bold 700 |
| Section 标题 | xl (20px) | semibold 600 |
| 卡片标题 | base/sm | medium 500 |
| 正文 | sm (14px) | normal 400 |
| 辅助文字 | xs (12px) | normal 400 |

字体：SF Pro Display → PingFang SC → system-ui

## 间距

- 内容最大宽度：1024px
- Section 内边距：py-20 md:py-28
- 卡片间距：gap-5
- 标题间距：mb-10

## 动画

- 页面进入：opacity 0→1, y 24→0, 0.4s
- 卡片 stagger：delay 0.05-0.08s
- 导航栏：滚动 >50px 显示毛玻璃背景
- 汉堡菜单：三线 ↔ X 形变
- 侧边栏滑出：x -192→0, 0.3s ease-out

## 响应式

- 断点：md (768px) / lg (1024px)
- 卡片网格：2→3→4 列
- 左侧侧边栏：md+ 显示，sm 隐藏
- 导航栏：md+ 横排，sm 汉堡

## 图标

- 32 个 SVG 统一线条风格
- stroke-width: 1.5
- stroke-linecap/join: round
- 颜色继承 currentColor
