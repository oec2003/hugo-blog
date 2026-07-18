---
title: 设计模式笔记(3)—抽象工厂模式（创建型）
date: 2009-11-20
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

提供一个借口，让该接口负责创建一系列_相关或者相互依赖的对象_，无需指定他们具体的类。

## 动机

在软件系统中经常面临着_一系列相互依赖的对象_的创建的工作，同时由于需求的变化，往往存在着更对系列对象的创建。

常规的对象创建的方法，直接使用new关键字

```
Road road = new Road();
```

这样直接new会有一个问题，不能应对具体实例化类型的变化，比如说有不同的Road类型需要被实例化的时候就需要来更改此处的代码。解决这个问题的办法就是封装变化点，变化点也是相对而言的，比如在项目中有些地方会经常更具客户的需求而作改动，我们就可以将其封装起来。拿上面的那行代码来说，因为可能有不同类型的Road需要被创建，变化点就是“对象的创建”。

一种比较简单的解决方法，看下面的代码

```
public class RoadFactory
{
    public static Road CreateRoad()
    {
        return new Road();
    }
}
//调用的代码
public class Test
{
    static void Main(string[] args)
    {
        Road road = RoadFactory.CreateRoad();
    }
}
```

现在需求有了改变，需要创建一种另一种类型的路HighRoad，只需更改工厂类的代码就可以，调用的地方不用做修改，如下

```
public class RoadFactory
{
    public static Road CreateRoad()
    {
        return new HighRoad();
    }
} 
```

现在需求又有了改变，比如在游戏的开发场景中，我们需要构建道路、房屋、丛林等等对象，按照上面的思路我 可以写成下面这样的代码

```
//客户程序
  public class Test
  {
      static void Main(string[] args)
      {
          Road road = GameObjectFactory.CreateRoad();
          Building building = GameObjectFactory.CreateBuilding();
          Jungle jungle = GameObjectFactory.CreateJungle();
      }
  }

  public class GameObjectFactory
  {
      public static Road CreateRoad()
      {
          return new Road();
      }
      public static Building CreateBuilding()
      {
          return new Building();
      }
      public static Jungle CreateJungle()
      {
          return new Jungle();
      }
  }
```

以上的代码属于一种简单工厂的实现，将对象的创建放到一个单独的工厂类中，实现了和客户程序的分离，不过 不能应对不同系列对象的变化，比如有不同风格的游戏场景，对于要实现不同风格场景中的道路、房屋等对象的 创建，上面的代码就难以实现。对于有_不同系列对象_这样的需求，变化点转移到了工厂类的内部，上面的代码中 对象的创建是在工厂类中的静态方法中写死的，不能应对变化，如果我们另外创建一个能适应其他系列的工厂类， 那么客户程序就会发生改变，这不是我们希望看到的。要解决此类问题必须使用面向对象的技术来封装变化点。
结构图

![image-20220128185348143](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201281854048.png)

上面的结构图中AbstractFactory为创建对象的抽象工厂类，AbstractProductA、AbstractProductB为具 体对象的抽象类，拿到上面的例子中就是道路、房屋、丛林等的抽象。他们的子类ProductA1、ProductB1就是 指不同风格系列的是实现，这也正是抽象工厂模式要解决的问题。图中还可以看出客户程序依赖的是抽象的部分 而没有涉及到具体的实现，也就是说当需求改变的时候，客户程序是不用变的。下面就来看代码是如何实现。

首先创建抽象工厂类

```
public abstract class FacilitiesFactory
{
    public abstract Road CreateRoad();
    public abstract Building CreateBuilding();
    public abstract Jungle CreateJungle();
}
```

因为游戏场景中有道路、房屋、丛林这三种对象，需要创建这三个对象的抽象类，如果有更多的对象，需要增加其他对象的抽象类。

```
//道路
public abstract class Road
{ 

}
//房屋
public abstract class Building
{ 

}
//丛林
public abstract class Jungle
{ 

}
```

下面的客户程序代码都是对抽象类之间的操作

```
//客户程序
public class GameManage
{
    FacilitiesFactory _facilitiesFactory;
    Road _road;
    Building _building;
    Jungle _jungle;
    public GameManage(FacilitiesFactory facilitiesFactory)
    {
        _facilitiesFactory = facilitiesFactory;
    }

    /// <summary>
    /// 创建一些基础设施的对象
    /// </summary>
    public void BuildGameFacilities()
    {
        _road       = _facilitiesFactory.CreateRoad();
        _building   = _facilitiesFactory.CreateBuilding();
        _jungle     = _facilitiesFactory.CreateJungle();
    }

    public void Play()
    {
        //执行一些操作
    }
}
```

在应用程序中使用上面的代码

```
public class App
{
    static void Main()
    {
        GameManage g = new GameManage(?);
        g.BuildGameFacilities();
        g.Play();
    }
}
```

上面的代码中？的地方应该传入什么参数呢？从GameManage类的构造函数中可以看出是一个抽象工厂类型，大 家都知道，抽象类是不能创建实例的，所以问号的地方应该是AbstractFactory类的子类。假设现在有一个现代 风格系列的游戏场景，就需要创建一组现在的道路、房屋、丛林，如下：

```
//道路
public class ModernRoad:Road
{

}
//房屋
public class ModernBuilding:Building
{

}
//丛林
public class ModernJungle:Jungle
{

}
```

下面创建现代风格的工厂类

```
public class ModernFacilitiesFactory:FacilitiesFactory
{
    public override Building CreateBuilding()
    {
        return new ModernBuilding();
    }
    public override Road CreateRoad()
    {
        return new ModernRoad();
    }
    public override Jungle CreateJungle()
    {
        return new ModernJungle();
    }
}
```

现在App类的代码可以改成如下

```
public class App
{
    static void Main()
    {
        GameManage g = new GameManage(new ModernFacilitiesFactory());
        g.BuildGameFacilities();
        g.Play();
    }
}
```

结构图

![image-20220128185422647](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201281854132.png)

如果有新的需求，需要一套古典风格或者是梦幻风格的的游戏场景，只需要

1. 创建一套新的相应风格的对象继承道路、房屋、丛林等的抽象类
2. 创建一个相应风格的工厂继承抽象工厂
3. App类中调用的地方给GameManage类传入相应的工厂类的实例。

整个过程中，只是在外部扩展一些类，GameManage并没有做任何的改变

## 抽象工厂模式的几个要点：

* 如果没有对应多系列对象构建的需求变化，没有必要使用抽象工厂模式，使用静态工厂完全可以达到要求
* 系列对象指的是这些对象之间的相互依赖，或作用的关系，如游戏开发场景中的道路与房屋的依赖等
* 抽象工厂模式主要在于应对新系列的需求变动。其确定在于难以应对新对象的变动
* 抽象工厂模式经常和工厂方法模式组合起来使用，来应对对象创建的需求变化

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

