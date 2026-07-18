---
title: CLR Via C# 学习笔记（5） 静态构造函数的性能
date: 2009-07-08
categories: [技术]
tags: [AspNet, CLR via C#]
---

> CLR Via C#》这本书以前就粗略看过两遍，但一直都没能深入理解，而且很多内容也忘记了，现在准备重新看一遍，并将看过的部分写出来，因为写的过程也是一个加深理解的过程。本系列算是学习的一个记录吧，也可以方便以后自己查阅，如果对大家还有些帮助的话，我就很高兴了。书我是选择性的看的，所以顺序和书中的顺序可能不一样。

在上一篇《CLR Via C# 学习笔记（4） 方法 构造函数 》中讲到了一些静态构造函数方面的知识，现在也回顾一下，大概总结如下：

1. 静态构造函数是私有的（private） ，而且不能人为去修改访问修饰符。
2. 静态构造函数不应该去调用基类的静态构造函数，因为静态字段不会被继承到子类。
3. 静态构造函数在一个类型中有且仅有一个，并且是无参的。
4. 静态构造函数中只能初始化静态字段。

从上面的第一点可以知道静态构造函数都是private的，所以不能显示区进行调用，关于JIT何时会去生成调用静态构造函数的代码。存在着两种说法。通常被称为Precise和BeforeFieldInit。

1. Precise方式JIT编译器生成调用的时机：首次创建类型的代码之前；访问类的非继承字段或成员代码之前。
2. BeforeFieldInit方式JIT编译器生成调用的时机：在访问费继承静态字段代码之前。

这两种方式的主要区别就是选择调用静态构造函数的时机是否是确定的，Precise方式CLR会在确定的时刻调用静态构造函数，而BeforeFieldInit方式CLR可以自由选择调用静态构造函数的时机，利用这一点，CLR可以根据类型是否在程序域中加载来选择静态构造函数的调用次数，以便能生成执行更快的代码。

下面来看来个类分别展现了这两种方式

```
public classUserPrecise
{
    public static string_name = "内联赋值：oec2003";
    staticUserPrecise()
    {
        _name = "构造函数赋值：oec2003";
    }
}
public classUserBeforeFieldInit
{
    public static string_name = "内联赋值：oec2003";
}
```

通过IL代码可以看出在UserBeforeFieldInit 的元数据上有BeforeFieldInit的标记，如下图：

![2010-12-29_173428](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290802573.gif)

既然上面提到BeforeFieldInit方式CLR可以选择调用构造函数的次数从而来生成执行更快的代码，下面就写一段测试代码来看看究竟怎样。

```c#
public sealed class Program
{
    static void Main(string[] args)
    {
        const Int32 iterations = 1000 * 1000 * 1000;
        Test1(iterations);
        Test2(iterations);
    }

    private static void Test1(Int32 iterations)
    {
        Stopwatch sw = Stopwatch.StartNew();
        for (Int32 i = 0; i < iterations; i++)
        {
            UserBeforeFieldInit._name = "oec2003";
        }
        Console.WriteLine("Test1-UserBeforeFieldInit 用时：" + sw.Elapsed);

        sw = Stopwatch.StartNew();
        for (Int32 j = 0; j < iterations; j++)
        {
            UserPrecise._name = "oec2003";
        }
        Console.WriteLine("Test1-UserPrecise 用时：" + sw.Elapsed);
    }

    private static void Test2(Int32 iterations)
    {
        Stopwatch sw = Stopwatch.StartNew();
        for (Int32 i = 0; i < iterations; i++)
        {
            UserBeforeFieldInit._name = "oec2003";
        }
        Console.WriteLine("Test2-UserBeforeFieldInit 用时：" + sw.Elapsed);

        sw = Stopwatch.StartNew();
        for (Int32 j = 0; j < iterations; j++)
        {
            UserPrecise._name = "oec2003";
        }
        Console.WriteLine("Test2-UserPrecise 用时：" + sw.Elapsed);
    }
}

public class UserBeforeFieldInit
{
    public static string _name;
}

public class UserPrecise
{
    public static string _name;

    static UserPrecise()
    {
        _name = "oec2003";
    }
}
```

测试结果如下：

![2010-12-29_173503](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290802240.gif)

从上面结果来看，BeforeFieldInit方式的执行速度还是要快很多，但为什么第二次执行时，两种方式的速度差不多呢?因为经过第一次执行后JIT编译器知道类型的构造器已经被调用了，所以第二次执行时不会显示对构造函数进行调用。

## 系列相关文章

[CLR Via C# 学习笔记（1） 基元类型 值类型 引用类型](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-1-primitive-types/)
[CLR Via C# 学习笔记（2） 装箱和拆箱](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-2-boxing-and-unboxing/)
[CLR Via C# 学习笔记（3） 常量和字段（cosnt readonly）](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-3-constants-and-fields/)
[CLR Via C# 学习笔记（4） 方法 构造函数](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-5-methods-the-constructor/)
CLR Via C# 学习笔记（5） 静态构造函数的性能
[CLR Via C# 学习笔记（6） 方法参数相关（out ref params）](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-6-the-method-parameters-related/)



