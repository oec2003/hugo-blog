---
title: 设计模式笔记(19)—观察者模式（行为型）
date: 2010-01-25
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

定义对象间的一种一对多的依赖关系，以便当一个对象的状态发生改变时，所有依赖于它的对象都得到通 知并自动更新

## 动机

在软件构建过程中，我们需要为某些对象建立一种“通知依赖关系” ——一个对象（目标对象）的状态发生改变，所有的依赖对象（观察者对象）都将得到通知。如果这样的依赖关系过于紧密，将使软件不能很好地抵御变化。使用面向对象技术，可以将这种依赖关系弱化，并形成一种稳定的依赖关系。从而实现软件体系结构的松耦合。

看这样一个场景，银行的ATM机在处理完成银行账户的存入或取出后会给用户发送手机短信和电子邮件，那么就会有这样三个对象，BankAccount Emailer Mobile，代码如下：

```
public class BankAccount
{
    Emailer emailer;
    Mobile mobile;
    public void Withdraw(int data)
    {
        //处理存入或取出
        emailer.SendEmail("");
        mobile.SendMsg("");
    }
}
public class Emailer
{
    public void SendEmail(string to)
    {
        //发送邮件
    }
}
public class Mobile
{
    public void SendMsg(string phoneNumber)
    {
        //发送短信
    }
}
```

上面的代码中BankAccount和Emailer Mobile之间有很强的依赖关系，Emailer和Mobile的变化会对BankAccount产生很大的影响，接下来要做的就是使BankAccount不要去依赖Emailer和Mobile这样的具体类，而应该去依赖他们的抽象，抽象的东西通常是稳定的，这样BankAccount和抽象之间的依赖就是一种比较弱的依赖关系，代码如下：

```
public class UserAccountArgs
{
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public UserAccountArgs(string email, string phoneNumer)
    {
        Email = email;
        PhoneNumber = phoneNumer;
    }
}
public interface IAccountObserver
{
    void Update(UserAccountArgs args);
}
public class Emailer : IAccountObserver
{
    public void Update(UserAccountArgs args)
    {
        Console.WriteLine("消息已发送邮件至邮箱：" + args.Email);
    }
}
public class Mobile : IAccountObserver
{
    public void Update(UserAccountArgs args)
    {
        Console.WriteLine("消息已发短信至手机：" + args.PhoneNumber);
    }
}
public class BankAccount
{
    List<IAccountObserver> list = new List<IAccountObserver>();
    public void Withdraw(int data)
    {
        //处理存入或取出
        if(data>0)
        {
            Console.WriteLine("您的账户存入了"+data+"元");
        }
        else
        {
            Console.WriteLine("您的账户取出了" + Math.Abs(data) + "元");
        }
        UserAccountArgs args = 
new UserAccountArgs("oec2003@gmail.com","1388888****");
        foreach (IAccountObserver observer in list)
        {
            observer.Update(args);
        }
    }
    public void AddObserver(IAccountObserver observer)
    {
        list.Add(observer);
    }
    public void RemoveObserver(IAccountObserver observer)
    {
        list.Remove(observer);
    }
}
/// <summary>
/// 客户端调用
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        BankAccount bankAccount = new BankAccount();
        bankAccount.AddObserver(new Emailer());
        bankAccount.AddObserver(new Mobile());
        bankAccount.Withdraw(-500);
    }
}
```

运行结果如下：

![2010-12-29_112052](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290614237.png)

上面的改进代码只是对Emailer和Mobile进行了抽象看，其实BankAccount也可能是不稳定的，所以也需要对BankAccount进行抽象，改进后的代码如下：

```
public class UserAccountArgs
{
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public UserAccountArgs(string email, string phoneNumer)
    {
        Email = email;
        PhoneNumber = phoneNumer;
    }
}
public interface IAccountObserver
{
    void Update(UserAccountArgs args);
}
public class Emailer : IAccountObserver
{
    public void Update(UserAccountArgs args)
    {
        Console.WriteLine("消息已发送邮件至邮箱：" + args.Email);
    }
}
public class Mobile : IAccountObserver
{
    public void Update(UserAccountArgs args)
    {
        Console.WriteLine("消息已发短信至手机：" + args.PhoneNumber);
    }
}
public abstract class Subject
{
    List<IAccountObserver> list = new List<IAccountObserver>();
    protected virtual void Notify(UserAccountArgs args)
    {
        foreach (IAccountObserver observer in list)
        {
            observer.Update(args);
        }
    }
    public void AddObserver(IAccountObserver observer)
    {
        list.Add(observer);
    }
    public void RemoveObserver(IAccountObserver observer)
    {
        list.Remove(observer);
    }
}
public class BankAccount:Subject
{
    public void Withdraw(int data)
    {
        //处理存入或取出
        if(data>0)
        {
            Console.WriteLine("您的账户存入了"+data+"元");
        }
        else
        {
            Console.WriteLine("您的账户取出了" + Math.Abs(data) + "元");
        }
        UserAccountArgs args = 
new UserAccountArgs("oec2003@gmail.com","1388888****");
        Notify(args);
    }
}
/// <summary>
/// 客户端调用
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        BankAccount bankAccount = new BankAccount();
        bankAccount.AddObserver(new Emailer());
        bankAccount.AddObserver(new Mobile());
        bankAccount.Withdraw(-500);
    }
}
```

这样就成了将不稳定的对象进行抽象，最后相互依赖的是抽象与抽象之间的依赖，便于扩展。

观察者模式的结构图：

![2010-12-29_112122](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290614079.png)

对比上图和上面的代码有以下的对应关系

* Subject：Subject
* Observer：IObserver
* ConcreteSubject：BankAccount
* ConcreteObserver：Emailer Mobile

基本代码的实现：

```
public abstract class Subject
{
    private List<Observer> list = new List<Observer>();
    /// <summary>
    /// 添加观察者
    /// </summary>
    /// <param name="observer"></param>
    public void Attach(Observer observer)
    {
        list.Add(observer);
    }
    /// <summary>
    /// 移除观察者
    /// </summary>
    /// <param name="observer"></param>
    public void Detach(Observer observer)
    {
        list.Remove(observer);
    }
    public void Notify()
    {
        foreach (Observer observer in list)
        {
            observer.Update();
        }
    }
}
/// <summary>
/// 抽象观察者类
/// </summary>
public abstract class Observer
{
    public abstract void Update();
}
/// <summary>
/// 具体通知者
/// </summary>
public class ConcreteSuject : Subject
{
    public string SubjectState { get; set; }
    public ConcreteSuject(string subjectState)
    {
        this.SubjectState = subjectState;
    }
}
/// <summary>
/// 具体观察者
/// </summary>
public class ConcreteObserver : Observer
{
    private ConcreteSuject _subject;
    private string _name;
    public ConcreteObserver(ConcreteSuject subject,string name)
    {
        this._subject = subject;
        this._name = name;
    }
    public override void Update()
    {
        Console.WriteLine("观察者:" + _name + "状态为：" + 
                             _subject.SubjectState);
    }
}
/// <summary>
/// 客户端调用
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        ConcreteSuject cs1 = new ConcreteSuject("写博客");
        ConcreteSuject cs2 = new ConcreteSuject("大篮球");
        cs1.Attach(new ConcreteObserver(cs1, "oec2003"));
        cs1.Attach(new ConcreteObserver(cs2, "oec2004"));
        cs1.Notify();
    }
}
```

## Observer模式的几个要点

* 使用面向对象的抽象，Observer模式使得我们可以独立地改变目标与观察者，从而使二者之间的依赖关系达致松耦合。
* 目标发送通知时，无需指定观察者，通知（可以携带通知信息作为参数）会自动传播。观察者自己决定是否需要订阅通知，目标对象对此一无所知。
* 在C#的event中，委托充当了抽象的Observer接口，而提供事件的对象充当了目标对象。委托是比抽象Observer接口更为松耦合的设计。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

