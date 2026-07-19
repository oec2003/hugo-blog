---
title: 设计模式：面向对象的设计原则下（ISP、DIP、KISS、YAGNI、DRY、LOD）
date: 2021-12-13T08:05:00+08:00
categories: [技术]
tags: [设计模式]
topic: arch
series_chapter: 第二章 设计原则与模式
series_section: ""
series_order: 230
---

本文继续来介绍接口隔离原则（ISP）和依赖倒置原则（DIP），这两个原则都和接口和继承有关。文章最后会简单介绍几个除了 SOLID 原则之外的原则。

<!--more-->

## 接口隔离原则（ISP）

提起接口，开发人员的第一反应可能是面向对象编程语言中的 interface ，但接口更广义的理解会包含：

- 编程语言中的 interface；
- RESTful Web API 、Web Service、gRPC 等这种对外提供服务的接口；
- 类库中的公共方法。

不管是上面的哪一种，要想设计好，就需要用到接口隔离原则了。

接口隔离原则的定义是：

> 不应强迫使用者依赖于它们不用的方法。

接口被设计出来后，就会有地方对接口进行调用，调用的地方希望接口中提供的方法都是他需要的，所以在接口设计的时候，需要考虑应该将哪些方法放入其中，让调用者使用，这就是对定义的解释。

相反，如果不精心设计，接口就会变得越来越庞大，会带来两个问题：

1、在一个更高层的接口中添加一个方法只是为了某一个子类使用，所有的子类都必须对其实现，或提供一个默认实现；

2、接口中包罗万象，调用者可能会误用其中的方法。

举个例子：我们现在正在开发 SaaS 产品，里面会涉及到对租户的操作，比如租户需要注册、登录等，抽象成接口代码如下：

```
public interface ITenant
{
    public void Register(string mobile,string password);
    public void Login(string mobile,string password);
}
public class Tenant : ITenant
{
    public void Register(string mobile, string password)
    {
        throw new NotImplementedException();
    }

    public void Login(string mobile, string password)
    {
        throw new NotImplementedException();
    }
}
```

上面的操作是针对租户这个角色的，现在有新的需求来了，对于 SaaS 厂商的管理员来说，希望能禁用租户，一种偷懒的做法就是直接在 ITenant 接口中添加禁用的方法，如下：

```
public interface ITenant
{
    public void Register(string mobile,string password);
    public void Login(string mobile,string password);
    public void Diabled(string tenantCode);
}
public class Tenant : ITenant
{
    // ...
    public void Diabled(string tenantCode)
    {
        throw new NotImplementedException();
    }
}
```

上面的代码就违反了接口隔离原则，因为在普通租户的使用场景下，并不希望能调用到 Diabled 方法，正确的做法是将这个方法抽象到一个新的接口中，如下：

```
public interface ITenant
{
    public void Register(string mobile,string password);
    public void Login(string mobile,string password);

}
public interface ITenantForAdmin
{
    public void Diabled(string tenantCode);
}
```

可以看出来，改造之后，每个接口的职责更加单一了，好像跟单一职责有点类似，仔细想想，还是有些区别，单一职责原则针对的是方法、类和接口的设计。而接口隔离原则更侧重于接口的设计，另一方面就是思考的角度不同，在上面例子中，按照普通租户和管理员两种不同角色的维度来思考并进行拆分。

## 依赖倒置原则（DIP）

这个原则的名字中有两个关键词「依赖」和「倒置」，先来看看这两个词是什么意思？

依赖：在面向对象的语言中，所说的依赖通常指类与类之间的关系，比如有个用户类 User 和日志类 Log ， 在 User 类中需要记录日志，就需要引入日志类 Log，这样 User 类就对 Log 类产生了依赖，代码如下：

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

倒置：有依赖的倒置，那肯定就有正常的依赖，我们正常的编程思维都是从上而下来编写业务逻辑的，遇到分支就写 if ，遇到循环就写 for ，需要创建对象就 new 一个，就像上面的代码，上面的代码就是一种正常的依赖。User 类依赖了 Log 类，如果倒置了，那就是 User 类不再依赖 Log 类了，下面会进一步来解释。

正常的依赖会带来的问题是：User 类和 Log 类高度耦合，当有一天我们想使用 NLog 或者 Serilog 替换 Log 类时，就需要改动 User 类，说明日志类的实现是不稳定的，而依赖一个不稳定的东西，从架构设计的角度来看，不是一个好的做法。解决此问题就需要用到依赖倒置原则。

先来看看依赖倒置原则的定义：

> 高层模块不应依赖于低层模块，二者应依赖于抽象。
>
> 抽象不应依赖于细节，细节应依赖于抽象。

什么是高层模块？什么是低层模块？按照上面的代码示例，User 类是高层模块，Log 类是低层模块，二者都要依赖于抽象，就需要提取接口了：

```
public interface ILog
{
    public void Write(string message);
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

调整后的代码 User 类中依赖变成了 ILog 接口，日志的实现类 Log 也依赖 ILog 接口，即从 ILog 接口继承而来，现在都是依赖 ILog 接口，这就是依赖倒置。

当想要将日志组件替换为 NLog 时，只需要创建一个新的类 NLogAdapter 类继承 ILog 接口，在 NLogAdapter 类中引入 NLog 组件。

```
public class NLogAdapter:ILog
{
    private NLog _log=new NLog();
    public void Write(string message)
    {
        _log.Write(message);
    }
}
```

这样，当日志组件替换的时候，User 类就不用修改了，因为 User 类的构造函数中使用的是 ILog 接口来接收的日志组件的对象，那到底是谁决定传递 Log 对象还是 NLogAdapter 对象呢？这就要引入一个新的概念叫「依赖注入」。

关于依赖注入可以看我之前写的两篇文章：

- [dotNET Core 3.X 依赖注入](http://mp.weixin.qq.com/s?__biz=MzU0NjgzNzQyMw==&mid=2247484156&idx=1&sn=37a775c199b3fe2f7ffe4ff6e7a0eef6&chksm=fb56c43ccc214d2a3e05dfd449d93e232152c72b2018e221cc5c633fb5048691b521635c7f51&scene=21#wechat_redirect)
- [dotNET Core 3.X 使用 Autofac 来增强依赖注入](http://mp.weixin.qq.com/s?__biz=MzU0NjgzNzQyMw==&mid=2247484167&idx=1&sn=7569214353422a8cfff8acbdba352ceb&chksm=fb56c5c7cc214cd1b90528f3686a5c8f1e0e19eb777ef45dc2ff2ab4bd6d00840719a3c3858a&scene=21#wechat_redirect)

依赖倒置是一种架构设计思想，指导架构层面的设计，依赖注入则是一种具体的编码技巧，用来实现这种设计思想。

## 其他原则

除了 SOLID 五大原则之外，还有一些原则也在指引我们设计好的代码架构方面发挥着作用：

- KISS
- YAGNI
- DRY
- LOD

### KISS

KISS 的全称是：Simple and Stupid ，该原则就是告诉我们，在设计时要尽量保持简单，大道至简嘛。这里的简单不完全是指代码的简洁。现在已经不是单打独斗的时代，大部分情况下开发人员都是在一个团队中协同工作，所以我认为对简单的理解可以分为：

- 代码的可读性要强，团队要遵循一定的规范；
- 不要使用一些你认为很“高深”的技巧，应该使用团队都熟知或者较为广泛的编码方式；
- 避免过度设计，一个很简单的逻辑或者一些一次性的业务为了秀技术而设计的非常复杂是大可不必的。

将复杂的东西能够深入浅出，做到简单、简洁，这是能力的体现。

### YAGNI

YAGNI 的全称是：You Ain’t Gonna Need It。直译就是：你不会需要它。核心思想就是指导我们不要做过度设计。

1、当我们能识别到代码的变化点的时候，可以预留扩展点，但不要提前做复杂的实现；

2、持续重构来优化代码，而不是一开始就提取各种通用方法，例如一个私有函数只有一个调用的时候，就放在类里面，离调用者最近的地方，当有不止一处都会使用时，再考虑重构来进行通用方法的抽取。

过度设计会浪费资源，让代码复杂度变大，难以阅读和维护。

### DRY

DRY 的全称是：Don’t Repeat Yourself ，就是不要重复自己，提升代码的复用性，告别 CV 大法。

很多初级程序员都喜欢面向 Ctrl+C、Ctrl+V 编程，当需求变化的时候，很容易就遗漏一些场景，但即便是复制粘贴也不完全都是违反 DRY 。

代码的重复有两种情况：

1、代码的逻辑重复，语义也重复：这种违反了 DRY ，需要进行重构；

2、代码的逻辑重复，语义不重复：在某个阶段，两段代码逻辑是相同的，但其实是两种不同的应用场景，语义不一样，就没有违反 DRY。如果对这种代码进行重构提取成公共方法，随着业务发展，两种不同的场景独立演化了，稍不注意，代码中就会出现各种 if 判断，影响可读性和可维护性。

### LOD

LOD 全称是：The Least Knowledge Principle ，也被称之为迪米特法则。该法则有两条指导原则：

1、不该有直接依赖关系的类之间，不要有依赖；

2、有依赖关系的类之间，尽量只依赖必要的接口。

其实就是一直流传的代码要高内聚、低耦合，单一职责和接口隔离想要表达的也是这个意思，区别只是侧重点有所不同：

- 单一职责：针对的是方法、类和接口的设计，关注的是方法、类本身；
- 接口隔离：针对的是接口拆分、关注的是调用者的角色；
- 迪米特：关注类之间的关系。

各种原则之间相辅相成，有很多只是有些细微的差别，慢慢理解原理，才能以不变应万变。
