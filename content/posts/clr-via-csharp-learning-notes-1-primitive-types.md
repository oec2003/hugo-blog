---
title: CLR Via C# 学习笔记（1） 基元类型 值类型 引用类型
date: 2009-06-17
categories: [技术]
tags: [CLR via C#, DotNet]
---

> CLR Via C#》这本书以前就粗略看过两遍，但一直都没能深入理解，而且很多内容也忘记了，现在准备重新看一遍，并将看过的部分写出来，因为写的过程也是一个加深理解的过程。本系列算是学习的一个记录吧，也可以方便以后自己查阅，如果对大家还有些帮助的话，我就很高兴了。书我是选择性的看的，所以顺序和书中的顺序可能不一样。

首先了解下什么是基元类型，基元类型是编译器直接支持的数据类型，像我们平时经常用到的int string bool 都是基元类型，基元类型是映射到FCL中的类型，像前面的三种类型对应到FCL中就是Int32 String Boolean，基元类型只是给我们的编程提供了方便，它和FCL中的类型在编译后最终生成的IL完全相同。下面给出基元类型和FCL类型的对应表

|C#基元类型 | FCL类型 | CLS相容 | 说明 |
| --- | --- | --- | --- |
| sbyte | System.Sbyte |  |  |
| byte | System.Byte  |  |  |
| short | System.Int16 |  |  |
| ushort | System.UInt16 |  |  |
| int | System.Int32 |  |  |
| uint | System.Uint32 |  |  |
| long | System.Int64 |  |  |
| ulong | System.Uint64 |  |  |
| char | System.Char |  |  |
| float | System.Single |  |  |
| double | System.Double |  |  |
| bool | System.Boolean |  |  |
| decimal | System.Decimal |  |  |
| object | System.Object |  |  |
| string | System.String |  |  |

我们平时在写程序时通常都是使用基元类型，因为方便，但本书的作者认为应该直接使用FCL中的类型，原因如下：

1. 在c#中long对应的FCL类型为System.Int64，但是在其他的语言中，如c++ 就将long视为一个Int32。这样习惯于一种编程语言的人在看另一种编程语言写的源码是就会产生错误的理解。
2. 在FCL中的许多的方法将类型名作为方法名的一部分，如System.Convert类提供ToBoolean,ToInt32,ToSingle等。这样在使用基元类型做类型转换时就感觉有点怪怪的，如：float val=Convert.ToSingle(“23”);

## 值类型和引用类型的区别

1. 所有的值类型都是从System.TypeValue派生，如Struct Enum都是值类型；所有引用类型都是从System.Object派生。
2. 值类型分配在线程堆栈上，引用类型分配在托管堆上。
3. 值类型表现形式有未装箱形式和已装箱形式，而引用类型总是已装箱形式。
4. 所有的值类型都是sealed类型，所以值类型不能作为任何类型的基类型，也不能在值类型中引入虚方法。
5. 创建一个引用类型变量时，会被初始化为null，试图使用一个null的引用类型变量时，会抛出NullReferenceException异常，也就是常见的“未将对象引用设置到对象的实例”；值类型在创建时所有成员都初始化为0了，所以不会抛出该异常。

## 原文例子表示值类型和引用类型的区别

```
class Program
{
    static void Main(string[] args)
    {
        SomeRef r1 = new SomeRef();
        SomeVal v1 = new SomeVal();
        r1.x = 5;
        v1.x = 5;
        Console.WriteLine(r1.x);    //5
        Console.WriteLine(v1.x);    //5
        SomeRef r2 = r1;
        SomeVal v2 = v1;
        r1.x = 8;
        v1.x = 9;
        Console.WriteLine(r1.x);    //8
        Console.WriteLine(r2.x);    //9
        Console.WriteLine(v1.x);    //9
        Console.WriteLine(v2.x);    //5
    }
}
class SomeRef
{
    public Int32 x;
}
struct SomeVal
{
    public Int32 x;
}
```

## CLR中类型字段布局的控制

为了提高性能，clr能按照所选择的任何方式来排列类型的字段。我们可以通过在类会是结构上使用System.Runtime.InteropServices.StructLayoutAttribute属性来改变这种排列的顺序。该属性接受一个LayoutKind的枚举值（Auto，Sequential，Explicit），默认情况下C#编译器会为类选择Atuo，为结构选择Sequential。下面来定义一个类和一个结构

```
struct SomeVal
{
    public String name;
    public Int32 id;

}

class SomeRel
{
    public String name;
    public Int32 id;
}
```

查看IL代码可以看到默认的排列顺序

![2010-12-30_100156](http://fwhyy.com/img/post/2010-12-30_100156.gif)

现在给类和结构加上属性，首引用加命名空间 using System.Runtime.InteropServices;

```
[StructLayout(LayoutKind.Auto)]
struct SomeVal
{
    public String name;
    public Int32 id;

}
[StructLayout(LayoutKind.Sequential)]
class SomeRel
{
    public String name;
    public Int32 id;
}
```

再查看IL可以看到顺序已经发生了变化。

![2010-12-30_100312](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290757963.gif)

C#编译器总是会默认给结构这样的值类型选择Sequential，是因为值类型会经常和非托管代码进行交互，字段必须保持和开发人员定义的一致。我们在编码过程中如果判断所创建的值类型不会与非托管代码进行交互，就可以像上面那样给创建的值类型添加[StructLayout(LayoutKind.Auto)] ，让其进行自动排列，以提高性能。

## 系列相关文章

CLR Via C# 学习笔记（1） 基元类型 值类型 引用类型
[CLR Via C# 学习笔记（2） 装箱和拆箱](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-2-boxing-and-unboxing/)
[CLR Via C# 学习笔记（3） 常量和字段（cosnt readonly）](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-3-constants-and-fields/)
[CLR Via C# 学习笔记（4） 方法 构造函数](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-5-methods-the-constructor/)
[CLR Via C# 学习笔记（5） 静态构造函数的性能](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-5-the-performance-of-the-static-constructor/)
[CLR Via C# 学习笔记（6） 方法参数相关（out ref params）](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-6-the-method-parameters-related/)

