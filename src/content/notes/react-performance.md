---
title: "React 性能优化随手记"
date: "2026-04-20"
category: "dev"
description: "工作中积累的 React 性能优化技巧。"
---

## 为什么慢？

用 React DevTools Profiler 找瓶颈，而不是凭感觉优化。

## 常见模式

### 避免在 render 中创建对象

```jsx
// ❌ 每次 render 都创建新对象
<Child style={{ margin: 8 }} />

// ✅ 提取到组件外部
const STYLE = { margin: 8 };
<Child style={STYLE} />
```

### 善用 useMemo 和 useCallback

但不是滥用——只在以下场景用：
1. 传给 `React.memo` 子组件的 props
2. 作为其他 hook 的依赖项
3. 计算开销真的很大的操作

### 列表虚拟化

超过 100 条数据用 `react-window` 或 `@tanstack/virtual`。

### 图片懒加载

```jsx
<img loading="lazy" src="..." alt="..." />
```

原生支持，不需要 JS 库。

## 心得

优化前先量化——React DevTools 截图记录优化前后的渲染耗时。数据比直觉有说服力。
