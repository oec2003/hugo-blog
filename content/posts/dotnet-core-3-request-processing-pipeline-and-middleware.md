---
title: dotNET Core 3.X 请求处理管道和中间件
date: 2020-04-13T07:07:22+08:00
categories: [技术]
tags: [dotNetCore,中间件]
---

理解 dotNET Core 中的管道模型，对我们学习 dotNET Core 有很大的好处，能让我们知其然，也知其所以然，这样在使用第三方组件或者自己写一些扩展时，可以避免入坑，或者说避免同样的问题多次入坑。

<!--more-->

本文分为以下几个部分来进行介绍：

* 新老管道模型对比
* 分析代码理解请求处理
* 中间件和过滤器的区别
* 自定义中间件

## 新老管道模型对比

我们知道，在 Web 应用中，无论使用什么技术，都是客户端发送一个请求，服务器端经过一系列的处理后返回结果给客户端。

![](https://img.fwhyy.com/2022/202201292125708.webp)
（图1)

在服务器端返回响应前我们的请求都会经过一些列的处理才会产生最终的结果，不管是之前的 dotNET Frameowrk 程序还是现在的 dotNET Core，中间的处理都采用了管道的设计。

### ASP.NET 管道

通常，我们会将 ASP.NET 程序部署到 IIS 中，这样就形成了 IIS 和 ASP.NET 运行时的双管道模型，大致请求流程如下：

1、程序在 IIS 中运行后，会启动一个名为 w3wp.exe 的进程，我们进行服务器端 Debug 时就需要附加这个进程；
2、在 w3wp.exe 中利用 aspnet_isapi.dll 加载 .NET 运行时；
3、随后运行时 IsapiRuntime 会被加载，加载后，会接管整个 HTTP 请求，然后创建一个 IsapiWorkerRequest 对象来包装 HTTP 请求；
4、包装好 HTTP 请求后，将 IsapiWorkerRequest 传递给 ASP.NET 的 HttpRuntime ，这时请求就进入了 ASP.NET 的管道；
5、HttpRuntime 会根据 IsapiWorkerRequest 对象创建表示当前 HTTP 请求上下文 (Context) 对象 HttpContext；
6、HttpContext 创建后，HttpRuntime 会使用 HttpApplicationFactory 创建当前的 HttpApplication 对象，HttpApplication 对象会有多个，处理完后会被释放到 HttpApplication 的对象池中；
7、到了 HttpApplication 中之后，就是我们所熟悉的 HttpModule 和 HttpHandler 了，先经过 HttpModule ，比如 ASP.NET 自带的授权、身份认证、缓存等就是通过 HttpModule 处理，我们也可以自定义自己的 HttpModule ，而具体的 aspx、ascx 等就是由 HttpHandler 处理。

具体的处理流程图如下：

![](https://img.fwhyy.com/2022/202201292126332.webp)
（图2)

HttpModule 和 HttpHandler 的细化图如下：

![](https://img.fwhyy.com/2022/202201292126700.webp)
（图3)

### dotNET Core 管道

在 dotNET Core 中，HttpModule 和 HttpHandler 已经消失了。取而代之的是 MiddleWare（中间件） 。在 Core 中请求处理管道由一个服务器和一组中间件来组成，服务器默认就是内置的 Kestrel ，官方经典的流程图如下：

![](https://img.fwhyy.com/2022/202201292126431.webp)
（图4)

请求经过中间件处理完后，进入下一个中间件，然后按照顺序依次返回。相比较原来的 HttpModule ，更简单和轻量级，而且即便是系统级别的中间件，也是可以由用户自己选择使用的，更加灵活，同时也有更好的性能。更多中间件和 HttpModule 的对比可以参考：[https://docs.microsoft.com/zh-cn/aspnet/core/migration/http-modules?view=aspnetcore-3.1](https://docs.microsoft.com/zh-cn/aspnet/core/migration/http-modules?view=aspnetcore-3.1)

## 分析代码理解请求处理

### 控制台程序

在 Rider 中创建一个 dotNET Core 3.1 的控制台程序，修改项目文件如下：

```
<Project Sdk="Microsoft.NET.Sdk.Web">
    <PropertyGroup>
        <TargetFramework>netcoreapp3.1</TargetFramework>
    </PropertyGroup>
</Project>
```

控制台的 Skd 类型为 `Microsoft.NET.Sdk` ，将其修改为 `Microsoft.NET.Sdk.Web` 后会自动引用 ASP.NET Core 的相关包。这样这个控制台就有了 Web 应用的能力了，在 Program 类添加 using 引用：

```
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
```

Main 函数添加如下代码：

```
Host.CreateDefaultBuilder()
    .ConfigureWebHost(builder => builder
        .Configure(app => app
            .Run(context => context.Response.WriteAsync("hello world!")))
        .UseKestrel()
        .UseUrls("http://localhost:5000"))
    .Build()
    .Run();
```

运行程序，可以看到浏览器会显示 hello world

![](https://img.fwhyy.com/2022/202201292127598.webp)
（图5)

Main 函数中的​代码调用步骤如下：​

* 调用类 Host 的静态方法 CreateDefaultBuilder 创建一个 IHostBuilder，对象，在 CreateDefaultBuilder 方法中，系统帮我做了一些事情，比如设置根目录、加载配置文件、配置默认日志框架等；
* 最终调用 IHostBuilder 的 Build 方法构建一个 IHost，并调用扩展方法 Run；
* 在上面的 IHostBuilder 构建后，调用 ConfigureWebHost 方法对请求处理管道进行定制，该方法是 IHostBuilder 的一个扩展方法，接收一个 Action<IWebHostBuilder> 类型的委托，在该方法中，可以注册服务和使用中间件，比如上面例子中的 `app.Run(context => context.Response.WriteAsync("hello world!"))` 就是一个简单的中间件，中间件被注册到 Configure 方法的参数 Action<IApplicationBuilder> 委托中； 
* 随后调用 UseKestrel 来构建一个 Kestrel 的服务器，调用 UseUrls 方法来设置服务器监听的端口。

### 控制台程序到 Web API 的转变

如果我们创建的是一个 Web API 项目，在 Program 类中会有一个 CreateHostBuilder 的静态方法来返回 IHostBuilder 对象：

```
public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder  =>{ webBuilder.UseStartup<Startup>(); });
```

上面代码中调用 webBuilder.UseStartup<Startup>(); 加载了 Startup 类，Startup 类并没有继承任何类，但其实是按照 IStartup 接口的约束来实现的，IStartup 接口代码如下：

```
  public interface IStartup
  {
    IServiceProvider ConfigureServices(IServiceCollection services);

    void Configure(IApplicationBuilder app);
  }
```

* ConfigureServices：用来注册服务；
* Configure：用来加载中间件

既然 Configure 方法是用来注册中间件的，我们修改 Startup 类的 Configure 方法，可以实现和上面的控制台例子一样的效果：

```
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    app.Run(context => context.Response.WriteAsync("hello world!"));
}
```

### 模拟多个中间件请求

在 Configure 中注册中间件通常使用 `app.Use()` 方法，Use 方法接收一个 Func<RequestDelegate, RequestDelegate> 的委托作为参数，这个委托即是我们的中间件，而 RequestDelegate 代表着 HTTP 请求的处理器，在整个请求处理中流转，RequestDelegate 的参数 HttpContext 包装了 HttpRequest 和 HttpResponse。

修改 Startup 类的 Configure 方法，代码如下：

```
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    app.Use(next =>
    {
        Console.WriteLine("第一个中间件");
        return new RequestDelegate(async context =>
        {
            await context.Response.WriteAsync("First Middleware Begin >>>");
            await next.Invoke(context);
            await context.Response.WriteAsync($"First Middleware >>>");
        });
    });
    app.Use(next =>
    {
        Console.WriteLine("第二个中间件");
        return new RequestDelegate(async context =>
        {
            await context.Response.WriteAsync("Second Middleware Begin >>>");
            await context.Response.WriteAsync("Second Middleware End >>>");
            
        });
    });
}
```

先来看运行结果：

![](https://img.fwhyy.com/2022/202201292127058.webp)
（图6)

![](https://img.fwhyy.com/2022/202201292127639.webp)
（图7)

从图6 可以看出注册中间件的顺序和我们代码的顺序是相反的，这个可以看看 ApplicationBuilder 的源码就清楚，在 Build 方法中执行时将收集到的所有中间件进行了反转

![](https://img.fwhyy.com/2022/202201292128822.webp)
（图8)

从图7 可以看出，中间件的执行顺序是按照注册的顺序一个一个进入，然后传递到后面一个中间件，最后一个执行完后原路返回。

## 中间件和过滤器的区别

我们可以在中间件中进行请求到拦截，做一些自己的处理，或者可以直接中断请求，同样 dotNET Core 中的 过滤器（Filter）也可以做同样的事情，那么两者有什么区别呢？

在之前的文章 《dotNET Core WebAPI 统一处理（返回值、参数验证、异常）》 中就是通过过滤器来实现返回值、异常等的统一处理，所以说过滤器跟 Controller 或者 Action 关系更紧密，是整个 MVC 这个中间件的一部分。

而中间件更多是关注业务无关的，比如 Session 存储、身份认证等。在 Web API 中经常使用 Swagger 来做文档管理，也是以中间件的方式来使用，添加如下代码就可以：

```
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "DotNet Core WebAPI文档");
});
```

## 自定义中间件

实现自己的中间件，我们可以继承 IMiddleware 这个接口，可以看看这个接口的代码，只有一个方法需要实现：

```
public interface IMiddleware
{
	Task InvokeAsync(HttpContext context, RequestDelegate next);
}
```

现在来设定一个使用场景（不一定恰当），来使用自定义的中间件实现：

* 项目是前后端分离的开发模式；
* 接口需要只在当前站点中可以使用，脱离站点去调用是不允许的；
* 假设当前站点为：http://fwhyy.com 。​

1、创建 RequestSourceCheckMiddleware 类继承 IMiddleware ，并实现方法

```
public async Task InvokeAsync(HttpContext context, RequestDelegate next)
{
    string urlRef = context.Request.Headers["Referer"];

    if (string.IsNullOrWhiteSpace(urlRef) || !urlRef.Contains("http://fwhyy.com"))
    {
        context.Response.StatusCode = 403; 
        await Task.CompletedTask;
    }
    else
    {
        await next.Invoke(context);
    }
}
```

2、创建扩展方法

```
public static class RequestSourceCheckMiddlewareExtension
{
    public static IApplicationBuilder UseRequestSourceCheck(this IApplicationBuilder app)
    {
        app.UseMiddleware<RequestSourceCheckMiddleware>();
        return app;
    }
}
```

3、在 Starup 类的 Configure 方法中调用扩展方法使用中间件

```
app.UseRequestSourceCheck();
```

4、调用结果如下

![](https://img.fwhyy.com/2022/202201292129964.webp)


实现中间件，我们也可以不继承 IMiddleware 接口，按照约束去定义中间件的类一样可以实现功能，在 dotNET Core 还有很多的地方使用着固有的约定，比如 Starup 类也没有实现 IStarup 接口，也是一样的道理。按照约定的方式实现代码如下：

```
public class RequestSourceCheckMiddlewareNew
{
    private readonly RequestDelegate _next;

    public RequestSourceCheckMiddlewareNew(RequestDelegate next)
    {
        _next = next;
    }
    public async Task Invoke(HttpContext context)
    {
        string urlRef = context.Request.Headers["Referer"];

        if (string.IsNullOrWhiteSpace(urlRef) || !urlRef.Contains("http://fwhyy.com"))
        { 
            context.Response.StatusCode = 403; 
            await Task.CompletedTask;
        }
        else
        {
            await  _next.Invoke(context);
        }
    }
}
```

希望本文对您有所帮助，下一篇准备讲讲 Web API 中 Jwt 的使用。

文中示例代码：[https://github.com/oec2003/DotNetCoreThreeAPIDemo](https://github.com/oec2003/DotNetCoreThreeAPIDemo)

