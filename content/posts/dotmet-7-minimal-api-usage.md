---
title: dotNET 7：最小 API 使用
date: 2022-11-21 8:39:37
categories: [技术]
tags: [DotNet,dotNet7,C#]
---

Minimal APIs 并不是在 .NET 7 中才加入的，记得应该是在 .NET 6 中就已经提供，只是对我来说，到现在才开始使用。
<!--more-->

## 创建一个最小 API

在 VS 2002 中创建 WebAPI 项目，不勾选使用控制器，创建出来的就是最小 API ：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306161855969.webp)

- 不勾选使用控制器，就会创建最小 API 模板；
- 启用 OpenAPI ，默认会添加 Swagger；
- 不适用顶级语句，顶级语句是 C# 9.0 中添加的新特性，如果勾选不使用，Program 类中还会出现 main 函数。

创建出来的工程只有两个文件，重大的改变就是，没有之前的 Startup 类了，只有一个 Program 和一个配置文件 appsetting.json：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306161855812.webp)

Program 类的全部代码如下：

```csharp
var builder = WebApplication.CreateBuilder(args);
//在下面添加服务器到容器，相当于之前 Startup 类中的 ConfigureServices 方法

var app = builder.Build();
//在下面编写管道相关代码，相当于之前 Startup 类中的 Configure 方法

  
//在下面编写接口，相当于之前 Controller 中的方法
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;

});

//运行 API
app.Run();

internal record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
```

app.MapGet 方法接受两个参数，第一个参数是一个字符串，为接口的访问路径，第二个参数是一个委托，用来编写接口的业务逻辑。

从 MapGet 这个方法名可以看出，这是一个 Get 请求的接口方法，如果要使用 Post ，可以使用 MapPost 。

添加一个接口方法非常简单，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306161856473.webp)

## 使用 Serilog 日志框架

1、安装 NuGet 包：Serilog.AspNetCore，安装这一个就会包含 Serilog 、Serilog.Sink.File 等。

2、在 Program 类的 builder 创建之后，添加对 Serilog 的使用：

```csharp
using Serilog;

var builder = WebApplication.CreateBuilder(args);
//在下面添加服务器到容器，相当于之前 Startup 类中的 ConfigureServices 方法
//添加对 serilog 的使用
builder.Host.UseSerilog((hostContext, services, configuration) => {
    configuration
        .WriteTo.File("serilog-file.txt")
        .WriteTo.Console();
});
var app = builder.Build();
// 下面代码省略
```

3、运行程序，会看到项目更目录下会生成一个 serilog-file.txt 文本文件，里面记录了所有日志；

4、在上面添加的 helloworld 方法中使用日志：

```chsarp
app.MapGet("/helloworld", () => 
{
    Log.Information("helloworld.start");
    return "hello ,oec2003";
 });
```

- Information 是日志级别，还有 Error、Warning、Fatal、Debug；
- 接口方法调用后，日志会写入文本文件。

## 依赖注入

依赖注入一个常见的做法是使用构造函数进行注入，传统的 WebAPI 中可以在 Controller 的构造函数中进行注入，但最小 API 没有 Controller ,下面看看在最小 API 中是怎么注入的.

1、在 Program 类的最下面添加 IUser 接口和 User 类：

```csharp
internal interface IUser
{
    string GetName();
}
internal class User : IUser
{
    public string GetName()
    {
        return "oec2003";
    }
}
```

2、在 Program 类的 builder 创建之后，添加依赖注入的配置：

```csharp
builder.Services.AddTransient<IUser, User>();
```

3、注入的地方由原来的构造函数变成了方法参数：

```csharp
app.MapGet("/helloworld",  (IUser user) => 
{
    return $"hello , {user.GetName()}";
 });
```

## 配置

一开始创建的最小 API 的项目中的两个文件，其中一个就是 appsetting.json 配置文件，下面以 Serilog 日志框架的配置为例，来演示怎样读取配置文件。

1、在上面的 Serilog 例子中，配置是在代码中写死的，现在将配置移到 appsetting.json 配置文件中。

```json
"Serilog": {
    "MinimumLevel": "Information",
    "Override": {
        "Microsoft.AspNetCore": "Warning"
    },
    "WriteTo": [
        {
            "Name": "Console"
        },
        {
            "Name": "File",
            "Args": {
                "path": "Serilogs\\serilog.log"
            }
        }
    ]
}
```

2、修改 builder 部分的代码：

```csharp
builder.Host.UseSerilog(
            (hostingContext, loggerConfiguration) =>                loggerConfiguration.ReadFrom.Configuration(hostingContext.Configuration));
```

3、运行程序后，在程序根目录下会创建 Serilogs 目录，该目录中会创建 serilog.log 文件。

## 总结

1、对于一些简单的接口场景，使用最小 API 比较方便，都在一个文件中处理；

2、除了依赖注入式通过方法参数，其他很多地方跟之前用法类似，就是将 Startup 中 ConfigureServices 方法和 Configure 方法搬到了 Program 类的固定位置。