---
title: 设计模式笔记(8)—桥接模式（结构型）
date: 2009-12-01
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

将抽象部分与实现部分分离，使他们都可以独立地变化。

先来看一个简单的例子，假设我们需要开发一个同时支持PC和手机的坦克游戏，游戏在PC和手机上的功能都一样，有同样的类型，有同样的功能需求变化，而这些游戏中的坦克有多种不同的型号：T50 T60等。根据面向对象的思想，我们可以很容易设计一个坦克(Tank)的抽象类，然后不同的型号都继承抽象类，并且PC和手机上的图形绘制，操作等都是不相同的，所以不同的平台都要提供自己的一套实现：

坦克抽象类

```
/// <summary>
/// 坦克的抽象类
/// </summary>
public abstract class Tank
{
    public abstract void Start();
    public abstract void Attack();
}
```

各种不同的型号

```
/// <summary>
/// T50型号
/// </summary>
public class T50:Tank
{
    public override void  Attack(){}
    public override void  Start(){}
}
/// <summary>
/// T60型号
/// </summary>
public class T60:Tank
{
    public override void  Attack(){}
    public override void  Start(){}
}
```

手机上的实现

```
/// <summary>
/// MobileT50型号
/// </summary>
public class MobileT50 : T50
{
    /// <summary>
    /// 启动
    /// </summary>
    public override void Start(){}
    /// <summary>
    /// 攻击
    /// </summary>
    public override void Attack(){}
}
/// <summary>
/// MobileT60型号
/// </summary>
public class MobileT60 : Tank
{
    /// <summary>
    /// 启动
    /// </summary>
    public override void Start(){}
    /// <summary>
    /// 攻击
    /// </summary>
    public override void Attack(){}
}
```

PC上的实现

```
public class PCT50 : T50
{
    //代码和手机中的类似
}
public class PCT60 : T60
{
    //代码和手机中的类似
}
```

客户端调用

```
/// <summary>
/// 手机客户端调用
/// </summary>
public class MobileApp
{
    void Main(string[] args)
    {
        Tank t;
        t = new MobileT50();
        t.Start();
        t.Attack();
        t = new MobileT60();
        t.Start();
        t.Attack();
    }
}
/// <summary>
/// PC客户端调用
/// </summary>
public class PCApp
{
    void Main(string[] args)
    {
        //...
    }
}
```

这样的设计在需求比较稳定的情况下并没有什么问题，但事情往往不是这样，我们可以有更多的型号如T80、T90、T100等，而且平台也可能不止手机和PC这两种，可能还有PSP，掌上电脑等。当有这样双向需求变化的时候，如果还像上面这样设计将会带来很多的问题，会有更多的重复代码，类之间的结构也变得非常复杂，新添加一个平台和加几种型号都会很麻烦。如下图：

![image-20220128184812825](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201281848338.png)

## 动机

思考下上面问题：事实上由于Tank的类型的固有逻辑，使得Tank类型具有了两个变化的维度—“平台的变化”和“型号的变化”。如何应对这种“多维度的变化”？如何利用面向对象技术来使Tank类型可以轻松沿着“平台”和“型号”两个方向变化，而不引入额外的复杂度？这就是桥接模式要解决的问题。

既然涉及到了两个维度的变化，那么我们就这对这两个维度来涉及抽象类，然后再想办法将其关联起来，先来创建“平台”和“型号”的抽象类，如下：

```
/// <summary>
/// 坦克型号的抽象类
/// </summary>
public abstract class TankModel
{
    public abstract void Run();
}
/// <summary>
/// 平台的抽象类
/// </summary>
public abstract class TankPlatformImplementation
{
    public abstract void MoveTankTo(int x,int y);
    public abstract void DrawTank();
    public abstract void Attack();
}
```

现在通过组合的方式将两个类关联起来，修改坦克型号的类即可，修改后的代码如下：

```
/// <summary>
/// 坦克型号的抽象类
/// </summary>
public abstract class TankModel
{
    protected TankPlatformImplementation _tankImp;
    /// <summary>
    /// 构造函数中传入平台对象
    /// </summary>
    /// <param name="tankImp"></param>
    public TankModel(TankPlatformImplementation tankImp)
    {
        _tankImp = tankImp;
    }
    public abstract void Run();
}
```

抽象类已经完成，现在假设有PC平台和T50型号的坦克，实现如下：

PC平台具体类

```
/// <summary>
/// PC坦克
/// </summary>
public class PCTankImplatation:TankPlatformImplementation
{
    string _tankModel;
    public PCTankImplatation(string tankModel)
    {
        _tankModel = tankModel;
    }
    /// <summary>
    /// 绘制坦克
    /// </summary>
    public override void DrawTank()
    {
        Console.WriteLine(_tankModel+"PC坦克绘制成功！");
    }
    /// <summary>
    /// 坦克移动
    /// </summary>
    /// <param name="x">x坐标</param>
    /// <param name="y">y坐标</param>
    public override void MoveTankTo(int x, int y)
    {
        Console.WriteLine(_tankModel+"PC坦克已经移动到了坐标("+x+","+y+")处");
    }
    /// <summary>
    /// 攻击
    /// </summary>
    public override void Attack()
    {
        Console.WriteLine(_tankModel+"PC坦克开始攻击");
    }
}
```

T50型号坦克具体类

```
/// <summary>
/// T50型号坦克
/// </summary>
public class T50 : TankModel
{
    public T50(TankPlatformImplementation tankImp) : base(tankImp) { }
    public override void Run()
    {
        _tankImp.DrawTank();
        _tankImp.MoveTankTo(100, 100);
        _tankImp.Attack();
    }
}
```

客户端调用

```
/// <summary>
/// 客户端调用
/// </summary>
public class App
{
    void Main(string[] agrs)
    {
        T50 t = new T50(new PCTankImplatation());
        t.Run();
    }
}
```

至此桥接模式的代码部分基本完成，主要是同过在抽象类中的组合方式来实现，下面看下桥接模式的结构图：

![image-20220128184840849](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201281848877.png)

使用了桥接模式后，当需求发生变化后就很容易来应对了，假如现在又多了一种T60型号的坦克，并且添加了一个手机平台。只需要添加T60型号的具体类和手机平台具体类即可，如下：

```
/// <summary>
/// 手机坦克
/// </summary>
public class MobileTankImplatation : TankPlatformImplementation
{
    string _tankModel;
    public MobileTankImplatation(string tankModel)
    {
        _tankModel = tankModel;
    }
    /// <summary>
    /// 绘制坦克
    /// </summary>
    public override void DrawTank()
    {
        Console.WriteLine(_tankModel+"Mobile坦克绘制成功！");
    }
    /// <summary>
    /// 坦克移动
    /// </summary>
    /// <param name="x">x坐标</param>
    /// <param name="y">y坐标</param>
    public override void MoveTankTo(int x, int y)
    {
        Console.WriteLine(_tankModel+"Mobile坦克已经移动到了坐标(" + x + "," + y + ")处");
    }
    /// <summary>
    /// 攻击
    /// </summary>
    public override void Attack()
    {
        Console.WriteLine(_tankModel+"Mobile坦克开始攻击");
    }
}
/// <summary>
/// T60型号坦克
/// </summary>
public class T60 : TankModel
{
    public T60(TankPlatformImplementation tankImp) : base(tankImp) { }
    public override void Run()
    {
        _tankImp.DrawTank();
        _tankImp.MoveTankTo(400, 100);
        _tankImp.Attack();
    }
}
```

添加这两个类后现在我们有T50型号、 T60型号 、PC平台、手机平台，虽然只添加了两个类，但现在有了四种组合，看客户端代码的调用：

```
/// <summary>
/// 客户端调用
/// </summary>
public class App
{
    void Main(string[] agrs)
    {
       //T50在PC上
        T50 t50PC = new T50(new PCTankImplatation("T50"));
       t50PC.Run();
       //T50在Mobile上
        T50 t50Mobile = new T50(new MobileTankImplatation("T50"));
       t50Mobile.Run();
       //T60在PC上
        T60 t60PC = new T60(new PCTankImplatation("T60"));
       t60PC.Run();
       //T60在Mobile上
        T60 t60Mobile = new T60(new MobileTankImplatation("T60"));
       t60Mobile.Run();
    }
}
```

运行结果如下：

![2010-12-29_131629](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201281849345.png)

如果再有不同的平台或是不同型号添加，只需添加平台和型号的具体类实现就可以了，关于什么型号在什么平台上使用，可以在调用的时候随意组合。这样就大大减少了类的结构的复杂度，下面两幅图就是最好的说明。

### 没有使用桥接模式时的需求变化

![2010-12-29_131703](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201281849212.png)

### 使用桥接模式后的需求变化

![2010-12-29_131735](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201281849802.png)

## 桥接模式的几个要点

* 桥接模式使用“对象间的组合关系”解耦了抽象和实现之间固有的绑定关系，使得抽象（Tank的型号）和实现（不同的平台）可以沿着各自的维度来变化。
* 所谓抽象和实现沿着各自维度的变化，即“子类化”他们，比如不同的Tank型号的子类，和不同平台的子类。得到各个子类之后，便可以任意组合他们，从而获得不同平台上的不同型号。
* 桥接模式有时候类似于多继承方案，但是多继承方案往往违背了单一职责原则，复用性比较差。桥接模式是比多继承方案更好的方法。
* 桥接模式的应用一般在“两个非常强的变化维度”，有时候即使有两个变化的维度，但是某个方向的变化维度并不剧烈—换言之两个变化不会导致从横交错的结果，并不一定要使用桥接模式。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

