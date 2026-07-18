---
title: 设计模式笔记(17)—中介者模式（行为型）
date: 2010-01-20
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

用一个中介对象来封装一系列的对象交互。中介者使各对象不需要显式的相互引用，从而使其耦合松散，而且可以独立地改变它们之间的交互。

## 动机

在软件构建过程中，经常会出现多个对象互相关联交互的情况，对象之间常常会维持一种复杂的引用关系，如果遇到一些需求的更改，这种直接的引用关系将面临不断的变化。在这种情况下，我们可使用一个“中介对象”来管理对象间的关联关系，避免相互交互的对象之间的紧耦合引用关系，从而更好地抵御变化。

中介者模式的结构图：

![2010-12-29_114801](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290617750.png)

代码实现：

```
/// <summary>
/// 抽象的中介者
/// </summary>
public abstract class Mediator
{
    public abstract void Send(string msg, Colleague colleague);
}
/// <summary>
/// 抽象的同事类
/// </summary>
public abstract class Colleague
{
    protected Mediator _mediator;
    public Colleague(Mediator mediator)
    {
        _mediator = mediator;
    }
}
/// <summary>
/// 具体的中介者对象
/// </summary>
public class ConcreteMediator : Mediator
{
    public ConcreteCollegue1 Colleague1 { get; set; }
    public ConcreteCollegue2 Colleague2 { get; set; }
    public override void Send(string msg, Colleague colleague)
    {
        if (colleague == Colleague1)
        {
            Colleague2.Notify(msg);
        }
        else
        {
            Colleague1.Notify(msg);
        }
    }
}
/// <summary>
/// 具体的同事类1
/// </summary>
public class ConcreteCollegue1:Colleague
{
    public ConcreteCollegue1(Mediator mediator)
        : base(mediator)
    {

    }

    public void Send(string msg)
    {
        _mediator.Send(msg,this);
    }
    public void Notify(string msg)
    {
        Console.WriteLine("通知同事1："+msg);
    }
}
/// <summary>
/// 具体的同事类2
/// </summary>
public class ConcreteCollegue2:Colleague
{
    public ConcreteCollegue2(Mediator mediator)
        : base(mediator)
    {

    }

    public void Send(string msg)
    {
        _mediator.Send(msg,this);
    }
    public void Notify(string msg)
    {
        Console.WriteLine("通知同事2："+msg);
    }
}
/// <summary>
/// 客户端调用
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        ConcreteMediator cm = new ConcreteMediator();
        ConcreteCollegue1 cc1 = new ConcreteCollegue1(cm);
        ConcreteCollegue2 cc2 = new ConcreteCollegue2(cm);
        cm.Colleague1 = cc1;
        cm.Colleague2 = cc2;
        cc1.Send("看阿凡达了吗？");
        cc2.Send("呵呵，周末公司组织去看。");
    }
}
```

## Mediator模式的几个要点

* 将多个对象间复杂的关联关系解耦，Mediator模式将多个对象间的控制逻辑进行集中管理，变“多个对象互相关联”为“多个对象和一个中介者关联”，简化了系统的维护，抵御了可能的变化。
* 随着控制逻辑的复杂化，Mediator具体对象的实现可能相当复杂。这时候可以对Mediator对象进行分解处理。
* Façade模式是解耦系统外到系统内（单向）的对象关联关系；Mediator模式是解耦系统内各个对象之间（双向）的关联关系。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

