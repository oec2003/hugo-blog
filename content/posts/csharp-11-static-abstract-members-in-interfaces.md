---
title: C# 11：接口中的静态抽象成员
date: 2022-11-14 8:46:42
categories: [技术]
tags: [C#,C#11]
---

接口我们都很了解了，在编写代码的时，如果有一定的抽象思维，就会将不同对象的相同行为抽象出来，放到接口中，我们最熟悉的就是在接口中写一堆方法的定义。
<!--more-->
微软似乎一直都想在接口上做改进。

在 C# 8 中，接口中可以进行方法的定义，也就是默认接口方法，这个功能最大的好处是，当在接口中进行方法扩展时，之前的实现类可以不受影响，而在 C# 8 之前，接口中如果要添加方法，所有的实现类需要进行新增接口方法的实现，否则编译失败。

```csharp
//默认接口方法
public interface IUser  
{  
    string GetName() =>  "oec2003";  
}
```

关于接口默认方法，在《C#：8.0 & 9.0 常用新特性》一文中有讲到。

而到了 C# 11 中，又提供在接口中支持静态抽象成员。

严格来说，接口中的静态抽象成员早在 .NET 6 ，也就是 C# 10 中就被作为预览特性出现，默认是不开启的，需要设置 `<LangVersion>preview</LangVersion>` 和 `<EnablePreviewFeatures>true</EnablePreviewFeatures>`，然后引入一个官方的 nuget 包 `System.Runtime.Experimental` 来启用。具体可以参考：

https://github.com/dotnet/designs/blob/main/accepted/2021/preview-features/preview-features.md

在 .NET 6 版本之前或 .NET 6 中的默认情况，在接口中将静态成员标记为 abstract 或者 virtual 是不允许的，会出现编译错误。

C# 11 中这个功能是默认开启的，代码如下：

```csharp
public interface IUser
{
    public abstract static string GetName();
}
```

那么，这个静态抽象方法有什么用呢？

一种用途就是用来做数学计算，比如我们之前要写一个方法来计算两个整数之和，代码如下：

```csharp
int Add(int a,int b)
{
    return a + b;
}
Console.WriteLine(Add(1,2));
```

如果想要计算小数类型的，就需要重新写一个方法：

```csharp
double Add(double a, double b)
{
    return a + b;
}

Console.WriteLine(Add(1.2,2.3));
```

这是如果想要用一个方法来实现两种不同类型就需要使用泛型方法，如下：

![iShot_2023-01-17_21.53.49](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306161845209.webp)

但直接让两个泛型的参数进行相加，会出现上面的错误。在 .NET 7 中提供了一个 IAdditionOperators 接口，改接口中使用静态抽象方法重载了加号操作符：

![iShot_2023-01-17_21.54.26](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306161846996.webp)

我们使用 IAdditionOperators 接口就很容易实现一个方法，可以让不同类型的数字进行相加：

```csharp
T Add<T>(T left, T right) where T : IAdditionOperators<T, T, T>
{
    return left + right;
}

Console.WriteLine(Add(1, 2));  //3
Console.WriteLine(Add(1.2, 2.8)); //4
```

除了用于计算，这个新特性可以让我们只指定静态接口来参数化一些通用方法，而不需要实例化任何对象:

```csharp
Process<ImplA>();
Process<ImplB>();

static void Process<T>() where T : IInterface
{
	//直接在泛型的抽象类型 T 上进行调用
    T.Dowrok();
}

interface IInterface
{
    static abstract void Dowrok();
}

class ImplA : IInterface
{
    public static void Dowrok() { Console.WriteLine("ImplA DoWork"); }
}

class ImplB : IInterface
{
    public static void Dowrok() { Console.WriteLine("ImplB DoWork"); }
}
```

我们可以在接口中包含静态抽象成员，然后泛型方法上指定一个约束，类型参数应该从这个特定的接口派生出来。这样，泛型方法就可以轻松地调用静态方法。

再举一个例子：

下面是一个 .NET Core 3.1 WebAPI 默认 Controller 中的代码：

```csharp
[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private static readonly string[] Summaries = new[]
    {
        "Freezing", "Bracing", "Chilly"
    };

    private readonly ILogger<WeatherForecastController> _logger;

    public WeatherForecastController(ILogger<WeatherForecastController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IEnumerable<WeatherForecast> Get()
    {
        var rng = new Random();
        return Enumerable.Range(1, 5).Select(index => new WeatherForecast
        {
            Date = DateTime.Now.AddDays(index),
            TemperatureC = rng.Next(-20, 55),
            Summary = Summaries[rng.Next(Summaries.Length)]
        }).ToArray();
    }
}
```

- Controller 类的上面添加 ApiController、Route 特性，方法上添加 HttpGet 特性；
- .NET 框架需要扫描我们的项目并使用反射来确定这些特性的存在；
- 这些特性不是强制添加的，如果疏忽忘记，会导致程序运行达不到预期的结果。

在 C# 11 中，可以将上面提到的特性抽象成接口中的静态抽象成员，可以将所有的特性在单个的处理器中完成，避免了反射：

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.MapHandler<HelloWorld>();
app.Run();

public interface IHandler
{
    static abstract string Template { get; }
    static abstract HttpMethod Method { get; }
    static abstract Delegate Handle { get; }
}

public record struct HelloWorld : IHandler
{
    public static HttpMethod Method => HttpMethod.Get;
    public static string Template => "/hello";
    public static Delegate Handle =>
        (HttpRequest _) => "hello, oec2003!";
}

public static class ApplicationHandlerExtensions
{
    public static void MapHandler<THandler>(this WebApplication app)
        where THandler : IHandler
    {
        app.MapMethods(
            THandler.Template,
            new[] { THandler.Method.ToString() },
            THandler.Handle);
    }
}
```

- 上面代码放到 .NET 的 WebAPI 项目的 Projram 类中，可以直接运行；
- 上面代码中的 MapHandler 方法直接使用泛型的 THandler 来访问静态成员。

希望本文对您有所帮助！