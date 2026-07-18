---
title: 书籍推荐：《More Effective C#》
date: 2019-06-24T06:31:53+08:00
categories: [读书]
tags: [C#,读书,书籍推荐]
---

很多年前看过Bill Wagner的《Effective C#》第一版，涵盖了C#2.0相关语言特性的最佳实践，教我们怎样更优雅地去编写C#代码，当时觉得受益匪浅。最近拿到了《More Effective C#》第二版，目前看了大概三分之二，让我对C#的的应用有了更深入的了解，书虽没看完，但还是要推荐一下。

<!--more-->

《More Effective C#》第二版涵盖到了C#7.0的特性，全书分为5个大的章节，类型处理、API设计、异步编程、并行处理和动态编程，我觉得深入理解前三章便能让您在工作中如虎添翼，学习和了解C#中的一些特性，并且能知道在什么场景下使用这些特性，真正做到了知其然也知其所以然。

只要涉及到编程，总会回归到各种数据类型的操作，怎样合理的使用数据类型，怎样避免一些陷进，这些在第一章中都会涉及到，比如在判断两个对象相等有下面一些原则：

* 静态版本的Object.RefeerenceEquales()和Object.Equals() 不需要进行重载
* 自己创建的值类型，需要重写实例方法Equals()，并重载==运算符，可以提升性能，因为基类中的Equals方法是通过反射来实现的
* 自己创建的引用类型，如果你需要按照内容来进行判断，则需要重写实例方法Equals
* 重写Equals，一定要让其满足：自反性、对称性和可传递性

不只是给出了实践的方法，更是说清楚了其中的原委。

一个有追求的程序员，一定不甘心每天只做CRUD，随着经验的增长，您可能需要去编写更下游的程序，需要提供安全、好用、可扩展的方法或接口供上游调用，即便您只是写写WebAPI，依然会被各种端去调用，第二章的API设计会让您少走很多弯路。

比如我们平时在设计类时，碰到需要做拷贝的，就会很自然想到去实现ICloneable接口，书中告诉了我们为什么不要去实现ICloneable接口，以及什么情况下可以去实现ICloneable接口。

还有，在调用.NET一些底层方法时，有时会出现很多的重载版本，那么在我们写代码时，会去借鉴，也会写出有很多重载版本的方法。书中建议我们在初次设计方法时，可以利用可选参数和命名参数来设计方法的参数，可以减少方法的重载版本，但发布后，如果有调整，建议添加重载版本。

第三章讲述了怎样使用异步编程，内容虽然不是很多，但如果您已经使用过异步编程，这些会让您理解更加深刻。下面举一个小例子。

在C#7中加入了本地方法的特性，可以让我们在方法的内部写方法，代码如下：

```
static void LocalMethod()
{
    string name = "oec2003";
    string name1 = "oec2004";

    Console.WriteLine(AddPrefix(name));
    Console.WriteLine(AddPrefix(name1));
    
    string AddPrefix(string n)
    {
        return $"Hello {n}";
    }
}
```

可能您知道有这么一个特性，但并不知道该什么时候用，在不知道的情况下，为了去使用某个特性，可能出现滥用。书中给出了该特性的一个应用场景。看下面一段示例代码：

```
public Task<string> LoadMessage(string userName)
{
    if (string.IsNullOrWhiteSpace(userName))
    {
        throw new AggregateException(message: "username is null");
    }
    return LoadMessageImpl();

    async Task<string> LoadMessageImpl()
    {
        var name = await LoadMessageAsync();
        var message = name ?? "No Message";
        return message;
    }
}
Task<string> LoadMessageAsync()
{
    var task = Task.Run(() =>
    {
        Thread.Sleep(5000);
        return "oec2003";
    });
    return task;
}
```

* 上面代码中LoadMessage方法是被外部调用的方法，该方法没有带async修饰符
* 异步逻辑写在LoadMessageImpl这个本地方法中
* 在LoadMessage中只做一些参数的校验工作，然后对有async修饰符的本地方法LoadMessageImpl进行调用
* 好处是，如果LoadMessage方法的参数有问题，可以提前抛出异常，而不是等待异步方法执行时

本文是我阅读到现在的一个最直观的感受，书中的内容我在理解、消化并进行实践后会继续分享出来。总之，好书是需要反复阅读的，直到看到某一小节的名称便能说出它的来龙去脉，才是真正的掌握。

