---
title: dotNET Core：配置
date: 2018-08-12T22:13:39+08:00
categories: [技术]
tags: [dotNET Core]
---

在`dotNET Core`中默认情况下没有了之前版本的`App.config`和`Web.Config`文件，换成了新的`json`格式的配置文件。当然，如果想使用之前的方式也是可以的。下面说说在`dotNET Core`中各种使用配置的方法。
## 环境
* 操作系统：macOS 10.13.5
* dotNET Core：2.1
## 使用原来的config文件

如果你还念旧，想使用之前的`App.config`或`Web.config`，可以导入`System.Configuration.ConfigurationManager`包，使用方式和之前一样。

![-w788](https://img.fwhyy.com/2022/202201270825835.webp)

```
using System.Configuration;
...
static void Main(string[] args)
{
     var connection = ConfigurationManager.ConnectionStrings["ConnectionStr"].ConnectionString;
     var mqHostName = ConfigurationManager.AppSettings["MQHostName"];
     Console.WriteLine($"connection:{connection}");
     Console.WriteLine($"mqHostName:{mqHostName}");
     Console.ReadLine();
}
```

## 命令行配置

1、创建一个控制台的应用程序`NetCoreConfigDemo`；
2、导入依赖包，可以按需导入，也可以直接导入`Microsoft.AspNetCore`的包，里面包含所有依赖的项；

![-w1001](https://img.fwhyy.com/2022/202201270825585.webp)

3、添加`using Microsoft.Extensions.Configuration;`引用；
4、代码如下：

```
using System;
using Microsoft.Extensions.Configuration;
namespace NetCoreConfigDemo
{
    class Program
    {
        static void Main(string[] args)
        {
            var builder = new ConfigurationBuilder()
                .AddCommandLine(args);
            var configration = builder.Build();
            Console.WriteLine($"name:{configration["name"]}");
            Console.ReadLine();
        }
    }
}
```

5、运行时指定`name`参数，在命令行中可以正常打印出来

![-w676](https://img.fwhyy.com/2022/202201270827596.webp)

上面例子中的参数`name`是在启动程序是指定的，如果想要程序有一个默认的参数值，可以在程序中初始化一个字典类`Dictionary`，代码如下：

```
using System;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
namespace NetCoreConfigDemo
{
    class Program
    {
        static void Main(string[] args)
        {
            var dic = new Dictionary<string, string>() { { "name", "oec2003" } };
            var builder = new ConfigurationBuilder()
                .AddInMemoryCollection(dic)
                .AddCommandLine(args);
            var configration = builder.Build();
            Console.WriteLine($"name:{configration["name"]}");
            Console.ReadLine();
        }
    }
}
```

>注意：`AddInMemoryCollection`必须放在`AddCommandLine`的前面，否则默认值会覆盖掉在外部指定的参数值。

## Json文件配置

1、在控制台项目中添加`json`文件`App.json`，文件内容如下：

```
{
  "name": "oec2003"
}

```

2、设置`App.json`的属性

![-w347](https://img.fwhyy.com/2022/202201270827196.webp)

3、编写代码读取`App.json`文件内容

```
using System;
using Microsoft.Extensions.Configuration;
namespace NetCoreConfigDemo
{
    class Program
    {
        static void Main(string[] args)
        {
            var builder = new ConfigurationBuilder()
                .AddJsonFile("App.json");
            var configration = builder.Build();
            Console.WriteLine($"name:{configration["name"]}");
            Console.ReadLine();
        }
    }
}
```

## 使用强类型配置（将配置文件映射到类）

1、创建`AspNetCore MVC`项目`NetCoreConfigWebDemo`；
2、在`appsettings.json`文件中追加如下内容：

```
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning"
    }
  },
  "AllowedHosts": "*",
  //下面为新添加的内容
  "UserInfo": {
    "UserName": "oec2003",
    "Age": "18",
    "Address": "wuhan china"
  }
}
```

3、修改`Startup`类中的`Configure`方法；

```
public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    ......
    //读取配置文件内容到UserInfo类
    var userInfo = new UserInfo();
    Configuration.GetSection("UserInfo").Bind(userInfo);

    Console.WriteLine($"Name:{userInfo.UserName}");
    Console.WriteLine($"Age:{userInfo.Age}");
    Console.WriteLine($"Address:{userInfo.Address}");
}
```

4、运行程序可以看到配置文件内容可以正常打印在控制台中

![-w647](https://img.fwhyy.com/2022/202201270827213.webp)

## 使用IOptions<T>来做强类型配置

修改`NetCoreConfigWebDemo`项目`Startup`的`ConfigureServices`方法，添加对`UserInfo`类的注册

```
public void ConfigureServices(IServiceCollection services)
{
    services.Configure<CookiePolicyOptions>(options =>
    {
        options.CheckConsentNeeded = context => true;
        options.MinimumSameSitePolicy = SameSiteMode.None;
    });

    services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

    //注册UserInfo类
    services.Configure<UserInfo>(Configuration.GetSection("UserInfo"));
}
```

### 在Controller中实现IOptions<T>

1、在`HomeContrller`中添加对`IOptions`的注入

```
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
namespace NetCoreConfigWebDemo.Controllers
{
    public class HomeController : Controller
    {
        private UserInfo _userInfo;
        public HomeController(IOptions<UserInfo> options)
        {
            _userInfo = options.Value;
        }
        
        public IActionResult Index()
        {
            return View(_userInfo);
        }
    }
}
```

2、Html模版的代码如下：

```
@model NetCoreConfigWebDemo.UserInfo;
@{
    ViewData["Title"] = "Home Page";
}
<h2>UserInfo</h2>
<ul>

    <li>UserName:@Model.UserName</li>
    <li>Age:@Model.Age</li>
    <li>Address:@Model.Address</li>
</ul>
```

### 在Html模版中实现IOptions<T>

`HomeController`中不需要做任何事，直接在`Html`模版中注入`IOptions`

```
@using Microsoft.Extensions.Options;
@inject IOptions<NetCoreConfigWebDemo.UserInfo> userInfo;
@{
    ViewData["Title"] = "Home Page";
 }

<h2>UserInfo</h2>
<ul>
    <li>UserName:@userInfo.Value.UserName</li>
    <li>Age:@userInfo.Value.Age</li>
    <li>Address:@userInfo.Value.Address</li>
</ul>
```

运行效果如下图：

![-w482](https://img.fwhyy.com/2022/202201270827430.webp)

## 配置文件热更新

在原来的`Asp.Net`中如果修改了`Web.config`文件，网站会自动重新启动，自动重启会影响用户的访问，在`dotNET Core`中可以使用热更新的方式，让用户无感知的进行配置文件的更新。

实现的方式非常简单，只需要将上面代码的`IOptions`修改为`IOptionsSnapshot`就可以了。

```
@using Microsoft.Extensions.Options;
@inject IOptionsSnapshot<NetCoreConfigWebDemo.UserInfo> userInfo;
@{
    ViewData["Title"] = "Home Page";
 }

<h2>UserInfo</h2>
<ul>
    <li>UserName:@userInfo.Value.UserName</li>
    <li>Age:@userInfo.Value.Age</li>
    <li>Address:@userInfo.Value.Address</li>
</ul>
```

## 自定义ConfigurationProvider

`dotNET Core`虽然提供了很多种配置的`Provider`，但一些特殊场景下不能完全满足需求，我们可以通过扩展来实现自己的`Provider`，需要实现`IConfigurationSource`和`IConfigurationProvider`接口，下面以`Redis`配置为例，来实现自定义的`Provider`。

1、创建控制台项目`NetCoreRedisConfigDemo`；
2、创建`RedisConfigSource`类、`RedisConfigProvider`类、`RedisConfigExtension`类；

### RedisConfigSource类

```
using System;
using Microsoft.Extensions.Configuration;

namespace NetCoreRedisConfigDemo
{
    public class RedisConfigSource : IConfigurationSource
    {
        public IConfigurationProvider Build(IConfigurationBuilder builder)
        {
            return new RedisConfigProvider();
        }
    }
}
```

### RedisConfigProvider类

```
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
namespace NetCoreRedisConfigDemo
{
    public class RedisConfigProvider:ConfigurationProvider
    {
        public RedisConfigProvider()
        {
        }
        public override void Load()
        {
            Dictionary<string, string> dic = new Dictionary<string, string>()
            {
                {"HostName","localhost"},
                {"Port","6379"},
                {"Password","123456"}
            };

            Data = dic;
        }
    }
}
```

### RedisConfigExtension类

```
using System;
using Microsoft.Extensions.Configuration;

namespace NetCoreRedisConfigDemo
{

    public static class RedisConfigExtension
    {
        public static IConfigurationBuilder AddRedisConfig(this IConfigurationBuilder builder)
        {
            return builder.Add(new RedisConfigSource());
        }
    }
}
```

3、在`Main`方法中可以使用我们自定义的`Provider`

```
using System;
using Microsoft.Extensions.Configuration;
namespace NetCoreRedisConfigDemo
{
    class Program
    {
        static void Main(string[] args)
        {
            var builder = new ConfigurationBuilder()
                .AddRedisConfig();
            var configration = builder.Build();
            Console.WriteLine($"HostName:{configration["HostName"]}");
            Console.WriteLine($"Port:{configration["Port"]}");
            Console.WriteLine($"Password:{configration["Password"]}");
            Console.ReadLine();
        }
    }
}
```

运行结果如下：

![-w579](https://img.fwhyy.com/2022/202201270828057.webp)

## 环境变量

在`Web`项目中，我们可以使用环境变量来区分开发环境、测试环境和生产环境，默认情况下会有一个开发环境的环境变量的配置

![-w753](https://img.fwhyy.com/2022/202201270828257.webp)

在`Web`项目的`Statup`类的Configure方法中有对环境变量的判断，可以根据不同的环境来处理不同的业务逻辑。

```
public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
	if (env.IsDevelopment())
	{
	    app.UseDeveloperExceptionPage();
	}
	else
	{
	    app.UseExceptionHandler("/Home/Error");
	    app.UseHsts();
	}
	......
}
```

另外一种情况，当我们的程序运行在`Docker`中，在容器启动时需要传入一些参数到程序内部，这是就需要使用环境变量，下面一个简单例子演示一下：

1、创建控制台程序`NetCoreEnvironmentDemo`；
2、`Program`类的代码如下：

```
using System;
namespace NetCoreEnvironmentDemo
{
    class Program
    {
        static void Main(string[] args)
        {
            string name = Environment.GetEnvironmentVariable("name");
            string age = Environment.GetEnvironmentVariable("age");

            Console.WriteLine($"name:{name}");
            Console.WriteLine($"age:{age}");
            Console.ReadLine();
        }
    }
}
```

3、创建`Dockerfile`文件，内容如下：

```
FROM microsoft/aspnetcore
COPY . /app
WORKDIR /app
EXPOSE 80/tcp
ENTRYPOINT ["dotnet", "NetCoreEnvironmentDemo.dll"]
```

4、使用命令`dotnet publish`发布程序；
5、进入到publish目录，使用`docker build -t envtest .`命令将程序打包成镜像；
6、使用命令`docker run -d -p 81:80 -e "name=oec2003" -e "age=18" --name envtest envtest:latest`创建容器;
7、使用`docker logs 容器id`查看容器日志

![-w905](https://img.fwhyy.com/2022/202201270828409.webp)


##  总结

在`dotNET Core`中，配置的方式有多种，而且可以根据需要自行扩展，可以说能够满足各种类型的需求了。点击「[查看源码](https://github.com/oec2003/StudySamples/tree/master/NetCoreConfigDemo)」可以查看本文的示例代码。

