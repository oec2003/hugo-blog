---
title: CLR Via C# 学习笔记（6） 方法参数相关（out ref params）
date: 2009-07-16
categories: [技术]
tags: [CLR via C#, DotNet]
---

> CLR Via C#》这本书以前就粗略看过两遍，但一直都没能深入理解，而且很多内容也忘记了，现在准备重新看一遍，并将看过的部分写出来，因为写的过程也是一个加深理解的过程。本系列算是学习的一个记录吧，也可以方便以后自己查阅，如果对大家还有些帮助的话，我就很高兴了。书我是选择性的看的，所以顺序和书中的顺序可能不一样。

通常我们在使用方法的时候，方法的参数是按值传递的，如果传递的参数是引用类型的对象，是将引用对象的地址传给方法。如果传递的是值类型实例，传递给方法的是该实例的一个副本。允许使用在方法中按引用来传递参数，C#中使用out和ref关键字来体现。下面就来介绍out和ref的使用。

## out

1 使用out时在方法的参数定义和方法的调用时都要用out关键字，如下：

```
static void Main(string[] args)
{
    string name = string.Empty;
    GetStr(out name); //调用时加out
    Console.WriteLine(name);
}
private static void GetStr(out string name) //方法参数定义时的out
{
    name = "oec2003";
}
```

2 如果一个方法有out修饰的参数，在方法结束前必须给给参数赋值，否则不能通过编译，代码如下：

```
static void Main(string[] args)
{
    string name = "oec2003";
    GetStr(out name);
    Console.WriteLine(name);
}
private static void GetStr(out string name)
{
    //没有给name赋值，编译时会出现“控制离开当前方法之前必须对
    //out 参数“name”赋值”异常
}
```

3 在调用有out参数的方法时，没有必要给out参数赋初始值，因为赋的值不会传递到方法的内部，如果在方法的内部要强行使用out参数会有编译错误。代码如下：

```
static void Main(string[] args)
{
    //给out参数name赋初始值oec2003
    string name = "oec2003";
    GetStr(out name);
    Console.WriteLine(name);
}
private static void GetStr(out string name)
{
    name = "hello" + name;
    //name在调用前虽赋值为oec2003 ，
    //但此处会报错“使用了未赋值的 out 参数name”
}
```

4 通常我们需要在一个方法中返回多个值的时候就可以使用out参数。

5 如果两个方法的参数个数和类型都相同，区别只是其中一个为out参数，那么这两个方法是可以进行重载的，下面的代码可以正常运行。

```
private static void GetStr(out string name)
{
    name = "oec2003";
}
private static void GetStr(string name)
{
    name = "oec2003";
}
```

## ref

1 和out参数一样，使用ref时在方法的参数定义和方法的调用时都要用ref关键字。

2 如果调用方法前，ref参数没有赋初始值，不能通过编译，看如下代码：

```
static void Main(string[] args)
{
    string name;
    GetStr(ref name); //如果name没有赋值不能通过编译
    Console.WriteLine(name);
}
private static void GetStr(ref string name)
{
    name = "oec2003";
}
```

3 和out不同的是ref参数的值可以传入方法内进行操作。

```
static void Main(string[] args)
{
    string name="oec2003";
    GetStr(ref name);
    Console.WriteLine(name);//返回：hello oec2003
}
private static void GetStr(ref string name)
{
    name = "hello " + name;
}
```

4 因为ref在传入方法时会有初始值，所以在方法的内部可以不对ref参数进行任何的操作，那样ref参数的值不会改变。

```
static void Main(string[] args)
{
    string name="oec2003";
    GetStr(ref name);
    Console.WriteLine(name);//在方法中没有操作，仍然返回oec2003
}
private static void GetStr(ref string name)
{

}
```

5 同out参数一样，如果两个方法的参数个数和类型都一样，仅有的区别只是其中之一的参数为ref参数，两个可以进行重载。

对于CLR来说，关键字out和关键字ref是等价的，就是说无论使用的out还是ref，都会生成相同的IL代码，正因为如此，如果两个方法的差异仅仅是out和ref的差异，那么这两个方法是不能进行重载的，如下代码：

```
//下面代码编译会报“不能定义仅在 ref 和 out 上有差别的重载方法”异常
private static void GetStr(ref string name)
{
    name = "oec2003";
}
private static void GetStr(out string name)
{
    name = "oec2003";
}
```

## 可变数量的参数

有些时候如果一个方法的参数数量可以根据用户的需要而进行变动，那将会带来很大的方便。像String类型的Concat、Format等方法就提供了可变参数。可以变参数在C#中使用params来定义，如下面代码：

```
static void Main(string[] args)
{
    Console.WriteLine(Add(1,2,3,4));
}
public static int Add(params int[] num)
{
    int sum = 0;
    foreach (int i in num)
    {
        sum += i;
    }
    return sum;
}
```

使用可变参数非常简单，需要注意的是可变参数的类型一定要是数组类型。可变参数虽然很好用，但是接受可变参数的方法在调用时会导致一些性能损失，以为数组对象必须分配在堆上，数组的内存最终需要GC来回收。为了避免这种性能的损耗，我们在写方法的时候可以多定义几个没有params关键字的方法的重载，这样只有在很特殊的情况下才会使用有params关键字的方法。C#中的一些类的方法也是这么做的，如下图：

![2010-12-29_165108](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290806458.gif)

## 方法的参数类型

声明方法参数类型时，应尽可能只用弱的类型，例如如果要编写一个操作一组数据项的方法，最好使用接口（如Ienumerable）来定义方法参数的类型，而不要使用一些强的数据类型如List或是一些强的接口类型（如Ilist或Icollection），如下：

```
//使用的弱类型参数
private void OperateCollection<T>(IEnumerable<T> collection)
{ 

}
//使用的强类型参数
private void OperateCollection<T>(List<T> collection)
{

}
```

此处所指的强类型和弱类型，可以理解为类型的层次，如果说父类的层次高于子类，那么层次越高就类型越弱。Iemumerable接口直接在 System.Collections 命名空间下，是其他一些集合类和接口（如Icollection IList List等）的基类，所以定义参数为IEnumerable 类型的，凡是继承了IEnumerable 的类型的参数都能够传入方法，大大提高了灵活性。

## 系列相关文章

[CLR Via C# 学习笔记（1） 基元类型 值类型 引用类型](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-1-primitive-types/)
[CLR Via C# 学习笔记（2） 装箱和拆箱](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-2-boxing-and-unboxing/)
[CLR Via C# 学习笔记（3） 常量和字段（cosnt readonly）](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-3-constants-and-fields/)
[CLR Via C# 学习笔记（4） 方法 构造函数](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-5-methods-the-constructor/)
CLR Via C# 学习笔记（5） 静态构造函数的性能
[CLR Via C# 学习笔记（6） 方法参数相关（out ref params）](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-6-the-method-parameters-related/)

