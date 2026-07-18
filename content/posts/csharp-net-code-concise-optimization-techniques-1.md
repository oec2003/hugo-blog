---
title: C#/Net代码精简优化技巧（1）
date: 2010-10-21
categories: [技术]
tags: [C#, 小技巧]
---

在我们写代码的时候可以使用一些小的技巧来使代码变得更加简洁，易于维护和高效。下面介绍几种在C#/Net中非常有用的一些编程技巧。

## 空操作符（??）

在程序中经常会遇到对字符串或是对象判断null的操作，如果为null则给空值或是一个指定的值。通常我们会这样来处理

```
string name = value;
if (name == null)
{
    name = string.Empty;
}
```

可以使用三元操作符（?:）对上面对吗进行优化

```
string name = value == null ? string.Empty : value;
```

这样使代码简洁了不少，但这还不是最简洁的，我们还可以使用??操作符来进行进一步优化，??操作符意思是如果为null取操作符左边的值，否则取右边的值。

```
string name = value ?? string.Empty;
```

我们甚至可以写一个扩展方法来过滤掉null和空格，使返回的结果可以更好的使用??操作符

```
public static class StringUtility
{
    public static string TrimToNull(string source)
    {
        return string.IsNullOrWhiteSpace(source) ? null : source.Trim();
    }
}
```

使用代码如下：

```
string name = string.TrimToNull(value) ?? "None Specified";
```

## 使用As转换类型

在C#中进行类型转换有很多种方式比如可以进行强制类型转换，通常在转换前会使用Is进行类型的判断，所以您可能经常写过或见过类似下面的代码

```
if (employee is SalariedEmployee)
{
    var salEmp = (SalariedEmployee)employee;
    pay = salEmp.WeeklySalary;
    // ...
}
```

上面的代码不会报异常，但在整个过程中做了两次转换操作，这样会降低性能。我们可以使用as操作符来进行类型的转换，同样也不会报异常，如果类型不兼容则返回null，而是用as进行转换整个过程只转换一次。代码如下：

```
var salEmployee = employee as SalariedEmployee;
if (salEmployee != null)
{
    pay = salEmployee.WeeklySalary;
    // ...
}
```

## 自动属性

自动属性是C#3.0以上版本中的新功能，可以使代码变得更简洁，在以前定义属性我们会写如下代码

```
public class Point
{
    private int _x, _y;

    public int X
    {
        get { return _x; }
        set { _x = value; }
    }
    public int Y
    {
        get { return _y; }
        set { _y = value; }
    }
}
```

使用自动属性代码就会简洁了很多

```
public class Point
{
    public int X { get; set; }
    public int Y { get; set; }
}
```

在自动属性中，我们可以给get或set访问器设置访问级别，使属性变成只读属性或是只写属性

```
public class Asymetrical
{
    public string ThisIsReadOnly { get; private set; }
    public double ThisIsWriteOnly { private get; set; }
}
```

## StopWatch类

在程序开发中有时会需要统计一个方法或是一个存储过程执行了多长时间，比如在做一些方法的性能测试时就需要用到这用的时间统计功能，很自然想到的方法是在处理的方法前后各记录一个时间，然后计算时间差，如下

```
DateTime start = DateTime.Now;
SomeCodeToTime();
DateTime end = DateTime.Now;
Console.WriteLine("Method took {0} ms", (end - start).TotalMilliseconds);
```

尽管使用DateTime的时间差可以达到目的，但DateTime统计出来的时间差并不是很精确，想要精确我们可以使用Win32 API调用PInvoke，但是做法非常麻烦而且容易出错。

这时我们就需要使用StopWatch类了，使用这个类必须引用命名空间 System.Diagnostics

```
var timer = Stopwatch.StartNew();
SomeCodeToTime();
timer.Stop();
Console.WriteLine("Method took {0} ms", timer.ElapsedMilliseconds);
```

## 使用TimeSpan的静态方法

当我们需要在程序中设置一个时间间隔或是等待多长时间后再做下一步操作时，往往会写如下的代码：

```
Thread.Sleep(50);
```

上面代码中的参数50很明确是指50毫秒，这个是在定义方法的时候就定义好的类型，并不是很灵活，而且我们经常会使用int类型来定义传入的参数，类型下面的代码

```
void PerformRemoteWork(int timeout) { ... }
```

上面代码中的timeout是指秒、毫秒还是小时或天，这个就需要开发者自己去定义了，这样的代码在调用时就非常不明确，我们可以使用TimeSpan来解决这个问题

```
void PerformRemoteWork(TimeSpan timeout) { ... }
```

调用的代码

```
PerformRemoteWork(new TimeSpan(0, 0, 0, 0, 50));
```

这样的代码也让人看着很头疼，因为TimeSpan有5个构造函数的重载，如下

```
TimeSpan();
TimeSpan(long ticks);
TimeSpan(int hours, int minutes, int seconds);
TimeSpan(int days, int hours, int minutes, int seconds);
TimeSpan(int days, int hours, int minutes, int seconds, int milliseconds);
```

由于这些重载在调用时很容易让人混淆，而且写出的代码可读性也不是很好，像上面的50如果不是很熟悉TimeSpan构造函数的并不能一眼就看出是50毫秒。更好的方法是使用TimeSpan的静态方法

```
private static readonly TimeSpan _defaultTimeout=TimeSpan.FromSeconds(30);
```

上面的代码的调用也可以写成

```
PerformRemoteWork(TimeSpan.FromMilliseconds(50));
```

这样无论是在写程序时还是在阅读代码时都会感觉非常清楚明了。

## 总结

本文是参考一篇老外的博客写的，并不是直译，原文见下面链接。这几个小技巧并不是很复杂，但在实际编程中可以来来很大的好处。希望本文对大家有所帮助。

原文链接：[http://geekswithblogs.net/BlackRabbitCoder/archive/2010/08/26/c.net-five-little-wonders-that-make-code-better-1-of.aspx](http://geekswithblogs.net/BlackRabbitCoder/archive/2010/08/26/c.net-five-little-wonders-that-make-code-better-1-of.aspx)

C#/Net代码精简优化技巧（1）
[C#/Net代码精简优化技巧（2）](http://blog.fwhyy.com/2010/10/csharp-net-code-concise-optimization-techniques-2/)
[C#/Net代码精简优化技巧（3）](http://blog.fwhyy.com/2010/10/csharp-net-code-concise-optimization-techniques-1/)

