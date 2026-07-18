---
title: CLR Via C# 学习笔记（2） 装箱和拆箱
date: 2009-06-18
categories: [技术]
tags: [CLR via C#, DotNet]
---

> CLR Via C#》这本书以前就粗略看过两遍，但一直都没能深入理解，而且很多内容也忘记了，现在准备重新看一遍，并将看过的部分写出来，因为写的过程也是一个加深理解的过程。本系列算是学习的一个记录吧，也可以方便以后自己查阅，如果对大家还有些帮助的话，我就很高兴了。书我是选择性的看的，所以顺序和书中的顺序可能不一样。

装箱和拆箱是已经被嚼烂的两个概念了，并且在一些面试中也经常考到。

1. 装箱：将值类型转换为引用类型。
2. 拆箱：将引用类型转换为值类型。

值类型是一种相对轻型的类型，不像对象那样在托管堆中分配，也不会被GC，不通过指针来引用，不过在有些时候需要获取对值类型的引用，例如在使用net1.0的集合类ArrayList的时候。

```c#
class Program
{
    static void Main(string[] args)
    {
        ArrayList list = new ArrayList();
        Point p;                        //因Point为值类型，分配在堆栈中
        for (int i = 0; i < 100; i++)
        {
            p.x = p.y = i;              //初始化Point中的成员
            list.Add(p);                //对p进行装箱后，将引用添加到list中
        }
    }
}
struct Point
{
    public Int32 x;
    public Int32 y;
}
```

ArrayList的Add方法是接受一个Object参数，如下

```c#
public virtual int Add(object value);
```

所以在执行Add方法时会将Point值类型转换为一个堆得托管对象，并获取到这个对象的引用，将引用地址存储在ArrayList中。

在一个值类型装箱的时候内部发生的事情：

1. 在托管堆分配好内存。分配的内存是值类型的各个字段所需内存量加上托管堆上的两个额外成员（类型对象指针和同步索引块）所需的内存量。
2. 值类型中的字段值复制到新分配的堆内存中。
3. 返回对象的引用地址。

拆箱就是执行和装箱相反的操作，将引用类型转化为值类型。接上面的代码，获取ArrayList中的元素值用如下代码：

```c#
for (int j = 0; j < 10; j++)
{
    Point point =(Point)list[j];
    Console.WriteLine("X:" + point.x + " Y:" + point.y);
}
```

上面的代码中通过索引取到ArrayList中存储的各个Point的引用地址，通过Point类型转换将其对应的值从堆中复制到Point的实例point中，这个转换的过程就是拆箱的过程。

在拆箱的过程中要注意以下两点：

1. 如果对已装箱的值类型的引用的变量为null，会引发NullRefreenceException异常
2. 如果一个引用指向的对象在拆箱时不是用的装箱时所使用的类型，将会引发InvalidCastException异常。代码如下：

```c#
static void Main(string[] args)
{
    Int32 x = 5;
    Object o = x;
    Int16 y = (Int16)o;    //引发InvalidCastException异常
}
```

正确的做法是，现将其用Int32类型来拆箱，然后再强制转换为Int16

```c#
static void Main(string[] args)
{
    Int32 x = 5;
    Object o = x;
    Int16 y = (Int16)(Int32)o;
}
```

下面来看两段程序来深入理解下装箱和拆箱

代码一：

```c#
static void Main(string[] args)
{
    Int32 x = 5;
    Object o = x;
    x = 123;

    Console.WriteLine(x + ",  " + (Int32)o);
}
```

上面的代码中有多少次装箱呢？乍一看好像就一次（Object o=x；），其实一共有三次装箱，看看IL代码就一目了然了。

![2010-12-29_183611](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290812484.gif)

程序的执行步骤：

1 创建一个Int32的未装箱的值类型实例x，并初始化为5.

2 创建Object类型的变量o，并指向x。由于引用类型的变量必须要执行堆中的对象，所以要对x进行装箱（第一次装箱），并将x在堆中的引用地址存储在o中。

3 将值123赋给未装箱的值类型实例x中。

4 调用WriteLine方法，WriteLine方法的参数值类型为String，现在WriteLine方法存在三个数据项，值类型x、string类型“，”和一个已装箱的Int32类型实例的引用o，这三个数据项必须要合并成一个string对象才能被调用。

5 调用String对象的静态方法Concat，Concat方法有9个重载，根据那三个数据项会选择下面方法执行。

![2010-12-29_183654](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290812137.gif)

6 第一个参数arg0传入的是x ，参数类型为object，所以要对x进行装箱（第二次装箱），将引用地址传给arg0，arg1传入的是字符串“，”，字符串就是引用类型，直接传引用地址，arg2传入的是将o拆箱然后再装箱（第三次装箱）的引用地址传入。

上面代码中的WriteLine方法如果直接写成Console.WriteLine(x + “, ” + o);将会有跟高的相率，因为o本身就是Object类型，在Concat的时候不用进行装箱拆箱。

代码二：看看这段程序发生了几次装箱

```
static void Main(string[] args)
{
    Int32 x = 5;
    Object o=x;
    x=123;
    Console.WriteLine(x);
    x = (Int32)o;
    Console.WriteLine(x);
    Console.WriteLine(o);
}
```

上面的代码只发生了一次装箱，因为WriteLine方法的重载版本中参数类型可以为Objet或是Int32，在调用WriteLine方法是并没有装箱，唯一的一次装箱是Object o=x;。

代码三：

```
static void Main(string[] args)
{
    Int32 x = 5;
    CheckRef(x, x);  //输出不同引用
}

static void CheckRef(object obj1, object obj2)
{
    if (obj1 == obj2)
    Console.WriteLine("相同引用");
    else
    Console.WriteLine("不同引用");
}
```

执行上面代码将发生两次装箱，因为CheckRef方法的两个参数都是Object类型，传入的都是值类型的实例，可以讲代

码改进下，先将x转换成Object类型再传入方法，如下:

```
static void Main(string[] args)
{
    Int32 x = 5;
    Object o = x;
    CheckRef(o,o);  //输出相同引用
}

static void CheckRef(object obj1, object obj2)
{
    if (obj1 == obj2)
    Console.WriteLine("相同引用");
    else
    Console.WriteLine("不同引用");
}
```

改进后只进行一次装箱操作了，效率提高了，但是会发现运行的结果也发生了变化，所以这种做法在有些时候是很危险的。

装箱拆箱操作极大的破环程序的性能，不过在Net2.0中提供了泛型集合类，所以完全可以用List<T> 和Dictionary<Tkey,Tvalue> 来代替 原来1.0中的ArrayList和HashTable，即使是List<Object>也会比ArrayList的性能要好。

## 系列相关文章

[CLR Via C# 学习笔记（1） 基元类型 值类型 引用类型](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-1-primitive-types/)
CLR Via C# 学习笔记（2） 装箱和拆箱
[CLR Via C# 学习笔记（3） 常量和字段（cosnt readonly）](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-3-constants-and-fields/)
[CLR Via C# 学习笔记（4） 方法 构造函数](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-5-methods-the-constructor/)
[CLR Via C# 学习笔记（5） 静态构造函数的性能](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-5-the-performance-of-the-static-constructor/)
[CLR Via C# 学习笔记（6） 方法参数相关（out ref params）](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-6-the-method-parameters-related/)

