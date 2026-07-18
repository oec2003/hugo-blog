---
title: 设计模式笔记(13)—代理模式（结构型）
date: 2009-12-10
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

为其他对象提供一种代理以控制对这个对象的访问。

## 动机

在面向对象系统中，有些对象由于某种原因（比如对象创建的开销很大，或者某些操作需要安全控制，或者需要进程外的访问等），直接访问会给使用者、或者系统结构带来很多麻烦。如何在不失去透明操作对象的同时来管理/控制这些对象特有的复杂性？增加一层间接层是软件开发中常见的解决方式。看下结构图：

![2010-12-29_124225](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290619654.png)

Subject：该类中定义了一些RealSubject和Proxy中共有的方法。

RealSubject：这个类是Proxy所要代理的实体类，客户端只和Proxy交互。

代码实现：

```
/// <summary>
/// 公共接口
/// </summary>
interface ISubject
{
    void Request();
}
/// <summary>
/// 被代理的类
/// </summary>
public class RealSubject : ISubject
{
    public void Request()
    {
        Console.WriteLine("被代理类的请求");
    }
}
/// <summary>
/// 代理类
/// </summary>
public class Proxy : ISubject
{
    RealSubject realSubject=new RealSubject();
    public void Request()
    {
        realSubject.Request();
    }
}
/// <summary>
/// 客户代码
/// </summary>
/// <param name="args"></param>
static void Main(string[] args)
{
    Proxy proxy = new Proxy();
    proxy.Request();
}
```

上面的代码非常简单，在客户端使用的是Proxy类，其实调用的是RealSubject类中的方法，起到了代理的目的。

## Proxy模式的应用场景

1. 远程代理，也就是为一个对象在不同的地址空间提供局部代表。这样可以隐藏一个对象存在不同地址空间的事实。（net中的webservice）
2. 虚拟代理，根据需要创建开销很大的对象。通过他来存放实例化需要很长时间的真实对象。
3. 安全代理，用来控制真实对象访问时的权限。
4. 智能指引，指当调用这是对象时，代理处理另外一些事情。
[以上四点摘自《大话设计模式》]

## Proxy模式的几个要点

* “增加一层间接层”是软件系统中对许多复杂问题的一种常见解决方法。在面向对象系统中，直接使用某些对象会带来很多问题，作为间接层的proxy对象便是解决这一问题的常用手段。
* 具体proxy设计模式的实现方法、实现粒度都相差很大，有些可能对单个对象做细粒度的控制，如copy-on-write技术，有些可能对组件模块提供抽象代理层,在架构层次对对象做proxy。
* Proxy并不一定要求保持接口的一致性，只要能够实现间接控制，有时候损及一些透明性是可以接受的。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

