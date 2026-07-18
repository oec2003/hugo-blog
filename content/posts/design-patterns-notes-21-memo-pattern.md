---
title: 设计模式笔记(21)—备忘录模式（行为型）
date: 2010-01-27
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

在不破坏封装性的前提下，捕获一个对象的内部状态，并在该对象之外保存这个状态。这样以后就可以将该对象恢复到原先保存的状态。

## 动机

在软件构建过程中，某些对象的状态在转换过程中，可能由于某种需要，要求程序能够回溯到对象之前处于某个点时的状态。如果使用一些公有接口来让其他对象得到对象的状态，便会暴露对象的细节实现。如何实现对象状态的良好保存与恢复？但同时又不会因此而破坏对象本身的封装性，看下面的结构图和代码。

备忘录模式结构图：

![2010-12-29_111357](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290613625.png)

上图中Originator为原发器，也可以讲发起者，可以创建一个备忘录（CreateMemento），Memento为备忘录，负责存储原发器中的内部状态。Caretaker主要负责存储备忘录。代码如下：

```
/// <summary>
/// 备忘录类
/// </summary>
public class Memento
{
    private string _state;
    public string State
    {
        get{return _state;}
    }
    public Memento(string state)
    {
        this._state = state;
    }
}
/// <summary>
/// 原发器类
/// </summary>
public class Originator
{
    public string State { get; set; }
    public Memento CreateMemento()
    {
        return new Memento(State);
    }
    public void SetMemento(Memento memento)
    {
        State = memento.State;
    }
}
/// <summary>
/// 管理者
/// </summary>
public class Caretaker
{
    public Memento Memento { get; set; }
}
/// <summary>
/// 客户端程序
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        //实例化原发器并设置状态名称
        Originator o = new Originator();
        o.State = "oec2003";
        Console.WriteLine("设置状态名字为:" + o.State);
        //实例化管理者，创建一个备忘储存在管理者中
        Caretaker c = new Caretaker();
        c.Memento = o.CreateMemento();
        //更改了原发器的状态名称
        o.State = "oec2004";
        Console.WriteLine("改后的状态名字为:" + o.State);
        //将备忘信息设置给原发器
        o.SetMemento(c.Memento);
        Console.WriteLine("原来的状态名字为:" + o.State);
    }
}
```

## Memento模式的几个要点

* 备忘录（Memento）存储原发器（Originator）对象的内部状态，在需要时恢复原发器状态。Memento模式适用于“由原发器管理，却又必须存储在原发器之外的信息”。
* 在实现Memento模式中，要防止原发器以外的对象访问备忘录对象。备忘录对象有两个接口，一个为原发器使用的宽接口；一个为其他对象使用的窄接口。
* 在实现Memento模式时，要考虑拷贝对象状态的效率问题，如果对象开销比较大，可以采用某种增量式改变来改进Memento模式。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

