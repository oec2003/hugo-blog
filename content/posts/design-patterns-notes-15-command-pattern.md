---
title: 设计模式笔记(15)—命令模式（行为型）
date: 2009-12-30
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

将一个请求封装为一个对象，从而使你可用不同的请求对客户进行参数化；对请求排队或记录请求日志，以及支持可撤销的操作。

## 动机

在软件构建过程中，“行为请求者”与“行为实现者”通常呈现一种“紧耦合”。但在某些场合——比如需
要对行为进行“记录、撤销/重做（undo/redo）、事务”等处理，这种无法抵御变化的紧耦合是不合适的。在这种情况下，如何将“行为请求者”与“行为实现者”解耦？将一组行为抽象为对象，可以实现二者之间的松耦合。

先来看个反例（版本1），假设在一个应用程序中需要用到要用到很多的一些外部的类，并且要对这些类中的操作进行撤销、记录等操作，如果像下面这样实现就会很乱并且不容易实现：

```
public class Application
{
    public void Process()
    {
        Document doc = new Document();
        doc.ShowText();
        Graphics gra = new Graphics();
        gra.Draw();
        //需要进行undo 记录等操作
    }
}
public class Document
{
    public void ShowText() { }
}
public class Graphics
{
    public void Draw(){ }
}
```

要满足上面提的那些要求就需要用命令模式，命令模式结构图如下：

![2010-12-29_121609](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290617303.png)

改进后的代码（版本2），将ShowText Draw这种行为抽象起来放到一个接口中，接口命名为ICommand，并且在该接口中还有一个方法签名Undo，用来做撤销处理，当然根据需要还可以加其他的操作。ICommand代码如下：

```
public interface ICommand
{
    void Execute();
    void Undo();
}
```

Document类和Graphics类实现该接口，并提供自己的实现，代码如下：

```
public class Document:ICommand
{
    public string Name { get;set;}
    public Document(string name)
    {
        Name = name;
    }
    public void Execute()
    {
        Console.WriteLine("显示文本 "+Name);
    }
    public void Undo()
    {
        Console.WriteLine("撤销显示文本 "+Name);
    }
}

public class Graphics : ICommand
{
    public string Name { get;set;}
    public Graphics(string name)
    {
        Name = name;
    }
    public void Execute()
    {
        Console.WriteLine("画图 "+Name);
    }
    public void Undo()
    {
        Console.WriteLine("撤销画图 "+Name);
    }
}
```

客户端调用的代码：

```
public class Application
{
    public Stack<ICommand> stack=new Stack<ICommand>();
    public void Show()
    {
        foreach (ICommand cmd in stack)
        {
            cmd.Execute();
        }
    }
    public void Undo()
    {
        ICommand command = stack.Pop();
        command.Undo();
    }
}
static void Main(string[] args)
{
    Application app = new Application();
    app.stack.Push(new Document("1"));
    app.stack.Push(new Graphics("1"));
    app.stack.Push(new Document("2"));
    app.stack.Push(new Graphics("2"));

    app.Show();
    app.Undo();
    Console.ReadLine();
}
```

上面的代码运行结果如下：

![2010-12-29_121646](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290617602.png)

从结果中可以看出，最后执行的画图2 被撤销了。

在上面的代码中，像Document、Graphics这样的类都是实现了ICommand接口，如果项目中已经存在这样的类然后还要将这些类去实现ICommand接口，显然不是很合理，那么就需要添加DocumentCommand类来进行转化。完整代码如下（版本3）：

```
public class Document
{
    public void ShowText()
    {
        Console.WriteLine("显示文本 ");
    }
}
public class Graphics
{
    public void Draw()
    {
        Console.WriteLine("画图 ");
    }
}
public interface ICommand
{
    void Execute();
    void Undo();
}
/// <summary>
/// 具体化的文档命令类
/// </summary>
public class DocumentCommand : ICommand
{
    Document _doc;
    public DocumentCommand(Document doc)
    {
        _doc = doc;
    }
    public void Execute()
    {
        _doc.ShowText();
    }
    public void Undo()
    {
        Console.WriteLine("撤销显示文本 ");
    }
}
/// <summary>
/// 具体化的图像命令类
/// </summary>
public class GraphicsCommand : ICommand
{
    Graphics _gra;
    public GraphicsCommand(Graphics gra)
    {
        _gra = gra;
    }
    public void Execute()
    {
        _gra.Draw();
    }
    public void Undo()
    {
        Console.WriteLine("撤销画图 ");
    }
}
public class Application
{
    public Stack<ICommand> stack = new Stack<ICommand>();
    public void Show()
    {
        foreach (ICommand cmd in stack)
        {
            cmd.Execute();
        }
    }
    public void Undo()
    {
        ICommand command = stack.Pop();
        command.Undo();
    }
}
class Program
{
    static void Main(string[] args)
    {
        Application app = new Application();
        app.stack.Push(new DocumentCommand(new Document()));
        app.stack.Push(new GraphicsCommand(new Graphics()));

        app.Show();
        app.Undo();
        Console.ReadLine();
    }
}
```

在版本1中Application类中直接和Document中的方法相耦合，进过一步步改进后，Application类只和Document和Graphics的抽象耦合，达到了解耦的目的。

## Command模式的几个要点

* Command模式的根本目的在于将“行为请求者”与“行为实现者” 解耦，在面向对象语言中，常见的实现手段是“将行为抽象为对象”。
* 实现Command接口的具体命令对象ConcreteCommand有时候根据需要可能会保存一些额外的状态信息。
* 通过使用Composite模式，可以将多个“命令”封装为一个“复合命令”MacroCommand。
* Command模式与C#中的Delegate有些类似。但两者定义行为接口的规范有所区别：Command以面向对象中的“接口-实现”来定义行为接口规范，更严格，更符合抽象原则；Delegate以函数签名来定义行为接口规范，更灵活，但抽象能力比较弱。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

