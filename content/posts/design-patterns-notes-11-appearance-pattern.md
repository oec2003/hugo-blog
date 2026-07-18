---
title: 设计模式笔记(11)—外观模式（结构型）
date: 2009-12-07
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

为子系统中的一组接口提供一个一致的界面，Façade模式定义了一个高层接口，这个接口使得这一子系统更加容易使用。

先来看个小例子，假设我们需要开发一个坦克模拟系统用于模拟坦克车在各种作战环境中的行为，其中坦克系统由引擎、控制器、车轮、车身等各子系统构成。就会有下面这些类的产生

```
public class Wheel{ }
public class Engine{ }
public class Controller{ }
public class BodyWork{ }
```

不同的场景中的要求都不一样，可能会用到某些子系统，也可能不会用到，这些不同的场景就相当是外部接口，这些场景和子系统的关系如下图：

![2010-12-29_125236](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290618615.png)

图1

上图中的关系感觉很混乱，场景和子系统之间的耦合度很高，要降低这种耦合度，就要使和场景之间交互的不是这些子系统了，而是相对单一的一个中间层，如下图：

![2010-12-29_125304](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290618206.png)

图2

上图的Facade就将子系统隐藏了，不同的场景都是直接和Facade交互。

## 动机

上面图1方案的问题在于组件的客户和组件中各种复杂的子系统有了过多的耦合，随着外部客户程序和各子系统的演化，这种过多的耦合面临很多变化的挑战。如何简化外部客户程序和系统间的交互接口？如何将外部客户程序的演化和内部子系统的变化之间的依赖相互解耦？这就要用到Facade模式，先来看结构图：

![2010-12-29_125333](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290618557.png)

代码实现，先定义一些子系统类

```
public class Wheel
{
    public void WAction1() { }
    public void WAction2() { }
}
public class Engine
{
    public void EAction1() { }
    public void EAction2() { }
}
public class Controller
{
    public void CAction1() { }
    public void CAction2() { }
}
public class BodyWork
{
    public void BAction1() { }
    public void BAction2() { }
}
```

Facade类，用来组合这些子系统

```
public class TankFacade
{
    Wheel[] wheels          = new Wheel[4];
    Engine[] engines        = new Engine[4];
    BodyWork bodywork       = new BodyWork();
    Controller controller   = new Controller();

    public void Start()
    {
        //用到子系统中的一个或多个
    }
    public void Stop()
    {
        //用到子系统中的一个或多个
    }
    public void Run()
    {
        //用到子系统中的一个或多个
    }
    public void Shot()
    {
        //用到子系统中的一个或多个
    }
}
```

客户端调用

```
public class App
{
    static void Main()
    {
        TankFacade facade = new TankFacade();
        //可以根据不同场景的需要来选择调用相应的方法
        //在客户处之需要使用Facade就可以，不需要知道子系统的实现
        //就起到了和子系统解耦的作用
        facade.Start();
        facade.Run();
        facade.Shot();
        facade.Stop();
    }
}
```

Facade模式的几个要点

* 从客户程序的角度来看， Facade模式不仅简化了整个组件系统的接口，同时对于组件内部与外部客户程序来说，从某种程度上也达到了一种“解耦”的效果——内部子系统的任何变化不会影响到Façade接口的变化。
* Façade设计模式更注重从架构的层次去看整个系统，而不是单个类的层次。Façade很多时候更是一种架构设计模式。
* 注意区分Façade模式、Adapter模式、Bridge模式与Decorator模式。Façade模式注重简化接口，Adapter模式注重转换接口，Bridge模式注重分离接口（抽象）与其实现，Decorator模式注重稳定接口的前提下为对象扩展功能。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

