---
title: C# ：异步编程的注意点
date: 2020-12-01T09:29:36+08:00
categories: [技术]
tags: [C#,async,await,异步]
topic: programming-language
series_chapter: "第三章 C# 并发与代码实践"
series_section: 异步与多线程
series_order: 320
---

在上一篇《C#：异步编程中的 async 和 await》 中简单介绍了在 C# 中的异步编程以及 async 和 await 编程模型，本文介绍下异步编程的注意事项，主要有以下几个方面。

<!--more-->

## 同步中调用异步

在同步代码中调用异步代码，容易导致死锁，所以在实际使用异步编程时，推荐的做法是一直异步到底。先来看一个会出现死锁的代码：

```csharp
class Program
{
    static void Main(string[] args)
    {
        while (true)
        {
            Task.Run(MethodSync);
            Thread.Sleep(100);
        }
    }
    static void MethodSync()
    {
        //string result =MethodAsync().Result;
        MethodAsync().Wait();
    }
    static async Task<string> MethodAsync()
    {
        await Task.Run(() =>
        {
            Thread.Sleep(2000);
        });

        Console.WriteLine("MethodAsync End");
        return "success";
    }
}
```

 

- Main  方法中使用 [Task.Run](http://task.Run) 进行新的任务的创建，每个间隔 100  毫秒，模拟多次请求；
- 在同步方法 MethodSync 中调用异步方法 MethodAsync；
- 同步方法中使用 .Result  或者调用 Wait() 方法进行等待；

运行上面代码，控制台会输出几次 MethodAsync End 后就会停止，这时死锁已经发生。可以观察到控制台程序使用的线程数会不断增加：

![](https://img.fwhyy.com/2022/202201290754760.webp)

发生死锁的原因是：

- 程序运行时，有一个线程 A 开始执行同步方法 MethodSync ，执行到同步方法中的 .Result 或 Wait() 时，会产生一个线程 B 进行异步方法的调用；
- 线程 A 会等着 线程 B 完成，然后线程 A 才继续执行后面的代码；
- 当并发比较大的时候，线程池的线程不够用，需要创建新的线程，创建线程的速度赶不上 Task 创建的速度的时候，就会造成堵塞，最终死锁。

只需要将 MethodSync 同步方法修改为异步就可以解决此问题：

```csharp
static async Task MethodASync1()
{
    await MethodAsync();
}
```

- 程序运行时，有一个线程 A 开始执行异步方法 MethodASync1 ，执行到 await 时，会产生一个线程 B 进行异步方法 MethodAsync 的调用；
- 线程 A 不会等着 线程 B 完成，而是会被线程池收回做其他的事情；
- 当线程 B 完成后，线程池会重新分配新的线程来进行后续的处理，所以整个过程不会有堵塞。

当然，有些时候我们需要在同步方法中调用异步方法，有下面两个方法：

- 借助这个组件来进行处理：[https://github.com/StephenCleary/AsyncEx](https://github.com/StephenCleary/AsyncEx) ；
- 使用 ConfigureAwait(false) 。

## 合理使用 void 返回值

- 使用 void 无法确定方法在什么时候调用完成，因为没有任何内容返回，不像 Task 的返回值，可以获取到相关的状态；
- 返回 void 的异步方法没有办法在调用的时候使用 await ；
- 对 void 方法进行调用时无法捕获异常。

因为上面的原因，所以我们在写代码时尽量不要在异步方法上返回 void ，但有两种情况也还是可以使用 void 返回值:

1、事件，比如在 Winform 程序中的按钮事件

```csharp
private void btnTest_Click(object sender, EventArgs e)        
{            
	await WriteLog();        
}
```

如果要将 btnTest_Click 的返回值修改为 async Task ，编译时会报错。

2、记录日志之类的方法，或者说该方法执行的操作和主任务关系不大，无需知道处理的结果时。

## 异步中的异常处理

当我们编写同步代码时，常用 try catch 来进行异常捕获，例如下面代码：

```csharp
class Program
{
    static void Main(string[] args)
    {
        try
        {
            TestException();
        }
        catch (Exception ex)
        {
            //TestException 方法抛出的异常会在这里被捕获
            Console.WriteLine(ex.Message);
        }
    }
    static void TestException()
    {
        throw new Exception("Test Exception");
    }
}
```

同样的方式对异步方法进行 try catch ，会发现 catch 中的代码并没有执行

```csharp
class Program
{
    static void Main(string[] args)
    {
        try
        {
            TestExceptionAsync();
        }
        catch (Exception ex)
        {
						//此处不会被调用
            Console.WriteLine(ex.Message);
        }
        
        Console.WriteLine("main end");
        Console.ReadLine();
    }
    static async Task TestExceptionAsync()
    {
        await Task.Delay(200);
        throw new Exception("Test TestExceptionAsync");
    }
}
```

要对异常方法进行异常捕获，必须使用 await 修饰符 、调用 Wait() 方法或者访问 Result 属性

```csharp
static async Task Main(string[] args)
{
    try
    {
        //var result = TestExceptionAsync().Result;
        //TestExceptionAsync().Wait();
        await TestExceptionAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine(ex.Message);
    }
    
    Console.WriteLine("main end");
    Console.ReadLine();
}
```

在异步方法的返回类型 Task 类中，有一个 Exception 属性，该属性返回的类型为 AggregateException ，而在 AggregateException 的内部又有一个 InnerExceptions 属性用来包装所有异常的集合。



对于使用 await 修饰符和调用 Wait() 方法、访问 Result 属性对于异常的捕获是有区别的：

### Wait 、Result

当使用Wait 或 Result 的时候，异步方法是将自身的 AggregateException 对象往上抛，这样在异常处理的时候就会比较麻烦，我们需要这样来进行异常的解析：

```csharp
static async Task Main(string[] args)
{
    try
    {
        TestExceptionAsync().Wait();
    }
    catch (AggregateException aggregateException)
    {
        foreach (var ex in aggregateException.InnerExceptions)
        {
            Console.WriteLine(ex.Message);
        }
    }
    Console.WriteLine("main end");
    Console.ReadLine();
}
```

如果直接获取 aggregateException 的 Message 属性，则会输出：

```csharp
One or more errors occurred. (Test TestExceptionAsync)
```

### await

使用 await 修饰符，发生异常的时候，抛出的不是 AggregateException 对象，而是 AggregateException 对象中的 InnerExceptions 属性中找出第一个返回，随意在使用 await 修饰符的场景下，捕获异常的写法是符合我们编程习惯的。

```csharp
static async Task Main(string[] args)
{
    try
    {
        await TestExceptionAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine(ex.Message);
    }
    Console.ReadLine();
}
```

希望本文对您有所帮助！
