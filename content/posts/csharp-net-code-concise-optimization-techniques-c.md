---
title: C#/Net代码精简优化技巧（3）
date: 2010-11-10
categories: [技术]
tags: [C#, 小技巧]
---

前面两篇中已经介绍了10个小技巧，本篇是本次系列的最后一篇，将再介绍5个。这些小技巧看着并不起眼，有些您可能知道，但在平时的开发中可能由于惯性并没有去使用。所以建议大家掌握并去使用这些小技巧，他们将使我们的代码变得更简洁和易于维护。

## 隐式类型

首先了解一下概念，隐式类型并不是动态类型，隐式类型是用关键字var来定义，var定义的类型仍然是强类型。

很多人认为使用隐式类型是懒惰的表现，刚开始我也是这么认为的，但是想想我使用STL中迭代指针的开发经理，我就明白了。看下面代码：

```
for (list<int>::const_iterator it = myList.begin(); it != myList.end(); ++it)
{
    // ...
}
```

很多时候我们会写出下面这样的代码

```
// pretty obvious
ActiveOrdersDataAccessObject obj = new ActiveOrdersDataAccessObject();

// still obvious but even more typing
Dictionary<string,List<Product>> productsByCategory =
    new Dictionary<string,List<Product>>();
```

上面的代码的类型定义很明显，是什么类型就用什么类型来定义，下面尝试用var关键字来定义

```
// nicer!
var obj = new ActiveOrdersDataAccessObject();
// Ah, so much nicer!
var productsByCategory = new Dictionary<string,List<Product>>();
```

用var关键字后代码变得简洁多了，编译器会在编译时去推断是什么类型，var关键字只相当于是一个占位符。

而且使用var关键字在我们使用泛型或是Linq表达式时会提供更好的可读性，比较下面两行代码：

```
// 隐式类型
var results1 = from p in products where p.Value > 100 group p by p.Category;

// 显示类型
IEnumerable<IGrouping<string, Product>> results2 =
    from p in products where p.Value > 100 group p by p.Category;
```

## Linq 扩展方法

在以前的编码中，很多时候我们需要去写一些自己的函数库，如排序、分组、查找或是其他的一些算法。并且我们要花很多的时间来为这些函数写单元测试，很多时候困扰我们的一些bug正是在这些方法中出现的。

随着Linq扩展方法的推出，你可以使用现成的这些标准的算法，而不需要自己再去写一遍，提供了极大的方便。需要排序可以使用OrderBy()，当需要查询条件时可以使用Where()，当需要选择一些类的属性时可以使用Select()，当需要分组查询时可以使用GroupBy()，这些Linq中的扩展方法经过了全面的测试，不需要我们来为他写单元测试代码，也不会出现让人困扰的bug。

看下面的例子，假设有一个集合List<Product>，集合里装载的是Product对象，Product有Value和Category两个属性，现在要按类别来查找Value值大于$100的数据，以前我们可能会像下面这样写

```
var results = new Dictionary<string, List<Product>>();

foreach (var p in products)
{
    if (p.Value > 100)
    {
        List<Product> productsByGroup;
        if (!results.TryGetValue(p.Category, out productsByGroup))
        {
            productsByGroup = new List<Product>();
            results.Add(p.Category, productsByGroup);
        }

        productsByGroup.Add(p);
    }
}
```

使用Linq扩展方法

```
var results = products
               .Where(p => p.Value > 100)
               .GroupBy(p => p.Category);
```

也可以像下面这样写

```
var results = from p in products where p.Value > 100 group p by p.Category;
```

## 扩展方法

扩展方法可以让我们自己对一些类型进行方法的扩展，像上面讲到的Linq的一些扩展方法。扩展方法是一个静态方法，而且必须在一个静态类中。看下面这个例子，编写一个扩展方法将所以对象转换成XML。

```
public static class ObjectExtensions
{
    public static string ToXml(this object input, bool shouldPrettyPrint)
    {
        if (input == null) throw new ArgumentNullException("input");

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

需要注意的是，包含扩展方法的类必须为静态类；扩展方法必须为静态方法；方法的第一个参数必须在类型前面使用this关键字。下面看看怎样调用该扩展方法

```
// can convert primatives to xml
string intXml = 5.ToXml();

// can convert complex types to xml
string objXml = employee.ToXml();

// can even call as static method if you choose:
objXml = ObjectExtensions.ToXml(employee);
```

其实扩展方法只是一个语法糖，他可以使我们在类型上添加一些自己的方法。适当的使用扩展方法可以给我们的编码带来方便，但过度使用会适得其反，会使代码易读性变差，而且我们的只能提示项也会变得非常庞大。

## System.IO.Path

Net中的System.IO.Path方法有很多的静态方法来处理文件和路径。很多时候我们尝试手动的将路径和文件名结合在一起而导致产生的文件路径不可用，因为我们往往忽视了路径后面可能有一个结尾符号‘\’。现在使用Path.Combine()方法可以避免这种错误

string fullPath = Path.Combine(workingDirectory, fileName);
假设现在有一个带文件名的完整的路径名，我们需要取其中的路径、文件名或是文件的扩展名。Path类的很多静态方法可以满足我们的需要，如下

```
string fullPath = "c:\\Downloads\\output\\t0.html";
// gets "c:\"
string pathPart = Path.GetPathRoot(fullPath);
// gets "t0.html"
string filePart = Path.GetFileName(fullPath);
// gets ".html"
string extPart = Path.GetExtension(fullPath);
// gets "c:\downloads\output"
string dirPart = Path.GetDirectoryName(fullPath);
```

所以当我们遇到这种需要对文件路径进行操作时，我们可以去使用Path类的静态方法。

## 泛型委托

如果你写过或使用过带事件的类，或是用过Linq的一些扩展方法，那么您很多可能直接或间接的使用过委托。委托可以以一种强有力的方式类创建一个类型，用来描述一个方法的签名。在运行时来使用和调用这个方法。这个有点类似于C++中的函数指针。

委托最伟大的是比类的继承有更好的重用性，假设你要设计一个缓存类，该类有一些方法供用户调用，但是取决于缓存项是否过期或是被删除了。你向用户提供一个抽象方法，让用户去继承类并重载该方法，这意味着增加了很多额外的工作。

如果使用委托，可以在被调用是在指定的方法中进行缓存项的过期检查，可以传递或设置委托方法，匿名委托或是lambda表达式进行调用，这样没有必须创建子类，我们可以将类设置成密封的以防止任何意外的发生，这样使类更加安全和有更好的可重用性。

那么这些和泛型委托有什么关系呢？现在有三个委托的基本“类型”反复的出现，而又不想去反复写这些委托类型。就要使用泛型委托了，泛型委托还可以提高我们代码的可读性。下面是三个Net提供的泛型委托类型

[Action<T>](http://msdn.microsoft.com/zh-cn/library/018hxwa8.aspx)
[Predicate<T>](http://msdn.microsoft.com/en-us/library/bfcke1bz.aspx)
[Func<TResult>](http://msdn.microsoft.com/en-us/library/bb534960.aspx)

关于上面三个泛型委托类型的详细解释和用法，可以点击链接看MSDN

再回到刚才说到的缓存的例子，你希望该缓存接受一个缓存策略，并且有一个委托，委托的返回值来表示缓存是否过期，代码如下：

```
public sealed class CacheItem<T>
{
    public DateTime Created { get; set; }

    public DateTime LastAccess { get; set; }

    public T Value { get; set; }
}

public sealed class Cache<T>
{
    private ConcurrentDictionary<string, CacheItem<T>> _cache;
    private Predicate<CacheItem<T>> _expirationStrategy;

    public Cache(Predicate<CacheItem<T>> expirationStrategy)
    {
        // set the delegate
        _expirationStrategy = expirationStrategy;
    }
    // ...
    private void CheckForExpired()
    {
        foreach (var item in _cache)
        {
            // call the delegate
            if (_expirationStrategy(item.Value))
            {
                // remove the item...
            }
        }
    }
}
```

现在就可以创建和使用缓存类了

```
var cache =
new Cache<int>(item => DateTime.Now - item.LastAccess > TimeSpan.FromSeconds(30));
```

事实上我们可以发挥我们的想象对缓存创建很多的过期策略，但不要去使用继承。了解和使用泛型委托他会增加我们类的可重用性。

## 总结

本文是参考老外系列博客的第三篇写的，并不是直译，原文见下面链接。希望本文对大家有所帮助。

原文链接：[http://geekswithblogs.net/BlackRabbitCoder/archive/2010/09/09/c.net-five-final-little-wonders-that-make-code-better-3.aspx](http://geekswithblogs.net/BlackRabbitCoder/archive/2010/09/09/c.net-five-final-little-wonders-that-make-code-better-3.aspx)

[C#/Net代码精简优化技巧（1）](http://blog.fwhyy.com/2010/10/csharp-net-code-concise-optimization-techniques-1/)
[C#/Net代码精简优化技巧（2）](http://blog.fwhyy.com/2010/10/csharp-net-code-concise-optimization-techniques-2/)
C#/Net代码精简优化技巧（3）

