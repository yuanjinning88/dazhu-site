---
title: "深入理解 React 并发模式"
date: "2026-04-15"
category: "work"
description: "从 Scheduler 到 Suspense，拆解 React 18 并发渲染的底层原理。"
---

## 为什么需要并发模式？

传统的 React 渲染是**同步、不可中断**的。当组件树庞大时，一次渲染可能占用主线程数十毫秒，导致用户输入得不到及时响应。

React 18 引入的并发模式改变了这一点。

## 核心机制：可中断渲染

React 将渲染工作拆分为微小的**工作单元**，每个单元执行时间不超过 5ms。在每个工作单元完成后，React 会检查是否有更高优先级的任务（如用户输入）需要处理。

```
// 简化的调度逻辑
function workLoop(deadline) {
  while (workQueue.length > 0 && deadline.timeRemaining() > 1) {
    performUnitOfWork(workQueue.shift());
  }
  requestIdleCallback(workLoop);
}
```

## Scheduler 的作用

Scheduler 是 React 的调度核心，负责：

- **优先级排序**：用户输入 > 动画 > 数据更新
- **时间切片**：确保单次任务不超过 5ms
- **任务中断与恢复**：保存当前进度，稍后继续

## Suspense 与并发

Suspense 在并发模式下变得更加强大：

```jsx
function ProfilePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ProfileDetails />
      <Suspense fallback={<PostsSkeleton />}>
        <ProfilePosts />
      </Suspense>
    </Suspense>
  );
}
```

React 会**并行**加载 `ProfileDetails` 和 `ProfilePosts`，哪个先完成就先渲染哪个。

## 实践建议

1. 使用 `useTransition` 标记非关键更新
2. 合理拆分 Suspense 边界
3. 避免在渲染过程中产生副作用

并发模式不是魔法，但它让前端应用的用户体验达到了新的高度。
