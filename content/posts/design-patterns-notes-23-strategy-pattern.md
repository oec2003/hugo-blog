---
title: 设计模式笔记(23)—策略者模式（行为型）
date: 2010-01-31
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

定义一系列算法，把它们一个个封装起来，并且使它们可互相替换。该模式使得算法可独立于使用它的客 户而变化。

## 动机

在软件构建过程中，某些对象使用的算法可能多种多样，经常改变，如果将这些算法都编码到对象中，将会使对象变得异常复杂；而且有时候支持不使用的算法也是一个性能负担。如何在运行时根据需要透明地更改对象的算法？将算法与对象本身解耦，从而避免上述问题？看下面的策略者模式的结构图和基本代码，策略者模式比较简单，下面只是给出基本的代码实现。

策略者模式结构图：

![image-20220129061002254](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290610502.png)

基本实现代码：

```
/// <summary>
/// 抽象算法类
/// </summary>
public abstract class Strategy
{
    //抽象算法方法
    public abstract void AlgorithmInterface();
}
/// <summary>
/// 具体算法A
/// </summary>
public class ConcretestrategyA : Strategy
{
    public override void AlgorithmInterface()
    {
        Console.WriteLine("算法A的实现");
    }
}
/// <summary>
/// 具体算法B
/// </summary>
public class ConcretestrategyB : Strategy
{
    public override void AlgorithmInterface()
    {
        Console.WriteLine("算法B的实现");
    }
}
/// <summary>
/// 具体算法C
/// </summary>
public class ConcretestrategyC : Strategy
{
    public override void AlgorithmInterface()
    {
        Console.WriteLine("算法C的实现");
    }
}
/// <summary>
/// 上下文
/// </summary>
public class Context
{
    private Strategy _strategy;
    public Context(Strategy stragtety)
    {
        this._strategy = stragtety;
    }
    public void ContextInterface()
    {
        _strategy.AlgorithmInterface();
    }
}
/// <summary>
/// 客户端代码
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        Context context;
        context = new Context(new ConcretestrategyA());
        context.ContextInterface();
        context = new Context(new ConcretestrategyB());
        context.ContextInterface();
        context = new Context(new ConcretestrategyC());
        context.ContextInterface();
    }
}
```

运行结果如下：

![image-20220129061018029](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290610808.png)

当有新的算法需求时，只需要添加一个具体的算法类继承抽象算法类即可，如下：

```
/// <summary>
/// 具体算法D
/// </summary>
public class ConcretestrategyD: Strategy
{
    public override void AlgorithmInterface()
    {
        Console.WriteLine("算法D的实现");
    }
}
```

然后只需要改动客户端的代码就可以了，代码如下：

```
/// <summary>
/// 客户端代码
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        Context context;
        context = new Context(new ConcretestrategyA());
        context.ContextInterface();
        context = new Context(new ConcretestrategyB());
        context.ContextInterface();
        context = new Context(new ConcretestrategyC());
        context.ContextInterface();
        context = new Context(new ConcretestrategyD());
        context.ContextInterface();
    }
}
```

运行结果如下：

![image-20220129061030878](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290610303.png)

## Strategy模式的几个要点

* Strategy及其子类为组件提供了一系列可重用的算法，从而可以使得类型在运行时方便地根据需要在各个算法之间进行切换。所谓封装算法，支持算法的变化。
* Strategy模式提供了用条件判断语句以外的另一种选择，消除条件判断语句，就是在解耦合。含有许多条件判断语句的代码通常都需要Strategy模式。
* 与State类似，如果Strategy对象没有实例变量，那么各个上下文可以共享同一个Strategy对象，从而节省对象开销。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

