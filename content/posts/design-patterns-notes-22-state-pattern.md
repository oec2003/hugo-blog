---
title: 设计模式笔记(22)—状态模式（行为型）
date: 2010-01-28
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

允许一个对象在其内部状态改变时改变它的行为。从而使对象看起来似乎修改了其行为。

## 动机

在软件构建过程中，某些对象的状态如果改变，其行为也会随之而发生变化，比如文档处于只读状态，其支持的行为和读写状态支持的行为就可能完全不同。如何在运行时根据对象的状态来透明地更改对象的行为？而不会为对象操作和状态转化之间引入紧耦合？看下面状态模式的结构图和代码。

状态模式结构图：

![2010-12-29_110619](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290611919.png)

日常生活中我们常见的灯会有两种状态开和关，当灯亮着时我们可以用开关使之熄灭，反之则变量，看下面的代码就是改变灯的开关状态的一个过程：

```
/// <summary>
/// 灯的状态开和关
/// </summary>
public enum LightState
{
    On,
    Off
}
public class ChangeLightState
{
    private LightState _state = LightState.On;
    public LightState Change()
    {
        if (_state == LightState.On)
        {
            _state = LightState.Off;
        }
        else if (_state == LightState.Off)
        {
            _state = LightState.On;
        }
        return _state;
    }
}
/// <summary>
/// 客户端程序
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        ChangeLightState l = new ChangeLightState();
        l.Change();
        l.Change();
        l.Change();
    }
}
```

上面的代码使用if语句来解决了灯开关状态的问题，不过在实际开发中的一些状态不可能是简单的枚举，这时如果依然使用if语句就会显得比较复杂，而且随着状态的改变会频繁进行修改if语句。所以需要将状态转换和处理的变化封装在抽象后的具体类中，看上面结构图的对应代码：

```
public abstract class State
{
    public abstract void Handle(Context context);
}
public class ConcreteStateA : State
{
    public override void Handle(Context context)
    {
        context.State = new ConcreteStateB();
    }
}
public class ConcreteStateB : State
{
    public override void Handle(Context context)
    {
        context.State = new ConcreteStateA();
    }
}
public class Context
{
    private State _state;
    public Context(State state)
    {
        this._state = state;
    }
    public State State
    {
        get { return _state; }
        set { _state = value;}
    }
    public void Request()
    {
        _state.Handle(this);
    }
}
/// <summary>
/// 客户端程序
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        Context context = new Context(new ConcreteStateA());
        context.Request();
        context.Request();
        context.Request();
    }
}
```

根据状态模式将上面的灯开关的代码改进如下：

```
public abstract class State
{
    public abstract void Change(ChangeLightState c);
}
public class OnState : State
{
    public override void Change(ChangeLightState c)
    {
        c.State = new OffState();
    }
}
public class OffState : State
{
    public override void Change(ChangeLightState c)
    {
        c.State = new OnState();
    }
}
public class ChangeLightState
{
    public State State { get; set; }
    public void Change()
    {
        State.Change(this);
    }
}

/// <summary>
/// 客户端程序
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        ChangeLightState c = new ChangeLightState();
        c.State = new OnState();
        c.Change();
        c.Change();
        c.Change();
    }
}
```

## State模式的几个要点

* State模式将所有与一个特定状态相关的行为都放入一个State的子类对象中，在对象状态切换时，切换相应的对象；但同时维持State的接口，这样实现了具体操作与状态转换之间的解耦。
* 为不同的状态引入不同的对象使得状态转换变得更加明确，而且可以保证不会出现状态不一致的情况，因为转换是原子性的——即要么彻底转换过来，要么不转换。
* 如果State对象没有实例变量，那么各个上下文可以共享同一个State对象，从而节省对象开销。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

