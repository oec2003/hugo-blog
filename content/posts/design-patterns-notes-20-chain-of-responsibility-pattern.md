---
title: 设计模式笔记(20)—职责链模式（行为型）
date: 2010-01-27
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

使多个对象都有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系。将这些对象连成一条链，并沿着这条链传递请求，直到有一个对象处理它为止。

## 动机

在软件构建过程中，一个请求可能被多个对象处理，但是每个请求在运行时只能有一个接受者，如果显式指定，将必不可少地带来请求发送者与接受者的紧耦合。如何使请求的发送者不需要指定具体的接受者？让请求的接受者自己在运行时决定来处理请求，从而使两者解耦。

职责链模式结构图如下：

![2010-12-29_111712](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290613054.png)

代码实现：

```
/// <summary>
/// 抽象处理类
/// </summary>
public abstract class BaseHandler
{
    public BaseHandler(BaseHandler next)
    {
        this.Next = next;
    }
    public BaseHandler Next { get; set; }
    protected abstract bool CanHandleRequest(Request request);
    public virtual void HandleRequest(Request request)
    {
        if (Next != null)
        {
            this.Next.HandleRequest(request);
        }
    }
}
public class AHandler:BaseHandler
{
    public AHandler(BaseHandler next)
        : base(next)
    {

    }
    protected override bool CanHandleRequest(Request request)
    {
        return request.Name == "A";
    }
    public override void HandleRequest(Request request)
    {
        if (this.CanHandleRequest(request))
        {
            Console.WriteLine("处理A的请求");
        }
        else
        {
            base.HandleRequest(request);
        }
    }
}
public class BHandler : BaseHandler
{
    public BHandler(BaseHandler next)
        : base(next)
    {

    }
    protected override bool CanHandleRequest(Request request)
    {
        return request.Name == "B";
    }
    public override void HandleRequest(Request request)
    {
        if (this.CanHandleRequest(request))
        {
            Console.WriteLine("处理B的请求");
        }
        else
        {
            base.HandleRequest(request);
        }
    }
}
public class CHandler : BaseHandler
{
    public CHandler(BaseHandler next)
        : base(next)
    {

    }
    protected override bool CanHandleRequest(Request request)
    {
        return request.Name == "C";
    }
    public override void HandleRequest(Request request)
    {
        if (this.CanHandleRequest(request))
        {
            Console.WriteLine("处理C的请求");
        }
        else
        {
            base.HandleRequest(request);
        }
    }
}
public class Sender
{
    public Request _request;
    public Sender(Request request)
    {
        this._request = request;
    }
    public void Process(BaseHandler handler)
    {
        handler.HandleRequest(_request);
    }
}
/// <summary>
/// 请求的信息类
/// </summary>
public class Request
{
    public string Name { get; set; }
    public Request(string name)
    {
        this.Name = name;
    }
}
/// <summary>
/// 客户端程序
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        Sender sender = new Sender(new Request("A"));
        BaseHandler handler1 = new AHandler(null);
        BaseHandler handler2 = new BHandler(handler1);
        BaseHandler handler3 = new CHandler(handler2);
        sender.Process(handler3);
    }
}
```

## Chain of Responsibility模式的几个要点

* Chain of Responsibility 模式的应用场合在于“一个请求可能有多个接受者，但是最后真正的接受者只有一个”，只有这时候请求发送者与接受者的耦合才有可能出现“变化脆弱”的症状，职责链的目的就是将二者解耦，从而更好地应对变化。
* 应用了Chain of Responsibility 模式后，对象的职责分派将更具灵活性。我们可以在运行时动态添加/修改请求的处理职责。
* 如果请求传递到职责链的末尾仍得不到处理，应该有一个合理的缺省机制。这也是每一个接受对象的责任，而不是发出请求的对象的责任

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

