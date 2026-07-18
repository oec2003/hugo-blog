---
title: Net4.0—Framwork新增特性
date: 2010-05-26
categories: [技术]
tags: [DotNet4 ]
---

## 1 BigInteger

BigInteger是Net4.0种System.Numerics命名空间下的一个新类，表示任意大小的带符号整数。像以前版本中的Int32，int64等这些都有MinValue和MaxValue属性，也就是说有大小的限制，而BigInteger没有大小的限制，所以理论上来说大数字足够大时可能会出现OutOfMemoryException异常。

以一个例子来看看BigInteger，下面的例子是一个计算斐波那契的函数：

```
public static int Fibonacci(int x)
{
    var preValue = -1;
    var curValue = 1;
    for (int i = 0; i <= x; ++i)
    {
        var sum = preValue + curValue;
        preValue = curValue;
        curValue = sum;
    }
    return curValue;
}
```

上面的代码当x的值为47的时候就会出现溢出，结果如下图：

![2010-05-26_105558](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300729455.png)

现在修改代码，使用BigInteger，代码如下：

```
public static BigInteger Fibonacci(int x)
{
    var preValue = new BigInteger(-1);
    var curValue = new BigInteger(1);
    for (int i = 0; i <= x; ++i)
    {
        var sum = preValue + curValue;
        preValue = curValue;
        curValue = sum;
    }
    return curValue;
}
```

再次将x赋值为47，运行结果如下图：

![2010-05-26_111127](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300729877.png)

## 2 Complex

Complex通BigInteger一样也是在System.Numerics命名空间下。简单说就是一个计算复数的类。看下面例子

```
private static void ComplexDemo()
{
    var z1 = new Complex(3, 4);
    var z2 = new Complex(5, 6);

    var r1 = Complex.Add(z1, z2);
    var r2 = Complex.Subtract(z1, z2);
    var r3 = Complex.Multiply(z1, z2);
    var r4 = Complex.Divide(z1, z2);

    Console.WriteLine("Z1+Z2 :" + r1);
    Console.WriteLine("Z1-Z2 :" + r2);
    Console.WriteLine("Z1*Z2 :" + r3);
    Console.WriteLine("Z1/Z2 :" + r4);
}
```

运行结果如下图：

![2010-05-26_104753](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300730444.png)

## 3 Tuple

Tuple可以定义很多复杂的信息，实现各种灵活的格式定义。

创建单一数据类型的集合

```
var a = Tuple.Create(2, 3, 4, 5);
var b = Tuple.Create("oec2003", "oec2004", "oec2005");
```

创建复杂类型的集合

```
public static Tuple<int, string, Uri, DateTime> GetInfo()
{
    return Tuple.Create<int, string, Uri, DateTime>(27,"oec2003",new
        Uri("http://oec2003.cn"),DateTime.Now);
}
```

## 4 SortedSet<T>

SortedSet<T>是一个可以自排序的存储数据的集合。一个简单的例子是初始化为一个无序的整数集合，然后顺序输出时是已经排过序的，如下：

```
public static void SortedSetDemo()
{
    int count = 0;
    var set1 = new SortedSet<int>() { 1,5,3,9,4,6};
    foreach (int i in set1)
    {
        count++;
        Console.Write(i);
        if (count != set1.Count) Console.Write(",");
    }
}
```

![2010-05-26_115923](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300730256.png)

除了自排序外，还可以求出集合的最大值、最小值和制定范围的集合，看下面例子：

```
public static void SortedSetDemo()
{
    var set1 = new SortedSet<int>() { 8, 5, 3, 9, 4, 6 };
    Console.WriteLine("MixValue:" + set1.Min);
    Console.WriteLine("MaxValue:" + set1.Max);
    Console.Write("SubSet:");
    var subSet = set1.GetViewBetween(5, 9);
    int count = 0;
    foreach (int i in subSet)
    {
        count++;
        Console.Write(i);
        if (count != subSet.Count) Console.Write(",");
    }
}
```

![2010-05-26_140505](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300730804.png)

