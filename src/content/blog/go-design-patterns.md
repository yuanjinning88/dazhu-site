---
title: "设计模式在 Go 语言中的优雅实现"
date: "2026-03-02"
category: "work"
description: "以 Go 的视角重新审视经典设计模式，探讨 interface 与组合的妙用。"
---

## Go 的设计哲学

Go 语言的设计哲学是**简洁胜于复杂**。它没有继承，没有类型层次，只有 interface 和 struct 组合。

这让经典设计模式的实现方式变得截然不同。

## 策略模式：用 Function Type

在 Java 中，策略模式需要定义接口和多个实现类。在 Go 中，一个函数类型就够了：

```go
type SortFunc func([]int) []int

var QuickSort SortFunc = func(data []int) []int {
    // 快排实现
    return data
}

var MergeSort SortFunc = func(data []int) []int {
    // 归并实现
    return data
}

func Process(data []int, strategy SortFunc) []int {
    return strategy(data)
}
```

## 装饰器模式：Middleware 链

Go 的 HTTP middleware 是装饰器模式的典范：

```go
func Logging(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        log.Printf("%s %s", r.Method, r.URL.Path)
        next(w, r)
    }
}

func Auth(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // 鉴权逻辑
        next(w, r)
    }
}
```

## Interface 的妙用

Go 的 interface 是**隐式满足**的——不需要显式声明实现了哪个接口。这让代码解耦变得极其自然。

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

// 任何有 Read 方法的类型都自动实现了 Reader
```

## 总结

Go 让我们重新思考"设计模式"——不是不需要它们，而是用更简单的方式实现它们。少即是多。
