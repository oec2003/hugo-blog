---
title: C#/Net代码精简优化技巧（2）
date: 2010-10-26
categories: [技术]
tags: [C#, 小技巧]
---

在[C#/Net代码精简优化技巧（1）](http://blog.fwhyy.com/2010/10/csharp-net-code-concise-optimization-techniques-1/)中已经介绍了5个小技巧，本篇将再介绍5个。

## string.IsNullOrEmpty() and string.IsNullOrWhiteSpace()

在Net2.0中String类型有一个静态方法IsNullOrEmpty，到了Net4.0中String类又增加了一个新的静态方法IsNullOrWhiteSpace。这两个方法看名称也可以知道IsNullOrEmpty是判断空引用和空字符串，而IsNullOrWhiteSpace是判断空引用和字符串中的每一个字符是否是空格。

在有这两个方法之前，我们要进行这样的判断，需要些如下代码

```c#
public string GetFileName(string fullPathFileName)
{
    if (fullPathFileName == null || fullPathFileName.Length == 0)
    {
        throw new ArgumentNullException(fullPathFileName);
    }
    //...
}
```

使用IsNullOrEmpty

```c#
public string GetFileName(string fullPathFileName)
{
    if (string.IsNullOrEmpty(fullPathFileName))
    {

      throw new ArgumentNullException(fullPathFileName);
    }
    //...
}
```

下面又了新的需求，需要将三个名字连接在一起，并且希望中间名字不为空字符串和不出现多余的空格，我们会写出下面的代码

```c#
public string GetFullName(string firstName, string middleName, string lastName)
{
    if (middleName == null || middleName.Trim().Length == 0)
    {
        return string.Format("{0} {1}", firstName, lastName);
    }
    return string.Format("{0} {1} {2}", firstName, middleName, lastName);
}
```

上面的代码中使用了Trim来去掉空格然后判断其长度是否为0，代码也非常的清晰简洁，但是会产生额外的String对象以至于影响性能，这时就应该使用Net4.0中的IsNullOrWhiteSpace方法

```c#
public string GetFullName(string firstName, string middleName, string lastName)
{
    if (string.IsNullOrWhiteSpace(middleName))
    {
        return string.Format("{0} {1}", firstName, lastName);
    }
    return string.Format("{0} {1} {2}", firstName, middleName, lastName);
}
```

上面的代码非常简洁，而且也不用担心会产生额外的String对象没有及时的进行垃圾回收而影响性能。

## string.Equals()

string.Equals方法有很多的重载供我们使用，但是其中有些常常会被我们忽视掉。通常我们比较字符串会使用下面的方法

```c#
public Order CreateOrder(string orderType, string product, int quantity, double price)
{
    if (orderType.Equals("equity"))
    {
    }
    // ...
}
```

如果orderType为null会抛出NullReferenceException异常，所以为了不抛出异常，在判断之前先要进行null的判断，如下：

```c#
if (orderType != null && orderType.Equals("equity"))
```

相当于每次都要做两次判断，很麻烦而且有时还有可能遗忘，如果使用string.Equals就可以解决这个问题，代码如下：

```c#
if (string.Equals(orderType, "equity"))
```

上面的代码当orderType为null时不会抛出异常而是直接返回false。

判断字符串相等的时候有时会需要区分大小写，很多人的习惯做法是先转换成大小或是小些在进行比较（建议转换成大写，因为编译器做了优化可以提高性能），但是当转换成大写或是小写时又会创建的的字符串，使性能降低。这时应该使用StringComparison.InvariantCultureIgnoreCase，代码如下

```c#
if (orderType.Equals("equity", StringComparison.InvariantCultureIgnoreCase))
```

如果要考虑到null的情况，还是应该使用string.Equal

```c#
if (string.Equals(orderType, "equity", StringComparison.InvariantCultureIgnoreCase))
```

## using语句

我们都知道using最常用的地方就是在类中引用命名空间。除此之外还可以用作设置别名和应用在一些实现了IDisposable 借口的对象实例上，可以使这些对象在using的作用范围内自动释放资源。下面的代码示例是没有使用using的情况：

```
public IEnumerable<Order> GetOrders()
{
    var orders = new List<Order>();
    var con = new SqlConnection("some connection string");
    var cmd = new SqlCommand("select * from orders", con);
    var rs = cmd.ExecuteReader();
    while (rs.Read())
    {
        // ...
    }
    rs.Dispose();
    cmd.Dispose();
    con.Dispose();
    return orders;
}
```

上面的代码不怎么好看，而且也没有对异常的处理，如果在代码执行过程中出现了异常将会导致有些资源不能及时释放，尽管最终还是会被垃圾回收，但还是会影响性能呢。下面的代码添加了异常处理

```
public IEnumerable<Order> GetOrders()
{
    SqlConnection con = null;
    SqlCommand cmd = null;
    SqlDataReader rs = null;
    var orders = new List<Order>();
    try
    {
        con = new SqlConnection("some connection string");
        cmd = new SqlCommand("select * from orders", con);
        rs = cmd.ExecuteReader();
        while (rs.Read())
        {
            // ...
        }
    }
    finally
    {
        rs.Dispose();
        cmd.Dispose();
        con.Dispose();
    }
    return orders;
}
```

上面的代码仍然存在不足，如果SqlCommand对象创建失败或是抛出了异常，rs就会为null，那么最后在执行rs.Dispose()时就会抛出异常，会导致con.Dispose不能被调用，所以我们应该避免这种情况的发生

```
public IEnumerable<Order> GetOrders()
{
    var orders = new List<Order>();
    using (var con = new SqlConnection("some connection string"))
    {
        using (var cmd = new SqlCommand("select * from orders", con))
        {
            using (var rs = cmd.ExecuteReader())
            {
                while (rs.Read())
                {
                    // ...
                }
            }
        }
    }
    return orders;
}
```

上面的代码中的using嵌套了好几层，看起来很繁琐，而且可读性也不是很好，我们可以像下面这样改进

```
public IEnumerable<Order> GetOrders()
{
    var orders = new List<Order>();

    using (var con = new SqlConnection("some connection string"))
    using (var cmd = new SqlCommand("select * from orders", con))
    using (var rs = cmd.ExecuteReader())
    {
        while (rs.Read())
        {
            // ...
        }
    }
    return orders;
}
```

## 静态类（Static）

很多人在创建类的时候没有使用过Static修饰符，可能他们并不知道Static修饰符的作用，Static修饰符所做的一些限制可以在其他开发人员使用我们代码的时候使我们的代码变得更加安全。比如我们现在写一个XmlUtility类，这个类的作用是实现XML的序列化，代码如下：

```
public class XmlUtility
{
    public string ToXml(object input)
    {
        var xs = new XmlSerializer(input.GetType());
        using (var memoryStream = new MemoryStream())
        using (var xmlTextWriter = new XmlTextWriter(memoryStream, new UTF8Encoding()))
        {
            xs.Serialize(xmlTextWriter, input);
            return Encoding.UTF8.GetString(memoryStream.ToArray());
        }
    }
}
```

上面的是很典型的XML序列化代码，但是我们在使用时需要先实例化这个类的对象，然后用对象来调用方法

```
var xmlUtil = new XmlUtility();
string result = xmlUtil.ToXml(someObject);
```

这样显然很麻烦，不过我们可以给方法加上static修饰符，然后给类加上私有的构造函数防止类实例化来使类的使用变得简单

```
public class XmlUtility
{
    private XmlUtility()
    { 

    }
    public static string ToXml(object input)
    {
        var xs = new XmlSerializer(input.GetType());
        using (var memoryStream = new MemoryStream())
        using (var xmlTextWriter = new XmlTextWriter(memoryStream, new UTF8Encoding()))
        {
            xs.Serialize(xmlTextWriter, input);
            return Encoding.UTF8.GetString(memoryStream.ToArray());
        }
    }
}
```

上面的代码可以实现类直接调用方法，但是给类设置私有构造函数的做法不是很好，当我们给类误添加了非静态方法时，类不能实例化，添加的非静态方法就形同虚设了

```
public T FromXml<T>(string xml) { ... }
```

所以我们需要将类设置成静态的，这样当类中有非静态方法时编译时就会抛出异常，告诉我们类中只能包含静态成员

```
public static class XmlUtility
{
    public static string ToXml(object input)
    {
        var xs = new XmlSerializer(input.GetType());
        using (var memoryStream = new MemoryStream())
        using (var xmlTextWriter = new XmlTextWriter(memoryStream, new UTF8Encoding()))
        {
            xs.Serialize(xmlTextWriter, input);
            return Encoding.UTF8.GetString(memoryStream.ToArray());
        }
    }
}
```

给类添加Static修饰符，该类就只能包含静态成员，并且不能被实例化，我们也不可能随便就给添加了一个非静态的成员，否则是不能编译通过的。

## 对象和集合初始化器

在C#3.0及以上版本中增加了对象和集合初始化器的新特性，会使代码看起来更加简洁，还有可能带来更高的性能。初始化器其实就是一个语法糖。看下面的例子，给出的是一个结构

```
public struct Point
{
    public int X { get; set; }
    public int Y { get; set; }
}
```

普通初始化如下

```
var startingPoint = new Point();
startingPoint.X = 5;
startingPoint.Y = 13;
```

使用初始化器初始化

```
var startingPoint = new Point() { X = 5, Y = 13 };
```

代码的确精简了不少，从三行减到了一行，可以让我们少敲很多字。

下面再来看看集合的初始化，假设我们在一个集合List中添加5个整数

```
var list = new List<int>();
list.Add(1);
list.Add(7);
list.Add(13);
list.Add(42);
```

使用集合初始化器，代码如下

```
var list = new List<int> { 1, 7, 13, 42 };
```

如果我们事先知道要加载的数量，可以给List设置默认的容量值，如下

```
var list = new List<int>(4) { 1, 7, 13, 42 };
```

下面来看一个通常情况下对象和集合一起使用的例子

```
var list = new List<Point>();
var point = new Point();
point.X = 5;
point.Y = 13;
list.Add(point);
point = new Point();
point.X = 42;
point.Y = 111;
list.Add(point);
point = new Point();
point.X = 7;
point.Y = 9;
list.Add(point);
```

下面为使用了初始化器的代码，可以对比一下区别

```
var list = new List<Point>
{
    new Point { X = 5, Y = 13 },
    new Point { X = 42, Y = 111 },
    new Point { X = 7, Y = 9 }
};
```

使用对象或集合初始化器给我们带来了非常简洁的代码，尽管有时一条语句会占用多行，但是可读性是非常好的。

有些时候在性能上也会带来提升，看下面两个类

```
public class BeforeFieldInit
{
    public static List<int> ThisList = new List<int>() { 1, 2, 3, 4, 5 };
}

public class NotBeforeFieldInit
{
    public static List<int> ThisList;

    static NotBeforeFieldInit()
    {
        ThisList = new List<int>();
        ThisList.Add(1);
        ThisList.Add(2);
        ThisList.Add(3);
        ThisList.Add(4);
        ThisList.Add(5);
    }
}
```

这两个类都是做同样的事情，都是创建一个静态的List字段，然后添加了1到5五个整数。不同的是第一个类在生成的IL代码中类上会添加beforefieldinit标记，对比两个类生成的IL代码

```
.class public auto ansi beforefieldinit BeforeFieldInit
       extends [mscorlib]System.Object
{
} // end of class BeforeFieldInit 

.class public auto ansi NotBeforeFieldInit
       extends [mscorlib]System.Object
{
} // end of class NotBeforeFieldInit
```

有关静态构造函数的性能问题可以参考[CLR Via C# 学习笔记（5） 静态构造函数的性能](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-5-the-performance-of-the-static-constructor/)

## 总结

本文是参考老外系列博客的第二篇写的，并不是直译，原文见下面链接。希望本文对大家有所帮助。

原文链接：[http://geekswithblogs.net/BlackRabbitCoder/archive/2010/09/02/c.net-five-more-little-wonders-that-make-code-better-2.aspx](http://geekswithblogs.net/BlackRabbitCoder/archive/2010/09/02/c.net-five-more-little-wonders-that-make-code-better-2.aspx)

[C#/Net代码精简优化技巧（1）](http://blog.fwhyy.com/2010/10/csharp-net-code-concise-optimization-techniques-1/)
C#/Net代码精简优化技巧（2）
[C#/Net代码精简优化技巧（3）](http://blog.fwhyy.com/2010/11/csharp-net-code-concise-optimization-techniques-c/)

