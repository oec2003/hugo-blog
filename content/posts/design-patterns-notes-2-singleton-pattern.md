---
title: 设计模式笔记(2)—单件模式（创建型）
date: 2009-11-19
categories: [技术]
tags: [C#,设计模式]
---

## Gof 定义

保证一个类仅有一个实例，并提供一个该实例的全局访问点。

## 动机

保证在系统中只存在一个实例，这样才能保证逻辑的正确性和良好的效率。

## 单件模式单线程环境下实现

看下面一段代码：

```
public class Singleton
{
    private static Singleton _instance;
    //定义为私有，让类的使用者不能直接new一个该类的实例
    private Singleton() { }
    public static Singleton Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = new Singleton();
            }
            return _instance;
        }
    }
}
```

上面的代码中将Singleton类的构造函数设置为私有，如果试图去用new去创建一个Singleton的实例，会出现编译错误

```
public class Test
{
    public static void Main()
    {
        //Singleton不可访问，因为他受保护级别限制
        Singleton t = new Singleton();
    }
}
```

要创建Singleton的实例我们可以像下面这样做

```
public class Test
{
    public static void Main()
    {
        Singleton t = Singleton.Instance;
    }
}
```

上面的代码完成了一个最简单的单例模式的实现，保证了实例的唯一性，如下的测试代码是可以顺利通过的

```
[TestMethod()]
public void Test()
{
    Singleton t1 = Singleton.Instance;
    Singleton t2 = Singleton.Instance;

    Assert.AreEqual(true, t1.Equals(t2));
}
```

## 单件模式多线程环境下实现

在多线程环境下上面代码仍然有可能得到Singleton类的多个对象实例，为什么在多线程环境下会可能创建出多个实例呢？看下面代码：

```
public class Singleton
{
    private static Singleton _instance;
    //定义为私有，让类的使用者不能直接new一个该类的实例
    private Singleton() { }
    public static Singleton Instance
    {
        get
        {
           //线程A执行到此进行if判断，会进入到if语句里面
            //在线程A执行_instance = new Singleton(); 前，线程B也到了if判断处，
            //此时_instance还没有被创建出来仍然为null，线程B也会进入到if语句中
            //这样线程A和线程B会各自构建一个Singleton的实例
            if (_instance == null)
            {
                _instance = new Singleton();
            }
            return _instance;
        }
    }
}
```

所以上面的代码示例只能应用在单线程的环境下，如果需要实现在多线程环境下的单件模式就需要对上面的代码进行改进，如下

```
public class Singleton
{
    private static volatile Singleton _instance;
    //一个辅助性的对象
    private static object _lockHelper = new object();
    //定义为私有，让类的使用者不能直接new一个该类的实例
    private Singleton() { }
    public static Singleton Instance
    {
        get
        {
            if (_instance == null)
            {
                lock (_lockHelper)
                {
                    if (_instance == null)
                    {
                        _instance = new Singleton();
                    }
                }
            }
            return _instance;
        }
    }
}
```

上面代码和前面的代码相比，在声明_instance时多了[volatile](http://msdn.microsoft.com/zh-cn/library/x13ttww7(VS.80).aspx)关键字，添加了一个辅助对象
_lockHelper ,_lockHelper 其实没有什么实际的意义，仅供[lock](http://msdn.microsoft.com/zh-cn/library/c5kehkcz(VS.80).aspx)使用。
volatile在msdn中的解释如下
> volatile 关键字表示字段可能被多个并发执行线程修改。声明为 volatile 的字段不受编译器优化（假定由单个线程访问）的限制。这样可以确保该字段在任何时间呈现的都是最新的值。

## 单件模式静态构造函数实现

上面分别说了单件模式在单线程和多线程的实现，下面介绍一种简单的方法，可以同时满足这两种，使用静态构造函数来实现。静态构造函数只在静态字段初始化之前初始化，就是说我们在访问访问静态字段会先访问静态构造函数。静态构造函数可以保证多线程中只有一个线程执行该静态构造函数，关于Net中静态构造函数机制可以参考[CLR Via C# 学习笔记（5） 静态构造函数的性能](http://blog.fwhyy.com/posts/79)

```
public class Singleton
{
    public static readonly Singleton _Instance = new Singleton();
    private Singleton() { }
}
```

上面的代码等同于

```
public class Singleton
{
    public static readonly Singleton _Instance;
    static Singleton()
    {
        _Instance = new Singleton();
    }
    private Singleton() { }
}
```

上面的方式虽然非常简单，但是不支持构造函数接受参数，因为在Net中静态构造函数不允许有参数。所以这种方式只适用于没有参数的情况下。而前面提到的单线程和多线程的那两种方式只要稍加改动就能支持传参，下面的代码是改进后的单线程下的单件模式，多线程和单线程类似

```
public class Singleton
{
    public static Singleton _instance;
    private Int32 _x;
    private Int32 _y;
    //私有构造函数中对_x _y 赋值
    private Singleton(Int32 x, Int32 y)
    {
        _x = x;
        _y = y;
    }
    //此处不能使用属性了 ，因为有参数所以改成了一个静态方法
    public static Singleton GetInstance(Int32 x, Int32 y)
    {
        if (_instance == null)
        {
            _instance = new Singleton(x, y);
        }
        return _instance;
    }
}
```

不过在静态构造函数实现的方法中仍然可以通过一些其他的手段来达到参数的目的，如下：

```
public class Singleton
{
    public static readonly Singleton _Instance;
    static Singleton()
    {
        _Instance = new Singleton();
    }
    private Singleton() { }
    //添加属性，在调用的时候直接给属性赋值
    public Int32 X
    {
        get { return _x; }
        set { _x = value; }
    }

    public Int32 Y
    {
        get { return _y; }
        set { _y = value; }
    }
    private Int32 _x;
    private Int32 _y;
}
```

调用代码：

```
public class Test
{
    public static void Main()
    {
        Singleton t = Singleton._Instance ;
        t.X = 100;
        t.Y = 200;
    }
}
```

Singleton模式的几个要点：

* Singleton模式中的实例构造器可以设置为protected以允许子类派生。
* Singleton模式一般不要支持ICloneable接口，因为可能会导致多个对象实例。
* Singleton模式一般不要支持序列化，因为也可能导致多个实例。
* Singleton模式只考虑到对象创建的管理，没有考虑到对象销毁的管理，对支持垃圾回收的平台来讲，没有必要对销毁进行特殊的管理。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

