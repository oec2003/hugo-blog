---
title: dotNET Core 3.X 使用 Autofac 来增强依赖注入
date: 2020-06-08T12:02:56+08:00
categories: [技术]
tags: [dotNET Core,依赖注入]
---

在上一篇《dotNET Core 3.X 依赖注入》中简单介绍了 dotNET Core 框架本身的依赖注入功能，大部分情况下使用框架的依赖注入功能就可以满足了，在一些特殊场景下，我们就需要引入第三方的注入框架。

<!--more-->

## 为什么要使用 Autofac？

如果您在之前的 dotNET Framwork 时代使用过依赖注入，那么对 Autofac 一定不会陌生，在 dotNET Core 中也可以很方便的使用 Autofac，之所以使用第三方注入框架，是因为能提供更多的功能：

* 属性注入
* 批量注入
* 动态代理的 AOP 功能

## 在 dotNET Core 中使用 Autofac

在 dotNET Core 2.x 和 3.x 中使用 Autofac 是有区别的，所以下面分别介绍在两个版本中的简单使用。

### 2.x

1、创建 dotNET Core 2.1 版本的 WebAPI 项目；
2、创建 IUserService 接口和 UserService 类

```
public interface IUserService
{
    string GetUserName();
}
public class UserService: IUserService
{
    public string GetUserName()
    {
        return "oec2003";
    }
}
```

3、创建 UserController，在构造函数中添加依赖注入

```
[Route("api/[controller]/[action]")]
[ApiController]
public class UserController: ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }
    public string GetUserName()
    {
        return _userService.GetUserName();
    }
}
```
4、添加 Autofac.Extensions.DependencyInjection 的 NuGet 引用
![](https://img.fwhyy.com/2022/202201292135859.webp)

5、修改 Startup 类的 ConfigureServices 方法

```
public IServiceProvider ConfigureServices(IServiceCollection services)
{
    services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
    //创建 Autofac 容器
    var containerBuilder = new ContainerBuilder();
    containerBuilder.Populate(services);
    //将 UserService 类作为 IUserService 的实现进行注册
    containerBuilder.RegisterType<UserService>().As<IUserService>().InstancePerLifetimeScope();
    var container = containerBuilder.Build();
    //接管内置的容器
    return new AutofacServiceProvider(container);
}
```

### 3.x

1、创建 dotNET Core 3.x 的项目和相关类，参考上面的一到四步；

2、修改 Program 类，使用 AutofacServiceProviderFactory 来替代创建服务提供程序的工厂：

```
public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .UseServiceProviderFactory(new AutofacServiceProviderFactory())
            .ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); });
```

3、修改 Startup 类，在该类中添加 ConfigureContainer 方法，和ConfigureServices 方法一样，框架也是通过命名约束来进行执行的：

```
public void ConfigureContainer(ContainerBuilder builder)
{
    builder.RegisterType<UserService>().As<IUserService>().InstancePerLifetimeScope();
}
```

## Autofac 的增强功能

下面的所有示例全部在 dotNET Core 3.1 版本中完成。

### 属性注入

dotNET Core 框架本身的依赖注入只支持构造函数和 FromSerice 的方式，Autofac 可以支持属性的注入。

使用属性注入很简单，在注册类型时调用 PropertiesAutowired 方法即可，具体步骤如下：

1、调整 UserController ，以属性的方式来定义 IUserService

```
public class UserController: ControllerBase
{
    public IUserService UserService { get; set; }
    
    public string GetUserName()
    {
        return UserService.GetUserName();
    }
}
```

2、修改 Startup 类的 ConfigureServices 方法，添加 AddControllersAsServices 方法的调用

```
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers()
        .AddControllersAsServices();
}
```

3、修改 Startup 类的 ConfigureContainer ，
```
public void ConfigureContainer(ContainerBuilder builder)
{
    builder.RegisterType<UserService>().As<IUserService>()
        .InstancePerLifetimeScope();

    var controllerBaseType = typeof(ControllerBase); 
    builder.RegisterAssemblyTypes(typeof(Program).Assembly)
        .Where(t => controllerBaseType.IsAssignableFrom(t) && t != controllerBaseType)
        .PropertiesAutowired();
}
```

* 只要在 Controller 中需要做属性注入的时候，才需要在 ConfigureServices 方法中添加对 AddControllersAsServices 方法的调用；
* PropertiesAutowired 方法添加在使用属性的注入类型中，比如上面代码是在 Controller 中使用属性，所以 PropertiesAutowired 添加对所有 Controller注册的后面；
* 如果在 UserService 类以属性的方式对 IDeptService 引用，注册的方式如下：

```
public void ConfigureContainer(ContainerBuilder builder)
{
    builder.RegisterType<DeptService>().As<IDeptService>()
        .InstancePerLifetimeScope();
    builder.RegisterType<UserService>().As<IUserService>()
        .PropertiesAutowired()
        .InstancePerLifetimeScope();
}
```

### 批量注册

其实上面的代码中已经涉及到了批量注册，就是对所有的 Controller 进行注册：

```
var controllerBaseType = typeof(ControllerBase); 
builder.RegisterAssemblyTypes(typeof(Program).Assembly)
    .Where(t => controllerBaseType.IsAssignableFrom(t) && t != controllerBaseType)
    .PropertiesAutowired();
```

* 所有的 Controller 都是继承自基类 ControllerBase，先获取基类的类型；
* 找到 Program 类所在的程序集中所有实现了 ControllerBase 的类型进行注册。

再来看另一种情况，上面例子中创建 UserServicce 服务，现在再创建 DeptService 服务类：

```
public interface IDeptService
{
    string GetDeptName();
}
public class DeptService:IDeptService
{
    public string GetDeptName()
    {
        return "产品部";
    }
}
```

修改 Startup 类的 ConfigureContainer 方法来实现批量注册：

```
public void ConfigureContainer(ContainerBuilder builder)
{
    builder.RegisterAssemblyTypes(typeof(Program).Assembly)
        .Where(t => t.Name.EndsWith("Service"))
        .AsImplementedInterfaces()
        .InstancePerLifetimeScope();
}
```

找到 Program 类所在的程序集中所有以 Service 命名的类型进行注册。更多的情况就根据实际场景举一反三了。

### 动态代理的 AOP 功能

使用动态代理的功能，需要引用 NuGet 包：Autofac.Extras.DynamicProxy，如下图：
![](https://img.fwhyy.com/2022/202201292136022.webp)

AOP 的概念这里就不在赘述，和 dotNET Core 内置的拦截器（Filter、中间件）的区别是 Autofac 的 AOP 基于业务方法而不是 HTTP。

1、创建 UserServiceInterceptor 拦截类，继承自 IInterceptor

```
public class UserServiceInterceptor:IInterceptor
{
    public virtual void Intercept(IInvocation invocation)
    {
        Console.WriteLine($"{DateTime.Now}: 方法执行前");
        invocation.Proceed();
        Console.WriteLine($"{DateTime.Now}: 方法执行后");
    }
}
```

2、修改 Startup 类中的 ConfigureContainer 方法，进行 AOP 的注册

```
public void ConfigureContainer(ContainerBuilder builder)
{
    builder.RegisterType<UserServiceInterceptor>();
    builder.RegisterType<UserService>().As<IUserService>()
        .EnableInterfaceInterceptors()
        .InstancePerLifetimeScope();
}
```

* 注册 UserServiceInterceptor 拦截器
* 注册 UserService 服务的时候调用 EnableInterfaceInterceptors 启用拦截器

3、修改 UserService 类，添加 AOP 特性标记

```
[Intercept(typeof(UserServiceInterceptor))]
public class UserService: IUserService
{
    //public IDeptService DeptService { get; set; }
    public string GetUserName()
    {
        Console.WriteLine($"{DateTime.Now}: 方法执行中");
        return "oec2003";
        //return $"oec2003({DeptService.GetDeptName()})";
    }
}
```

4、调用结果如下：
![](https://img.fwhyy.com/15915031606736.webp)

## 总结

本文算是抛砖引入，Autofac 还有许多的功能由于目前没有使用到，也就没有放到本文中，比如子容器等。具体使用 dotNET Core 框架自身的依赖注入，还是使用 Autofac，要看具体的场景了，当然两者也是可以并存的。

示例代码：[https://github.com/oec2003/DotNetCoreThreeAPIDemo/tree/master/AutofacNetCore3.1Demo](https://github.com/oec2003/DotNetCoreThreeAPIDemo/tree/master/AutofacNetCore3.1Demo)