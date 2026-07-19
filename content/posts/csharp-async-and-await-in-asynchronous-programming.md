---
title: C#：异步编程中的 async 和 await
date: 2020-11-16T09:59:19+08:00
categories: [技术]
tags: [C#,async,await,异步]
---

async 和 await 在 C# 5.0 就已经引入了，用来处理异步编程，但之前用的相对较少，现在在 dotNet Core 时代，已经使用的非常普遍，很多的开源组件中提供了大量的后缀为 Async （异步）的方法。本文就简单讲讲 async 和 await。

<!--more-->

## 同步和异步概念

异步是相对于同步来说的，同步是指多个方法顺序执行，后一个会等待前一个执行完成后，才开始执行；异步是指调用一个方法 A ，调用后会立即返回（不用等方法 A 执行完成），接着调用后面的方法 B，举个例子：

* 同步：你需要还原数据库来调试一个问题，还原数据库需要十分钟，还原的过程中你一直等着，等数据源还原完成后，写代码连接数据库进行代码调试；
* 异步：数据库开始还原时，你可以去分析代码，中间间隔一段时间检查数据库是否还原完成，如果完成，写代码进行调试。

## 异步解决的问题

* 在 Winform 等富客户端程序中可以让 UI 线程避免阻塞；
* 高效处理 IO 密集型任务和 CPU 密集型任务；
* 处理执行时间比较长的操作（比如：文件转换等）。

## 实现异步的一些方式

* 在 .NET 2.0 时代使用 BeginInvoke、EndInvoke 和回调的方式实现；
* 将一些耗时的操作写成同步的方法，然后起一个新的线程或 Task 进行调用；
* 使用 async 和 await 的异步编程模型；
* 使用消息队列。

## Task

在 Task 出来之前，使用的比较多的就是多线程，最经典的问题就是在 Winform 程序中为了能让界面中显示进度之类的动态内容时，需要创建一个新的线程来做，这样主 UI 线程才不会被堵塞卡死，例如下面的代码：

```c#
private void btnTest_Click(object sender, EventArgs e)
{
    Thread thread = new Thread(new ThreadStart(DoWork));
    thread.Start();
}
private void DoWork()
{
    for (int i = 0; i < 100; i++)
    {
        Thread.Sleep(100);
        this.Invoke(new Action<string>(this.ChangeLabel),i.ToString());
    }
}
private void ChangeLabel(string i)
{c
    label1.Text = i + "/100";
}
```

上面代码中的 DoWork 方法的 Thread.Sleep(100)， 真实情况可能是一个耗时操作，那么这个线程会处于阻塞状态，直到结果返回，会影响性能和造成资源浪费。

在 C# 5 中引入了 Task，一个任务对象，用来实现异步编程，Task 是基于线程池，线程池避免了启动和终止线程的开销，也避免了创建太多的线程，防止系统将大量的时间耗费在线程的切换上。主线程结束后，所有的 Task 任务也将结束。下面是使用 Task 实现和上面相同的功能。

```c#
private void btnTest_Click(object sender, EventArgs e)
{
    Task.Run(() =>
    {
        for (int i = 0; i < 1000; i++)
        {
            this.Invoke(new Action(() => {
                label1.Text = i.ToString();
            }));
            Thread.Sleep(10);
        }
    });
}
```

通常我们会使用 Task.Run 来开始执行一个任务，在 Run 方法中传入一个委托，可以是 Action 或者 Func、一旦 Run 方法调用，委托代码会立即执行。

当有多个 Task 任务的时候，可以使用 Task.WaitAll 或 Task.WaitAny 等待一个或多个任务的完成，才让主线程继续。下面例子使用 WatiAll 进行等待：

```c#
static void Main(string[] args)
{
    Console.WriteLine("start"); 
    Task task1= Task.Run(() =>
    {
        Thread.Sleep(2000); 
        Console.WriteLine("task1");
    });
    Task task2=Task.Run(() =>
    {
        Thread.Sleep(3000); 
        Console.WriteLine("task2");
    });
    Task.WaitAll(task1,task2);
    Console.WriteLine($"task1 task2已经执行完成");
    Task task3=Task.Run(() =>
    {
        Thread.Sleep(5000); 
        Console.WriteLine("task3");
    });
    
    Console.WriteLine("end"); 
    Console.ReadLine();
}
```

执行结果如下：
![](https://img.fwhyy.com/2022/202201290759107.webp)

当把上面代码中的 WaitAll 换成 WaitAny ,可以看出当 task1 执行完成后等待就结束了，调用结果如下：
![](https://img.fwhyy.com/2022/202201290759870.webp)

## async 和 await

async 和 await 是 C# 的语法糖，用来简化异步编程模型，首先来看下 async 和 await 的代码结构。

### 结构

```c#
class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("start");
        Test1Async();
        Console.WriteLine("end");

        Console.ReadLine();
    }
    static async void Test1Async()
    {
        await Task.Delay(3000);
        Console.WriteLine("Test1");
    }
}
```

* 方法以 Async 结尾，这是一种约束，并不强制要求，但通常会这么做；
* 方法添加 async 标识符，对于 async 标识符有下面几点需要说明：
    * async 只是表明这个方法中可能有异步调用，并不能表示这个方法就是异步方法；
    * async 是一个专门给编译器的提示，意思是该函数的实现可能会出现await；
    * async 唯一的用处是给await提供上下文，做向下兼容的；
    * 如果函数被标记为 async，函数体内部的 await 才会被解释成关键字，而不会当成是一个函数，所以说当方法中有使用 await 关键字调用异步方法，所在的方法必须使用 async；
    * async不是函数声明的一部分，仅仅是一个标识符，从调用者的角度来看，不存在async。
*  在方法的内部使用 await 关键字，只要是返回 Task 对象的方法就可以使用 await，如果没有 await，那么有 async 标识符的方法就相当于是一个同步方法。

上面的代码中在 Task.Delay(3000); 前面添加了 await 关键字，会发现最后的执行结果为：
![](https://img.fwhyy.com/2022/202201290759689.webp)

说明添加 await 关键字之后会进行等待，就让会等待，就变成和同步一样了吗？答案当然不是：

* await 关键字后面的调用会再单独的线程中；
* 如果是多个异步方法调用会同步进行，看下面的示例

```c#
    static async Task Main(string[] args)
    {
        Stopwatch watch  =Stopwatch.StartNew();
        Console.WriteLine("start"); 
        Task<string> task1= Test1Async();
        Task<string> task2= Test2Async();
        Console.WriteLine("end");
        
        Console.WriteLine($"{task1.Result},{task2.Result}");
        watch.Stop();
        Console.WriteLine($"运行时间：{watch.ElapsedMilliseconds/1000} 秒");

        Console.ReadLine();
    }
    static async Task<string> Test1Async()
    {
        await Task.Delay(3000);
        return "test1";
    }
    static async Task<string> Test2Async()
    {
        await Task.Delay(3000);
        return "test2";
    }
}
```

运行结果如下：

![](https://img.fwhyy.com/2022/202201290759181.webp)

* Test1Async 和 Test2Async 中都延迟了 3 秒，但最终也只花了 3 秒；
* 使用异步方法的 Result 属性或者调用 Wait() 方法，会进行阻塞。

### 返回值

使用 async 标记的异步方法可以有四种类型的返回值：

* void
* Task
* Task<T>
* ValueTask<T>

#### void 

不推荐使用，有下面几个原因：

* 因为使用 void 无法确定方法在什么时候调用完成；
* 返回 void 的异步方法没有办法在调用的时候使用 await ；
* 无法处理异常。

#### Task

没有返回值的异步方法，我们应该返回 Task：

* 可以使用 Task 定义的变量来接收方法的返回值，该变量可以作为参数进行传递；
* 方法在调用时可以使用 await 关键字；
* 可以捕获状态，看下面例子：

```c#
class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("start"); 
        Task task1= Test1Async();
        Console.WriteLine($"是否完成：{task1.IsCompleted}");
        task1.Wait();
        Console.WriteLine($"是否完成：{task1.IsCompleted}");
        Console.WriteLine("end");
        Console.ReadLine();
    }
    static async Task Test1Async()
    {
        await Task.Delay(3000);
        Console.WriteLine("test1");
    }
}
```

执行结果：

![](http://fwhyy.com/img/post/2020/16054127448068.jpg)

#### Task<T>

当异步方法需要返回一个值，给后面的步骤使用的的时候，就使用 Task<T> ，在调用的时候使用 Result 属性进行值的获取。

#### ValueTask<T>

ValueTask<T> 是在 C#7.1 中推出的一种类型，使用 ValueTask<T> 比 Task<T> 更高效，该类型是一个 struct ，为值类型，在栈上分分配，不像 Task 是个 class ，频繁地分配和回收会对 GC 造成很大的压力。正因为 ValueTask<T> 是个 struct ，在功能上要弱于 Task。 如果你的异步方法可以根据早前缓存的结果直接返回相应的值，应该使用 ValueTask<T> 。

希望本文对您有所帮助。