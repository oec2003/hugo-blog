---
title: dotNET Core 3.X 依赖注入
date: 2020-06-01T11:57:32+08:00
categories: [技术]
tags: [dotNET Core,依赖注入]
---

如果说在之前的 dotNET 版本中，依赖注入还是个比较新鲜的东西，那么在 dotNET Core 中已经是随处可见了，可以说整个 dotNET Core 的框架是构建在依赖注入框架之上。本文讲解下对 dotNET Core 中依赖注入的理解。

<!--more-->

## 什么是依赖

在面向对象的语言中，所说的依赖通常指类与类之间的关系，比如有个用户类 User 和日志类 Log ， 在 User 类中需要记录日志，就需要引入日志类 Log，这样 User 类就对 Log 类产生了依赖，代码如下：

```
public class User
{
    private Log _log=new Log();
    public string GetUserName()
    {
        _log.Write("获取用户名称");
        return "oec2003";
    }
}
public class Log
{
    public void Write(string message)
    {
        Console.WriteLine(message);
    }
}
```

或者直接在类的方法中对其他类进行了依赖，如下：

```
public class Dept
{
    public string GetDeptNameByUserId(string userId)
    {
        return "开发部";
    }
}
public string GetUserFullName(string userId)
{
    Dept dept=new Dept();
    return $"oec2003({dept.GetDeptNameByUserId(userId)})";
}
```

这样的类与类之间的直接依赖有如下几个问题：

* 要换一种 Log 的实现方式，所有引用的地方都要进行修改；
* 如果整个项目中到处都是这种类与类之间的强关联，代码维护会变得非常困难；
* 对单元测试不友好。

要解决上面的问题，需要将依赖的类抽象成接口，不直接依赖具体的实现类类，而是依赖接口，这就是面向对象的六大原则中的依赖倒置原则：高层模块不应该依赖于底层模块，二者都应该依赖于抽象；抽象不应该依赖于实现细节，实现细节应该依赖于抽象。

User 类调整后的代码如下：

```
public interface ILog
{
    void Write(string message);
}
public class Log:ILog
{
    public void Write(string message)
    {
        Console.WriteLine(message);
    }
}
public class User
{
    private ILog _log;

    public User(ILog log)
    {
        _log = log;
    }
    public string GetUserName()
    {
        _log.Write("获取用户名称");
        return "oec2003";
    }
}
```

* 创建了 ILog 接口；
* User 类调整为对 ILog 的依赖；
* 在 User 中类添加构造函数，在构造函数中传入接口 ILog 的实例。

那么构造函数中的实例什么时候创建呢？这时就需要用到注入了。

## 什么是注入？

在上面示例中，注入就是在某个时机，将 ILog 的实例传递到 User 类的构造函数中，而 User 类中根本就不关心 ILog 的实现。在 dotNET Core 中提供了一个内置的服务容器 IServiceProvider，然后在 Startup 类的 ConfigureServices  方法中进行注册，注册代码如下：

```
public void ConfigureServices(IServiceCollection services)
{
    services.AddSingleton<IUser, User>();
    services.AddSingleton<ILog, Log>();
    services.AddControllers();
}
```

* 上面代码中是以单例的模式进行注册；
* 将原来在 User 类中的对 Log 类的直接依赖，转移到了 ConfigureServices 方法中，这便是控制反转（IoC）了，Log 类采用什么实现，不在 User 类中来控制，而是转移到了框架层面。

借助框架的依赖注入，相比较我们自己在类中互相关联依赖地去创建对象有以下好处：

* 方便管理类之间的依赖，对我们使用面向对象的设计原则有帮助；
* 代码有更好的维护性和扩展性；
* 可以方便管理各个对象的生命周期。

## 依赖涉及的核心类

在 dotNET Core 中使用内置的依赖注入需要引入 `using Microsoft.Extensions.DependencyInjection;`i 命名空间。相关的几个核心类型如下：

* IServiceCollection：利用此类的扩展方法进行服务的注册；
* IServiceProvider：由 IServiceCollection 创建的依赖注入容器体现为，IServiceProvider 接口；
* ServiceDescriptor：具体注册的服务的描述，IServiceProvider 就是通过这个描述来构建我们需要的服务实例；
* ServiceLifetime：一个服务生命周期的枚举，有 Singleton、Scoped、Transient 三种类型。

## 服务注册的生命周期

服务注册的生命周期有三种：

* Singleton：单例模式，创建在全局的 IServiceProvider 的根容器上；
* Scoped：范围模式，用 Scope 注册的对象，在同一个 ServiceProvider 的 Scope 下相当于单例；
* Transient：瞬时模式，每次从容器获取对象时都是得到的一个全新的对象。

下面用一个示例来看下这三种不同生命周期的区别
1、创建分别代表不同生命周期的接口和类，代码如下：

```
public interface ISingletonService{}
public interface IScopedService{}
public interface ITransientService{}

public class SingletonService:ISingletonService{}
public class ScopedService:IScopedService{}
public class TransientService:ITransientService{} 
```

2、在 Controller 中创建接口方法：

```
[HttpGet]
public void GetService([FromServices]ISingletonService singleton1,
    [FromServices]ISingletonService singleton2,
    [FromServices]IScopedService scoped1,
    [FromServices]IScopedService scoped2,
    [FromServices]ITransientService transient1,
    [FromServices]ITransientService transient2
  )
{
    System.Console.WriteLine($"singleton1:{singleton1.GetHashCode()}");
    System.Console.WriteLine($"singleton2:{singleton2.GetHashCode()}");
    System.Console.WriteLine($"scoped1:{scoped1.GetHashCode()}");
    System.Console.WriteLine($"scoped2:{scoped2.GetHashCode()}");
    System.Console.WriteLine($"transient1:{transient1.GetHashCode()}");
    System.Console.WriteLine($"transient2:{transient2.GetHashCode()}");
}
```

3、连续调用两次该接口，输入如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300632605.jpg)

测试示例中每个不同生命周期的对象都通过 FromServices 的方式注入了两次，分析结果如下：

* Singleton：两次请求的四个对象都相同；
* Scoped：相同请求的两个对象是一致，重新请求会生成新的对象；
* Transient：两次请求的四个对象都不相同，每次都构建新的对象。

## 总结

* 依赖注入的目的是为了解耦；
* 不依赖于具体类，而是依赖抽象类或者接口，这叫依赖倒置；
* 把服务的注册和实例化的工作交给 dotNET Core 框架，而不是在具体实现类中处理，这个叫控制反转即IoC (Inversion of Control)

就先写到这儿了，dotNET Core 框架本身的依赖注入功能已经比较强大，但还是有些功能不能满足，需要引入第三方的注入框架，关于如何引入第三方依赖注入框架以及为什么要用第三方依赖注入框架，后面单独开篇写。

示例代码：[https://github.com/oec2003/DotNetCoreThreeAPIDemo/tree/master/InjectDemo](https://github.com/oec2003/DotNetCoreThreeAPIDemo/tree/master/InjectDemo)
