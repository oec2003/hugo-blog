---
title: 设计模式笔记(7)—适配器模式（结构型）
date: 2009-11-26
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

将一个类的接口转换成客户所希望的另一个接口。适配器模式使得原本由于接口不兼容而不能一起工作的那些类可以一起工作。

## 动机

在软件系统中，由于应用环境的变化，常常要将“一些现存的对象”放在心的环境中应用，但是新环境要求的接口是这些现存对象所不满足的。

适配的意思是在不改变原有实现的基础上，将原先不兼容的接口转换为兼容的接口。在我们的生活中有着很多适配器的例子，笔记本的电源适配器、一些卡的USB读卡器等等。

在Gof23这本书中将适配器模式分成了两种：对象适配器和类适配器

对象适配器

![2010-12-29_140647](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201281852658.png)

上图中的Target是客户所期待的，希望去使用的类或接口。Adaptee是被适配的对象。Adapter为适配的对象。首先将上图中的结构还原成代码，如下：

```
/// <summary>
   /// 客户要使用的类
   /// </summary>
   public abstract  class Target
   {
       public abstract void Request();
   }

   /// <summary>
   /// 被适配的类
   /// </summary>
   public class Adaptee
   {
       public void SpecificRequest()
       { 

       }
   }

   /// <summary>
   /// 适配对象
   /// </summary>
   public class Adapter : Target
   {
       private Adaptee adapee = new Adaptee();

       public void Request()
       {
           adapee.SpecificRequest();
       }
   }

   /// <summary>
   /// 客户程序
   /// </summary>
   public class App
   {
       static void Main(string[] args)
       {
           Target target = new Adapter();
           //对客户来说是调用的Request，实际上是调用的SpecificRequest
           target.Request();
       }
   }
```

接着根据上面的思路来看一个实际例子，我们要来实现一个对栈的操作，有一个IStact接口，里面有三个方法Push(进栈)、Pop(出栈)和GetTopItem(取最顶层元素)，这个IStact接口将相当于上面的Target，想要实现进栈出栈的操作，如果自己去实现数据结构显得比较麻烦，在此可以将net提供的ArrayList类拿来一用，ArrayList类就是被适配的对象，相当于上面的Adaptee。在写一个适配类StactAdapter类完成功能就可以了。

```
/// <summary>
/// 栈的接口
/// </summary>
public interface IStack
{
    void Push(object item);
    void Pop();
    Object GetTopItem();
}
/// <summary>
/// 对象适配器
/// </summary>
public class StactAdapter:IStack
{
    ArrayList list;
    /// <summary>
    /// 构造函数中实例化ArrayList
    /// </summary>
    public StactAdapter()
    {
        list = new ArrayList();
    }
    /// <summary>
    /// 进栈
    /// </summary>
    /// <param name="item">压入栈的元素</param>
    public void Push(object item)
    {
        list.Add(item);
    }
    /// <summary>
    /// 出栈
    /// </summary>
    public void Pop()
    {
        list.RemoveAt(list.Count - 1);
    }
    /// <summary>
    /// 取最顶层的元素
    /// </summary>
    /// <returns></returns>
    public Object GetTopItem()
    {
        return list[list.Count - 1];
    }
}
/// <summary>
/// 客户调用
/// </summary>
public class App
{
    static void Main(string[] args)
    {
        IStack myStack = new StactAdapter();
        myStack.Push("oec2003");
        myStack.Push("oec2004");
        myStack.Push("oec2005");
        myStack.Pop();
        Console.WriteLine(myStack.GetTopItem());
    }
}
```

Adapter模式理解起来也非常简单，IStact中的Push和Pop方法就是添加元素和移除元素的功能，正好系统类ArrayList中就提供了Add和RemoveAt这样的方法，所以就可以拿来借用，通过适配器类（StactAdapter）的转换使得Push和Pop方法可以支持添加和移除元素的功能，就像我们经常使用的笔记本一样，本来现实中的电压和笔记本所需要的电压不相符，通过电源适配器的转换就将现实中的电压转换成笔记本所需要的电压。

类适配器

![2009-11-19_215214](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201281853997.png)

类适配器中使用到了剁成继承，从图中可以看出Adapter继承了Target和Adaptee，而在C#语言中不支持多继承，如果一定要在C#中使用类适配器，那么Target和Adapter其中之一一定要为接口，这样就有了一定的局限性。再者Adapter继承了Target和Adapter后就拥有了这两个的职责，这也违反了单一职责原则，所以通常我们使用对象适配器，下面还是给出配合上图的代码，Target设计成了接口。

```
/// <summary>
/// 客户要使用的类
/// </summary>
public interface ITarget
{
    public void Request();
}
/// <summary>
/// 被适配的类
/// </summary>
public class Adaptee
{
    public void SpecificRequest()
    {

    }
}
/// <summary>
/// 适配对象
/// </summary>
public class Adapter : Adaptee,ITarget
{
    public void Request()
    {
        this.SpecificRequest();
    }
}
/// <summary>
/// 客户程序
/// </summary>
public class App
{
    static void Main(string[] args)
    {
        ITarget target = new Adapter();
        //对客户来说是调用的Request，实际上是调用的SpecificRequest
        target.Request();
    }
}
```

## Adapter模式的几个要点

* Adapter模式主要英语于“希望复用一些现存的类，但是接口又与复用环境要求不一致的情况”，在遗留代码复用、类库迁移方面非常有用。
* Gof23定义了两种Adapter模式的实现结构：对象适配器和类适配器。但类适配器采用“多继承”的实现方式，带来了不良的高耦合，所以一般不推荐使用。对象适配器采用“对象组合”的方式，更符合松耦合。
* Adapter模式可以实现的非常灵活，不必拘泥于Gof23中定义的两种结构。例如，完全可以讲Adapter模式中的“现存对象”作为新的接口方法参数，来达到适配的目的。
* Adapter模式本身要求我们尽可能地使用“面向接口的编程”风格，这样才能在后期方便适配。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

