---
title: "Git 工作流笔记"
date: "2026-05-01"
category: "dev"
description: "日常使用的 Git 命令和工作流记录。"
---

## 分支策略

我习惯用 **trunk-based development**：

- `main` 始终可部署
- 功能分支从 main 切出，合并后立即删除
- 分支命名：`feat/xxx`、`fix/xxx`、`refactor/xxx`

## 常用命令

```bash
# 查看最近 5 个分支
git branch --sort=-committerdate | head -5

# 交互式 rebase 最近 3 个 commit
git rebase -i HEAD~3

# 找回误删的分支
git reflog | grep checkout
```

## 提交信息规范

遵循 conventional commits：
- `feat:` 新功能
- `fix:` 修复
- `refactor:` 重构
- `docs:` 文档
- `chore:` 杂项

写提交信息时问自己：**"半年后回来看，我能理解这个改动吗？"**
