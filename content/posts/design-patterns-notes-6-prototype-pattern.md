---
title: 设计模式笔记(6)—原型模式（创建型）
date: 2009-11-24
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

使用原型实例指定创建对象的种类，然后通过拷贝这些原型来创建新的对象。

## 动机

在软件系统中，经常面临着“某些结构复杂的对象”的创建工作，但由于需求的变化，这些对象将成面临着剧烈的变化，但他们拥有比较稳定一致的接口。

假设在一些打斗游戏场景中，有这样一些角色，普通(NormalActor),可以飞的(FlyActor)，可以潜水的(WaterActor)

```
public abstract class NormalActor { }
public abstract class FlyActor { }
public abstract class WaterActor { }
```

上面的三个类都是抽象类，自然会有具体的类来继承这些抽象类

```
public class NormalActorA : NormalActor { }
public class FlyActorA : FlyActor { }
public class WaterActorA : WaterActor { }
```

在游戏运行中就会去使用这些角色的具体类，如下

```
public class GameSystem
{
    public void Run()
    {
        NormalActorA normalActor1 = new NormalActorA();
        NormalActorA normalActor2 = new NormalActorA();
        NormalActorA normalActor3 = new NormalActorA();
        NormalActorA normalActor4 = new NormalActorA();
        NormalActorA normalActor5 = new NormalActorA();

        FlyActorA flyActor1 = new FlyActorA();
        FlyActorA flyActor2 = new FlyActorA();

        WaterActorA waterActor1 = new WaterActorA();
        WaterActorA waterActor2 = new WaterActorA();
    }
}
```

在GameSystem类中，我们直接使用具体类（NormalActorA）等来创建对象，GameSystem就对这些具体类产生了依赖，在DIP（依赖倒置原则）中讲到抽象不应依赖具体实现，具体实现应依赖于抽象，所以GameSystem中的代码要进行如下改动

```
public class GameSystem
{
    public void Run(NormalActor normalActor, FlyActor flyActor,
        WaterActor waterActor)
    {
        NormalActor normalActor1 = normalActor.Clone();
        NormalActor normalActor2 = normalActor.Clone();
        NormalActor normalActor3 = normalActor.Clone();
        NormalActor normalActor4 = normalActor.Clone();
        NormalActor normalActor5 = normalActor.Clone();

        FlyActor flyActor1 = flyActor.Clone();
        FlyActor flyActor2 = flyActor.Clone();

        WaterActor waterActor1 = waterActor.Clone();
        WaterActor waterActor2 = waterActor.Clone();
    }
}
```

经过修改在GameSystem类中已经看不到具体类的影子了，创建对象是通过传入的抽象类类型的参数的Clone方法来创建，关于Clone方法在后面讲到，这样GameSystem就只依赖于抽象了。

下面来说说Clone方法了，首先在抽象类中定义Clone方法

```
public abstract class NormalActor
{
    public abstract NormalActor Clone();
}
public abstract class FlyActor
{
    public abstract FlyActor Clone();
}
public abstract class WaterActor
{
    public abstract WaterActor Clone();
}
```

然后在具体类中来实现Clone，使用[MemberwiseClone](http://msdn.microsoft.com/en-us/system.object.memberwiseclone.aspx)方法来实现克隆，使用MemberwiseClone方法需要注意的是他只能实现值类型的拷贝，如果被拷贝对象中包含有引用类型，只会拷贝引用地址。

```
public class NormalActorA : NormalActor
{
    public override NormalActor Clone()
    {
        return (NormalActor)this.MemberwiseClone();
    }
}
public class FlyActorA : FlyActor
{
    public override FlyActor Clone()
    {
        return (FlyActor)this.MemberwiseClone();
    }
}
public class WaterActorA : WaterActor
{
    public override WaterActor Clone()
    {
        return (WaterActor)this.MemberwiseClone();
    }
}
```

至此，原型模式的代码结构基本完成，下面看看在程序中试怎么来调用的

```
public class App
{
    public static void Main()
    {
        GameSystem gameSystem = new GameSystem();
        gameSystem.Run(new NormalActorA(), new FlyActorA(), new WaterActorA());
    }
}
```

## 原型模式（Prototype）的几个要点

* Prototype模式同样用于隔离类对象的使用者和具体类型（易变类型）之间的耦合关系，同样要求这些易变类型具有稳定的接口。
* Prototype模式对于“如何创建易变类的实体对象”采用原型克隆的方法来做，他使得我们可以非常灵活的动态创建“拥有某些稳定接口”的新对象–所需工作仅仅是注册一个新类的对象（原型），然后在任何需要的地方不断地Clone。
* Prototype模式中的克隆方法可以利用Net中的Object类的MemberwiseClone方法或是序列化来实现深拷贝。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

