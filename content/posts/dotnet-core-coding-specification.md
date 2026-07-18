---
title: dotNET Core：编码规范
date: 2020-09-14T09:44:15+08:00
categories: [技术]
tags: [dotNET Core,规范]
---

在项目开发过程中，由于时间紧、任务重，很容易导致面向功能编程。实现相同的功能，代码可以写的很优雅，也可以写的很晦涩和复杂。现在的工作，都需要进行团队协作，代码就需要有一定的规范进行指引，因为我们需要写出让人可以轻易读懂的代码，而不仅仅是机器。

<!--more-->

规范没有绝对的标准，遵循大部分人都认可的一种方式就可以了，保持统一。比如在 dotNET Core 中，我们可以参考下 dotNET Core 的源码，最终制定一个适合团队的规范即可。

下面是我理解的正确的一些规范：

## 基本准则

1、命名的规范分为两种：Pascal（大驼峰）和驼峰（小驼峰），示例如下:

• Pascal：UserName
• 驼峰：userName

2、命名要有意义，需要看到名称知其含义。少用拼音和匈牙利命名法。

| 示例                                     |   |
|----------------------------------------|---|
| Int price=20;                          |  √ |
| UserInfo userInfo=GetUserInfo(userId); |  √ |
| Int p=20;                              |  × |
| Int intPrice=20;                       |  × |

3、对于类的成员变量，用this关键字，增强代码可读性。
4、对于基类的成员变量，用base关键字，增强代码可读性。


## 名称规范

好的名称可以让我们减少很多不必要的注释，可以让代码阅读者很容易就理解代码的意思。但命名不是一件容易的事情，在命名的时候，通常伴随着我们对代码逻辑的思考。比如：如果你不能给一个函数很准确地命名，那可能这个函数的职责不单一，做的事情太多，才导致一个名称很难概括，意味着代码可能需要重构。好的命名是我们写好代码的基础。

### 命名空间

命名空间采用Pascal命名法：

```
namespace Fw.Application{}
namespace Fw.SmartFlow.Acitivity{}
```

实际工作中，我们会将很多逻辑上属于同一类的文件，在物理上分成不同的目录，这时建议修改命名空间为相同的命名空间。

### 类

类采用Pascal命名法：

```
public class UserService{}
```

类是对属性和方法的封装，类有很多的种类：

* 跟数据库表对应的实体类
* 处理业务逻辑的业务类
* 提供扩展方法的扩展类
* 接口层的数据传输类

不同的种类可以约定俗成地进行一些名称的约束，比如扩展类用 Extension 结尾、接口层的使用 Request、Response 结尾，等等，这样在阅读代码是就知道什么类型的职责是什么。

### 接口

接口采用大写I+Pascal命名法：

```
public interface IUserService{}
```

### 方法

方法采用Passcal命名法：

```
public string GetUserName(){}
```

方法的命名需要比较具体，越抽象的名称越难以理解。例如，InitData() 就是一个不太好的名称，改成 InitConfiginfo() 会更好些。另外，方法的命名在同一类型的语义下要保持一致，在一些项目中看到查找类的方法，有 GetXXX、QueryXXX、FindXXX 等等。五花八门的方式会提升阅读的成本。

### 变量

变量分为：类变量、静态类变量、只读变量、静态只读变量、方法变量。

类变量：

```
private string _userName;
```

类变量只能使用 private 修饰符，如果需要暴漏出去，或是给子类使用，使用属性来进行封装。

静态类变量、只读变量、静态只读变量：

```
private static readonly ResourceManager _resourceManager;
public static readonly IRouter Instance = new MockRouter();
```

• 修饰符为 private: _ + 驼峰命名法；
• 修饰符为 public: Pascal 命名法；
• 修饰符为 protected：Pascal 命名法；

方法变量：

```
bool isCheck;
```

### 常量：

常量采用Pascal命名法：

```
public const string AuthorizationFilter = "Authorization Filter";
```

### 属性：

属性采用 Pascal 命名法：

```
public BasicApiContext DbContext { get; }
```

### 参数

参数采用驼峰命名法：

```
public List<BizApp> GetBizAppList(string userId,DeviceType deviceType)
```

## 注释规范

注释是一把双刃剑，当代码中存在大量的注释的时候，我们第一反应会先看注释，并会默认注释中写的内容是对的，真实情况是注释往往会给我们错误的指导。有两个原因：

* 当代码逻辑放生变化时，只修改了代码，注释没有调整；
* 不同的人员都对注释进行编辑，慢慢注释会变得和代码不匹配。

Martin Fowler 在他的经典书籍 《重构》 中也提到过多的注释是一种坏味道的体现，他认为，当你觉得需要写注释的时候，应该先想想是不是可以进行重构。那是不是程序中就不应该出现注释呢？当然不是，我认为下几种情况是需要写注释的：

* 时间紧急，临时写的一些 ”烂代码“，需要写注释，说明原因，一般需要加上 TODO ；
* 复杂算法类的方法，可以写注释说明逻辑；
* 写的是偏底层的类库，对外暴露的方法需要写注释，调用方能方便在智能提示中显示；
* 如果你的能力写不好代码，那还是先把注释写上吧。

## 异常规范

* 异常的目的是用来报告错误，这也是他的唯一目的，所以避免在返回值中来返回错误信息，所有的地方都应该使用抛异常的方式来报告错误；
* 使用抛异常的方式可以防止错误的操作继续执行；
* 要能够预估到会出现什么异常，知道是什么类型的异常，才 Try 住做相关的处理；
* 最终用户友好和对开发者友好；
* 暴漏问题比隐藏问题要好，隐藏问题只会导致更严重的问题。

详细的异常处理可以参考之前的文章：

* dotNET：怎样处理程序中的异常（理论篇）？
* dotNET：怎样处理程序中的异常（实战篇）？

## 空行规范

空行规范是一个很简单的规范，就是在每个方法中，代码应该按照不同逻辑的逻辑块进行分割显示，虽然简单，但如果不注意，还是会对代码的阅读带来很大的障碍。下面看看 dotNET Core 的源码 CreateDefaultBuilder 方法：

```
public static IHostBuilder CreateDefaultBuilder(string[] args)
{
    var builder = new HostBuilder();

    builder.UseContentRoot(Directory.GetCurrentDirectory());
    builder.ConfigureHostConfiguration(config =>
    {
        config.AddEnvironmentVariables(prefix: "DOTNET_");
        if (args != null)
        {
            config.AddCommandLine(args);
        }
    });

    builder.ConfigureAppConfiguration((hostingContext, config) =>
    {
        var env = hostingContext.HostingEnvironment;

        config.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
              .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true);

        if (env.IsDevelopment() && !string.IsNullOrEmpty(env.ApplicationName))
        {
            var appAssembly = Assembly.Load(new AssemblyName(env.ApplicationName));
            if (appAssembly != null)
            {
                config.AddUserSecrets(appAssembly, optional: true);
            }
        }

        config.AddEnvironmentVariables();

        if (args != null)
        {
            config.AddCommandLine(args);
        }
    })
    .UseDefaultServiceProvider((context, options) =>
    {
        var isDevelopment = context.HostingEnvironment.IsDevelopment();
        options.ValidateScopes = isDevelopment;
        options.ValidateOnBuild = isDevelopment;
    });

    return builder;
}
```

想想看，上面代码中如果去掉空行会读起来是什么样的感受？

## 日志规范

在一个完整的系统中，日志非常的重要。在 dotNET Core 中自带了日志功能，当然我们也可以使用第三方的 NLog、Serillog 等。

这些日志框架都提供日志级别功能，比如：INFO、DEBUG、WARN 和 ERROR 等，这些级别对程序出错时的排查非常有用，所以在记录日志时一定不要都使用 INFO 或者都使用 ERROR 了。

除了级别，日志的类型有这么几类：

* 操作日志
* 业务日志
* 错误日志

### 操作日志

系统中所有的操作的都记录下来，包括登录、数据的增删改等，主要用来做审计，数据异常操作时的追责等。

随着时间的推移，日志的数据量会越来越大，所以需要考虑存储的方式，比如阶段性地将历史日志进行存档。

### 业务日志

用户在界面中输入数据，点击一个按钮，程序中会进行一系列的处理最终返回结果给用户，在这个过程中对一些关键的业务信息进行记录，可以在系统出现问题时方便排查和追踪。

### 错误日志

错误日志的主要目的就是排错，所以记录的信息一定要是对排错有帮助的信息，尽可能地记录详细，比如整个堆栈信息、调用链等。比如，你去进行错误排查时，发现记录的信息是”未将对象引用到对象的实例“，你依然不知道错误的原因是什么。

## 总结

谈及代码的时候，都会去聊架构、模式，这些固然重要，但编码习惯和规范也不可小视。一份产品的代码怎样才能变得越来越好，这需要团队每个人成员共同的努力，一个人掉链子，很容易就形成破窗效应，导致坏味道越来越多。

写好的代码，是每个有追求的技术人的使命和职责。

希望本文对您有所帮助。