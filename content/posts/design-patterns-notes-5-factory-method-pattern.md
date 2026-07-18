---
title: 设计模式笔记(5)—工厂方法模式（创建型）
date: 2009-11-22
categories: [技术]
tags: [C#,设计模式]
---

## Gof定义

定义一种用于创建对象的借口，让子类决定实例化哪一个类，Factory Method使得一个类的实例化延迟到子类。

## 动机

在软件系统中，经常面临着“某个对象”的创建工作；由于需求的变化，这个对象经常面临着剧烈的变化，但是它却拥有比较稳定的借口。

假设有这样的一个场景，有一个汽车类和一个汽车测试框架类，汽车测试框架负责对汽车来进行测试，通常情况下我们会想下面这样写。

```
public class Car
{
    public void Startup() { }

    public void Run(){ }

    public void Turn(Direction direction) { }

    public void Stop() { }
}
```

测试框架类

```
class CarTestFramework
{
    public void BuildTestContext()
    {
        Car car = new Car();
        //do something
    }

    public void DoTest()
    {
        Car car = new Car();
        //do something
    }

    public void GetTestData()
    {
        Car car = new Car();
        //do something
    }
}
```

在上面的测试框架类CarTestFramework中的每个方法都有可能去实例化Car类。上面的代码中是直接实例化的
Car类。这样测试框架类和汽车之间有很强的依赖关系。实际中我们的测试框架类不可能只测试一种类型的汽车，
所以当被测试的车的类型发生变化时，测试框架类中也要变化，这当然不是我们想要的。现在就把汽车类给抽象
起来。

```
public abstract class AbstractCar
{
    public abstract void Startup();

    public abstract void Run();

    public abstract void Turn(Direction direction);

    public abstract void Stop();
}
```

抽象的汽车类创建了，那么测试框架类也会发生相应的变化，我们可能会很快地拿AbstractCar特换掉Car，如下：

```
class CarTestFramework
{
    public void BuildTestContext()
    {
        AbstractCar car = new AbstractCar();
        //do something
    }

    //....
}
```

很容易可以看出来，上面的代码其实是错误的，抽象类不能实例化。这时可能还会想到另外一种方法用抽象类来实例化子类。

```
class CarTestFramework
{
    public void BuildTestContext()
    {
        AbstractCar car=new Car();
        //do something
    }
    //......
}
```

但这样做还是有问题，实例化时还是用到了具体的类Car，这样还是对Car产生了依赖。所以就需要有一个工厂类专门来创建对象。下面就创建工厂类CarFactory

```
public class CarFactory
{
    public AbstractCar CreateCar()
    {
        return new Car();
    }
}
```

测试框架类的代码如下：

```
class CarTestFramework
{
    public void BuildTestContext(CarFactory carFactory)
    {
        AbstractCar car1 = carFactory.CreateCar();
        AbstractCar car2 = carFactory.CreateCar();
        AbstractCar car3 = carFactory.CreateCar();
        //...不管需要几个用工厂类的方法创建就可以了
    }
    //........
}
```

在客户程序中像下面这样调用

```
public class App
{
    public void Main()
    {
        CarTestFramework carTestFramework = new CarTestFramework();
        carTestFramework.BuildTestContext(new CarFactory());
        //....
    }
}
```

上面的代码可以看出传入到测试框架类中方法的参数是一个工厂类的对象，而在工厂类的方法CreateCar中是直
接返回的Car类，这样耦合的关系又移到了工厂类的CreateCar中，产生了强依赖。假设现在有个HongqiCar<需要被测试，就需要更改CreateCar方法，如下：

```
public class HongqiCar:AbstractCar
{
    public override void Startup() { }

    public override void Run() { }

    public override void Turn(Direction direction) { }

    public override void Stop() { }
}
```

更改后的工厂类

```
public class CarFactory
{
    public AbstractCar CreateCar()
    {
        return new HongqiCar();
    }
}
```

这样的设计显然也是不好的。既然强依赖发生在工厂类中，就可以将工厂类也抽象起来

```
public abstract class AbstractCarFactory
{
    public abstract AbstractCar CreateCar();
}
```

上面说到有HongqiCar需要被测试，就创建一个生成HongqiCar的工厂类，这个类继承抽象工厂类。

```
public class HongqiCarFactory : AbstractCarFactory
{
    public override AbstractCar CreateCar()
    {
        return new HongqiCar();
    }
}
```

现在客户程序就可以改成这样

```
public class App
{
    public void Main()
    {
        CarTestFramework carTestFramework = new CarTestFramework();
        carTestFramework.BuildTestContext(new HongqiCarFactory());
        //....
    }
}
```

这样如果又有新的需求，比如要添加AutiCar进行测试，只需要做下面几步

1 添加AutiCar类继承AbstractCar类

```
public class AudiCar : AbstractCar
{
    public override void Startup() { }

    public override void Run() { }

    public override void Turn(Direction direction) { }

    public override void Stop() { }
}
```

2 添加AudiCar的工厂类继承AbstractCarFactory类

```
public class AudiCarFactory : AbstractCarFactory
{
    public override AbstractCar CreateCar()
    {
        return new AudiCar();
    }
}
```

3 客户程序稍作改动即可

```
public class App
{
    public void Main()
    {
        CarTestFramework carTestFramework = new CarTestFramework();
        carTestFramework.BuildTestContext(new HongqiCarFactory());
        //添加一行代码即可
        carTestFramework.BuildTestContext(new AudiCarFactory());
        //....
    }
}
```

## 完整的代码

AbstractCar.cs

```
/// <summary>
/// 抽象汽车类
/// </summary>
public abstract class AbstractCar
{
    public abstract void Startup();
    public abstract void Run();
    public abstract void Turn(Direction direction);
    public abstract void Stop();
}
```

AbstractCarFactory.cs

```
/// <summary>
/// 抽象工厂类
/// </summary>
public abstract class AbstractCarFactory
{
    public abstract AbstractCar CreateCar();
}
```

CarTestFramework.cs

```
/// <summary>
/// 测试框架类
/// </summary>
public class CarTestFramework
{
    public void BuildTestContext(AbstractCarFactory abstractCarFactory)
    {
        AbstractCar car = abstractCarFactory.CreateCar();
    }

    public void DoTest(AbstractCarFactory abstractCarFactory)
    {
        //do something
    }

    public void GetTestData(AbstractCarFactory abstractCarFactory)
    {
        //do something
    }
}
```

App.cs

```
/// <summary>
/// 客户类
/// </summary>
public class App
{
    public void Main()
    {
        CarTestFramework carTestFramework = new CarTestFramework();
        carTestFramework.BuildTestContext(new HongqiCarFactory());
        //....
    }
}
```

上面大的就是基本的代码，如果需要什么类型的汽车被测试，只需要添加两个具体类去继承抽象的汽车类和抽象工厂类，然后在客户程序稍作修改既可，并且客户程序也可以通过反射加配置文件的方式而不需要做任何修改。这样就很好满足了OCP原则，需求变动只要扩展新的类就可以。

## Factory Method设计模式的几个要点

* Factory Method模式主要用于隔离类对象的使用者和具体类型之间的耦合关系。面对一个经常变化的具体类型，紧耦合关系会导致软件的脆弱。
* Factory Method模式通过面向对象的手法，将所要创建的具体对象工作延迟到子类，从而实现一种扩展（而非更改）的策略，较好解决了这种紧耦合关系。
* Factory Method模式解决“单个对象”的变化，Abstract Factory模式解决了“系列对象”的需求变化，Builder模式解决了“对象部分”的需求变化。

[返回开篇（索引）](http://blog.fwhyy.com/2009/11/design-patterns-notes-1-index/)

