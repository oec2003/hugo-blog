---
title: 设计模式笔记(4)—生成器模式（创建型）
date: 2009-11-21
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

将一个复杂对象的构建与其表示相分离，使其同样的构建过程可以创建不同的表示。

## 动机

在软件系统中，有时侯面临着一个复杂对象的创建工作，这个发展对象通常是由各个部分的子对象用一定的算法构成；由于需求的变化，这个复杂的对象的各个部分经常面临着巨大的变化，但是将他们组合起来的算法相对稳定。

还是拿游戏中的房屋作为例子来讲，房屋由门、窗户、墙、地板、天花板组成。这些组成部分可能是经常要发生变化的。如果按常规设计，这些组成部分中的任何一个发生变化时都将使房屋重建，生成器模式的作用就是要使这些组件的变化不影响到房屋。首先构建一个House类

```
public abstract class House
{
    //该类中可能包含复杂的创建逻辑
}
```

下面的是一个抽象的构建类，用类构建房屋的组件

```
public abstract class Builder
{
    public abstract void BuildDoor();
    public abstract void BuildWall();
    public abstract void BuildWindow();
    public abstract void BuildFloor();
    public abstract void BuildHouseCeiling();

    public abstract House GetHouse();
}
```

假设在一个游戏管理类（GameManager）中来完成对房屋的构建

```
public class GameManager
{
    public static House CreateHouse(Builder builder)
    {
        builder.BuildDoor();

        builder.BuildWindow();
        builder.BuildWindow();

        builder.BuildWall();
        builder.BuildWall();
        builder.BuildWall();
        builder.BuildWall();

        builder.BuildFloor();
        builder.BuildHouseCeiling();

        return builder.GetHouse();
    }
}
```

在GameManager类中都是使用的抽象类来完成房屋的构建，所以GameManager类基本上是稳定的，可能出现变化的是创建门或是窗户的个数，当然这个我们可以在数据库中记录。稳定的部分已经创建，现在就来创建经常会变动的部分，假设现在需要构建一个罗马风格的房屋，可以写一个RomanHouse和一个RomanHouseBuilder类来继承House类和Builder类。

```
public class RomanHouse:House {}

public class RomanHouseBuilder : Builder
{
    public override void BuildDoor() { }
    public override void BuildFloor() {}
    public override void BuildHouseCeiling(){ }
    public override void BuildWall(){}
    public override void BuildWindow(){}
    public override House GetHouse()
    {
        return new RomanHouse();
    }
}
```

如果需要其他风格的访问，同可以创建相应的类继承House和HouseBuilder就可以。

客户端调用的代码如下

```
public class App
{
    public static void Main()
    {
        House house = GameManager.CreateHouse(new RomanHouseBuilder());
    }
}
```

如果需要另外的一个风格的House，只需修改GameManager.CreateHouse方法的参数为另一种风格的Builder即可，虽然这个改动很简单，但毕竟还是改变了，可以同过反射的方式来时客户程序不做任何的修改，如下:

```
public class App
{
    public static void Main()
    {
        string assemblyName =
            ConfigurationManager.AppSettings["AssemblyName"].Trim();
        string className    =
            ConfigurationManager.AppSettings["ClassName"].Trim();
        Assembly assembly   = Assembly.Load(assemblyName);
        Type type           = assembly.GetType(className);
        Builder builder     = Activator.CreateInstance(type) as Builder;
        House house         = GameManager.CreateHouse(builder);
    }
}
```

像上面这样改动之后，如果有新的风格的房屋需求，需要添加一套新的风格的房屋的类和Builder，然后修改下就可以了，客户程序不用做任何修改，很好的满足的OCP。

## Builder模式的几个要点

Builder模式主要用户“分步骤构建一个复杂的对象”。在这其中“分步骤”是一个稳定的算法，而复杂对象的各个部分经常变化。变化点在哪里，封装哪里—Builder模式主要在于应对“复杂对象各个部分”的频繁需求变动。其缺点在于难以应对“分步骤构建算法”的需求变动。Abstract Factory模式解决“系列对象”的需求变化，Builder模式解决“对象部分”的需求变化。Builder模式通常和Composite模式组合使用。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

