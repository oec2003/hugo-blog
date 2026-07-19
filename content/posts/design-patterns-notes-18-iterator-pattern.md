---
title: 设计模式笔记(18)—迭代器模式（行为型）
date: 2010-01-24
categories: [技术]
tags:  [C#,设计模式]
---

## Gof定义

提供一种方法顺序访问一个聚合对象中的各个元素， 而又不暴露该对象的内部表示。

## 动机

在软件构建过程中，集合对象内部结构常常变化各异。但对于这些集合对象，我们希望在不暴露其内部结构的同时，可以让外部客户代码透明地访问其中包含的元素；同时这种“透明遍历”也为“同一种算法在多种集合对象上进行操作”提供了可能。使用面向对象技术将这种遍历机制抽象为“迭代器对象”为“应对变化中的集合对象”提供了一种优雅的方式。
<!--more-->

迭代器模式结构图：

![2010-12-29_113434](https://img.fwhyy.com/2022/202201290615826.webp)

* Aggregate:集合结构接口
* Iterator:迭代器接口
* Concreteaggregate:集合结构的具体类，继承Aggregate接口
* ConcreteIteator:具体的迭代器类

代码实现：

```
/// <summary>
/// 集合结构接口
/// </summary>
public interface Aggregate
{
    Iterator CreateIterator();
}
/// <summary>
/// 迭代器接口
/// </summary>
public interface Iterator
{
    object First();
    object Next();
    bool IsDone();
    object CurrentItem();
}
/// <summary>
/// 集合结构的具体类
/// </summary>
class ConcreteAggregate : Aggregate
{
    private List<object> items = new List<object>();
    public Iterator CreateIterator()
    {
        return new ConcreteIterator(this);
    }
    public int Count
    {
        get { return items.Count; }
    }
    public object this[int index]
    {
        get { return items[index]; }
        set { items.Insert(index, value); }
    }
}
/// <summary>
/// 具体的迭代器类
/// </summary>
class ConcreteIterator : Iterator
{
    private ConcreteAggregate _aggregate;
    private int _current = 0;
    public ConcreteIterator(ConcreteAggregate aggregate)
    {
        this._aggregate = aggregate;
    }
    public object First()
    {
        return _aggregate[0];
    }
    public object Next()
    {
        object r = null;
        _current++;
        if (_current < _aggregate.Count)
        {
            r = _aggregate[_current];
        }
        return r;
    }
    public bool IsDone()
    {
        return _current >= _aggregate.Count ? true : false;
    }
    public object CurrentItem()
    {
        return _aggregate[_current];
    }
}
/// <summary>
/// 客户端调用
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        ConcreteAggregate ca = new ConcreteAggregate();
        ca[0] = "AspNet3.5 揭秘";
        ca[0] = "重构：改善既有代码的设计";
        ca[2] = "设计模式";
        ca[3] = "人月神话";
        ca[4] = "代码大全2";
        Iterator i = new ConcreteIterator(ca);
        while (!i.IsDone())
        {
            Console.WriteLine("要读的书:" + i.CurrentItem());
            i.Next();
        }
    }
}
```

上面的代码是根据结构图实现的基础代码，在设计的运用中可以使用Net框架给我们提供的相关接口IEnumerable和IEnumerator，这两个接口在Net中的实现代码如下：

```
public interface IEnumerable
{
    IEmumerator GetEnumerator();
}
public interface IEmumerator
{
    Object Current { get; }
    bool MoveNext();
    void Reset();
}
```

在Net中List实现了IEnumerable接口，下面的代码将List作为数据的容器来实现遍历：

```
class Program
{
    static void Main(string[] args)
    {
        List<string> list = new List<string>
        {
            "AspNet3.5 揭秘","重构：改善既有代码的设计","设计模式",
            "人月神话","代码大全2"
        };

        IEnumerator i = list.GetEnumerator();
        while (i.MoveNext())
        {
            Console.WriteLine("要读的书：" + i.Current);
        }
    }
}
```

上面的代码中试调用List的GetEnumerator方法返回IEmumerator类型的集合，然后取遍历，这样仍然显得比较麻烦，其实在Net中foreach已经实现了这样的功能，代码如下：

```
class Program
{
    static void Main(string[] args)
    {
        List<string> list = new List<string>
        {
            "AspNet3.5 揭秘","重构：改善既有代码的设计","设计模式",
            "人月神话","代码大全2"
        };
        foreach (string s in list)
        {
            Console.WriteLine("要读的书：" + s);
        }
    }
}
```

可以看出foreach其实就是实现了下面这段代码

```
IEnumerator i = list.GetEnumerator();
while (i.MoveNext())
{
    Console.WriteLine("要读的书：" + i.Current);
}
```

## Iterator模式的几个要点

* 迭代抽象：访问一个聚合对象的内容而无需暴露它的内部表示。
* 迭代多态：为遍历不同的集合结构提供一个统一的接口，从而支持同样的算法在不同的集合结构上进行操作。
* 迭代器的健壮性考虑：遍历的同时更改迭代器所在的集合结构，会导致问题。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

