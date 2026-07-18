---
title: 设计模式笔记(12)—享元模式（结构型）
date: 2009-12-09
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

运用共享技术有效地支持大量细粒度的对象。

## 动机

采用纯粹对象方案的问题在于大量细粒度的对象会很快充斥在系统中，从而带来很高的运行时代价——主要指内存需求方面的代价。如何在避免大量细粒度对象问题的同时，让外部客户程序仍然能够透明地使用面向对象的方式来进行操作？这需要用到享元模式，不过应用享元模式是需要进行评估的，也就是说在当前情况下是否会对系统造成性能上的影响，如果会那么就是用，下面先来看个小例子是如何进行评估的。

假设有一个字符的类Charator，如下：

```
public class Charator
{
    char c;
    Font f;
}
```

为了方便评估，Charator类中的Font类型采用自定义的类型：

```
public class Font
{
    string fontName;
    int size;
    Color color;
}
```

在客户代码中使用Charator类

```
public class App
{
    static void Main()
    {
        List<Charator> list=new List<Charator>(100000);
        for (int i = 0; i < list.Count; i++)
        {
            Charator charator = new Charator();
            list.Add(charator);
        }
    }
}
```

在客户代码中将Charator类实例化了100000次，Charator类中有两个成员，并且有个成员为Font类型，Font类型中又定义了三个成员，下面将在代码注释中标出要占用的内存量：

```
/// <summary>
///  如果有n个Font对象占用大小为12bytes*n 其实字符串类型
///  除了本身占用的4bytes外 还有一个引用指针要占用4bytes，
///  不过这个 不会构成倍乘效应，也就是当有n个对象时不会
///  以n的倍数增长，所以可以忽略
/// </summary>
public class Font
{
    string fontName; //4bytes
    int size;        //4bytes
    Color color;     //4bytes
}
/// <summary>
/// 总共占用2+20+4+8+2=36bytes
/// 第三个的4为指向font的指针
/// 第四个的8为虚表指针和垃圾回收和同步
/// 最后的2为char的填充位
/// </summary>
public class Charator
{
    /// <summary>
    /// 占用2bytes
    /// </summary>
    char c;
    /// <summary>
    /// 总占用12bytes+4bytes+4bytes =20bytes
    /// 其中12bytes是三个成员的，另外的两个4bytes分别为
    /// 虚表指针和net垃圾回收机制所需要的一些位，因为每个
    /// 类型最终都可以追溯到object类型，所以默认都会有虚函数
    /// 4byte的虚表指针式不可少的
    /// </summary>
    Font f; 

}
/// <summary>
/// 36bytes * 100000=3600000bytes =3600k=3.6mb
/// </summary>
public class App
{
    static void Main()
    {
        List<Charator> list=new List<Charator>(100000);
        for (int i = 0; i < list.Count; i++)
        {
            Charator charator = new Charator();
            list.Add(charator);
        }
    }
}
```

上面的代码执行会带来3mb多的内存数据，这个对于现在的机器来说算不了什么，上面例子中是做了100000次的计算，那如果再加两个数量级到10000000又会怎么样了，那就会有300多mb，这个数字肯定是不能接受的，那么这个时候就要考虑用享元模式了。 看下面改进后的代码：

```
public class Font
{
    string _fontName;
    int _size;
    Color _color;
    public Font(string name, int size, Color color)
    {
        _fontName = name;
        _size = size;
        _color = color;
    }
}

public class Charator
{
    private static Hashtable fontTable=new Hashtable();
    public char C { get; set; }
    public Font CFont { get; set; }

    public Font GetFont(string name)
    {
        if (!fontTable.ContainsKey(name))
        {
            fontTable.Add(name, new Font(name, 8, Color.Red));
        }
        return (Font)fontTable[name];
    }
}
public class App
{
    static void Main()
    {
        List<Charator> list = new List<Charator>(100000);
        for (int i = 0; i < list.Count; i++)
        {
            Charator charator = new Charator();
            charator.C = 'a';
            charator.CFont = charator.GetFont("宋体");
            list.Add(charator);
        }
    }
}
```

上面的代码主要是在GetFont方法中进行了判断，如果对象不存在才创建新的实例，否则直接返回存储在HashTable中的对象。下面来看下享元模式的结构图：

![2010-12-29_124714](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290618198.png)

针对上面结构的完整代码：

```
/// <summary>
/// 享元的抽象类
/// </summary>
public abstract class Flyweight
{
    public abstract void Operation(int extrinsicState);
}
/// <summary>
/// 需要共享的具体类
/// </summary>
public class ConceteFlyweight : Flyweight
{
    public override void Operation(int extrinsicState)
    {
        Console.WriteLine("需要共享的具体Flyweight类：" + extrinsicState);
    }
}
/// <summary>
/// 不需要共享的具体类
/// </summary>
public class UnsharedConcreteFlyeight : Flyweight
{
    public override void Operation(int extrinsicState)
    {
        Console.WriteLine("不需要共享的具体Flyweight类：" + extrinsicState);
    }
}
/// <summary>
/// 一个工厂类，用来合理创建对象
/// </summary>
public class FlyweightFactory
{
    private Dictionary<string, Flyweight> dic = 
new Dictionary<string, Flyweight>();
    public Flyweight GetFlyweight(string key,bool type)
    {
        if (!dic.ContainsKey(key))
        {
            Flyweight flyweight = new UnsharedConcreteFlyeight();
            if (type)
                flyweight = new ConceteFlyweight();
            dic.Add(key, flyweight);
        }
        return (Flyweight)dic[key];
    }
}
/// <summary>
/// 客户端调用
/// </summary>
public class App
{
    static void Main()
    {
        int extrinsicState = 26;
        FlyweightFactory factory = new FlyweightFactory();
        Flyweight f1 = factory.GetFlyweight("oec2003", true);
        f1.Operation(++extrinsicState);
        Flyweight f2 = factory.GetFlyweight("oec2003", true);
        f2.Operation(++extrinsicState);
        Flyweight f3 = factory.GetFlyweight("oec2004", false);
        f3.Operation(++extrinsicState);
    }
}
```

## Flyweight模式的几个要点

* 面向对象很好地解决了抽象性的问题，但是作为一个运行在机器中的程序实体，我们需要考虑对象的代价问题。Flyweight设计模式主要解决面向对象的代价问题，一般不触及面向对象的抽象性问题。
* Flyweight采用对象共享的做法来降低系统中对象的个数，从而降低细粒度对象给系统带来的内存压力。在具体实现方面，要注意对象状态的处理。
* 对象的数量太大从而导致对象内存开销加大——什么样的数量才算大—这需要我们仔细的根据具体应用情况进行评估，而不能凭空臆断。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

