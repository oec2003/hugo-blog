---
title: 设计模式笔记(14)—模板方法模式（行为型）
date: 2009-12-14
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

定义一个操作中的算法的骨架，而将一些步骤延迟到子类中。Template Method使得子类可以不改变一个 算法的结构即可重定义该算法的某些特定步骤。

## 动机

在软件构建过程中，对于某一项任务，它常常有稳定的整体操作结构，但各个子步骤却有很多改变的需求，或者由于固有的原因（比如框架与应用之间的关系）而无法和任务的整体结构同时实现。如何在确定稳定操作结构的前提下，来灵活应对各个子步骤的变化或者晚期实现需求？

模板方法模式结构图：

![2010-12-29_122541](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290615923.png)

AbstractClass类：这个抽象类中定义了一个模板方法TemplateMethod，该方法通常为一个具体方法，将抽象类中的一些抽象的操作组合在其中，推迟到子类实现。

ConcreteClass类:按照需求实现父类定义的一个或多个抽象方法。

一个小的例子来反映上面的结构：

```
/// <summary>
/// 测试车的类--->AbstractClass
/// </summary>
public abstract class Vehical
{
    protected abstract void Start();  //PrimitiveOperation
    protected abstract void Run();    //PrimitiveOperation
    protected abstract void Trun();   //PrimitiveOperation
    protected abstract void Stop();   //PrimitiveOperation
    /// <summary>
    /// 相当于TemplateMethod
    /// </summary>
    public void Test()
    {
        //做记录等操作
        Start();
        Run();
        Trun();
        Stop();
    }
}

/// <summary>
/// 红旗车--->ConcreteClass
/// </summary>
public class HongQiCar : Vehical
{
    protected override void Start()
    {
        Console.WriteLine("测试红旗车启动");
    }
    protected override void Run()
    {
        Console.WriteLine("测试红旗车行驶");
    }
    protected override void Trun(int degree)
    {
        Console.WriteLine("测试红旗车转向");
    }
    protected override void Stop()
    {
        Console.WriteLine("测试红旗车停止");
    }
}
/// <summary>
/// QQ车--->ConcreteClass
/// </summary>
public class QQCar : Vehical
{
    protected override void Start()
    {
        Console.WriteLine("测试QQ车启动");
    }
    protected override void Run()
    {
        Console.WriteLine("测试QQ车行驶");
    }
    protected override void Trun(int degree)
    {
        Console.WriteLine("测试QQ车转向");
    }
    protected override void Stop()
    {
        Console.WriteLine("测试QQ车停止");
    }
}
/// <summary>
/// 客户代码
/// </summary>
public class App
{
    static void Main()
    {
        Vehical vehical;
        vehical = new HongQiCar();
        vehical.Test();

        vehical = new QQCar();
        vehical.Test();
        Console.ReadLine();
    }
}
```

## Template Method模式的几个要点

* Template Method模式是一种非常基础性的设计模式，在面向对象系统中有着大量的应用。它用最简洁的机制（虚函数的多态性）为很多应用程序框架提供了灵活的扩展点，是代码复用方面的基本实现结构。
* 除了可以灵活应对子步骤的变化外，“不要调用我，让我来调用你”的反向控制结构是Template Method的典型应用。
* 在具体实现方面，被Template Method调用的虚方法可以具有实现，也可以没有任何实现（抽象方法、纯虚方法），但一般推荐将它们设置为protected方法。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

