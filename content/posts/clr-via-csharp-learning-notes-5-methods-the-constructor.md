---
title: CLR Via C# 学习笔记（4） 方法 构造函数
date: 2009-07-03
categories: [技术]
tags: [AspNet, CLR via C#, DotNet]
---

> 《CLR Via C#》这本书以前就粗略看过两遍，但一直都没能深入理解，而且很多内容也忘记了，现在准备重新看一遍，并将看过的部分写出来，因为写的过程也是一个加深理解的过程。本系列算是学习的一个记录吧，也可以方便以后自己查阅，如果对大家还有些帮助的话，我就很高兴了。书我是选择性的看的，所以顺序和书中的顺序可能不一样。

构造函数是可以将类型实例初始化为有效状态的特殊方法。构造函数在元数据中通常用.ctor来表示，通过IL代码可以看到。在创建一个类型的实例时，通常分为三步：

1. 为实例的数据字段分配内存。
2. 创建对象指针和同步索引块。
3. 调用类型的实例构造器来设置对象的初始状态。

## 引用类型的实例构造器

在创建一个引用类型的对象是，调用类型的实例构造函数之前，会将对象分配的内存做清零处理，就是说在构造函数中没有显示赋值的所有字段都将设置为0或null。

实例构造函数和一般方法不同，他永远都不能被继承，所有以下的关键字也不能用于实例构造函数（virtual new override sealed abstract）。

一个类中如果没有显示定义任何构造函数，C#编译器将定义一个默认的无参构造函数。

抽象（abstract）类的默认构造函数的访问修饰符为protected。

构造函数可以初始化字段，不过在c#语言中提供了一种简单的方法，在定义字段的时候直接赋值以初始化。如下：

```
public class User
{
    private int _age = 25;
    private string _name = "oec2003";
}
```

像上面那样的确很方便，但如果有好几个已经初始化的实例字段和多个重载的构造函数同时存在的情况下，就应该将实例字段的初始化放到一个公共的构造函数中，其他的构造函数通过this来显示调用该构造函数，这样可以减少代码生成的大小，看下面的例子。

```
public abstract class User
{
    private int _age = 25;
    private string _name = "oec2003";
    private string _email = "oec2003@gmail.com";

    public User(Int32 age)
    {
        this._age = age;
    }

    public User(string name)
    {
        this._name = name;
    }

    public User(Int32 age, String name, String email)
    {
        this._age = age;
        this._name = name;
        this._email = email;
    }
}
```

正确的写法应该像下面这样

```
public abstract class User
{
    private int _age;
    private string _name;
    private string _email;

    public User()
    {
        _age = 25;
        _name = "oec2003";
        _email = "oec2003@gmail.com";
    }

    public User(Int32 age)
        : this()
    {
        this._age = age;
    }

    public User(string name)
        : this()
    {
        this._name = name;
    }

    public User(Int32 age, String name, String email)
        : this()
    {
        this._age = age;
        this._name = name;
        this._email = email;
    }
}
```

## 值类型的实例构造函数

值类型的实例构造函数和引用类型的有很大不同，在值类型中不能含有无参的构造函数，如果显式指定无参的构造函数将会出现编译错误。如下面代码会出现编译错误：

```
struct User
{
    public Int32 _age;
    public String _name;

    public User()
    {
        _age = 25;
        _name = "oec2003";
    }
}
```

值类型不能包含无参的构造函数，也不能在值类型中给字段进行初始化，下面的代码也将不能通过编译。

```
public struct User
{
    public Int32 _age = 25;
    public String _name = "oec2003";
}
```

在值类型中也可以有构造函数，不过该构造函数必须含有参数，而且要初始化所有的字段。含有参数但没有初始化所有字段的构造函数也不能通过编译。看如下代码：

```
public struct User
{
    public Int32 _age;
    public String _name;
    //只初始化了_age
    public User(Int32 age)
    {
        _age = age;
    }
    public User(Int32 age, String name)
    {
        _age = age;
        _name = name;
    }
}
```

由此可见如果值类型中显示包含构造函数必须要初始化所有的字段。如果有多个构造函数，每个构造函数也必须保证初始化所有的字段，否则不能通过编译。如果值类型中不包含构造函数，实例化时所有字段将设置为0或null。

## 类型构造函数

类型构造函数也被称为静态构造函数。静态构造函数可以用于引用类型和值类型。和实例构造函数不同的是静态构造函数在一个类型中永远只有一个，并且不能包含参数。静态构造函数中只能初始化静态字段。下面代码分别展示在值类型（和实力构造函数不同，值类型中允许显示定义无参的静态构造函数）和引用类型中的静态构造函数。

```
//值类型
public struct User
{
    public static Int32 _age;
    public static String _name;

    static User()
    {
        _age = 25;
        _name = "oec2003";
    }
}
//引用类型
public class User
{
    public static Int32 _age;
    public static String _name;

    static User()
    {
        _age = 25;
        _name = "oec2003";
    }
}
```

为了防止开发人员编写的代码调用静态构造函数，C#编译器会将静态构造函数定义为私有（private）的，并且不能显示地给静态构造函数添加访问修饰符，如果这么做了会出现编译错误。

上面讲到过在值类型中不能在定义是给实例字段赋值，否则会编译错误，但可以在定义时给静态字段赋值，看下面代码：

```
public struct User
{
    public static Int32 _age = 25;    //正确 可以初始化静态字段
    public String _name = "oec2003";  //错误 不能初始化实例字段
}
```

静态构造函数不应该去调用基类的静态构造函数，因为静态字段是不会被继承到子类中，所以这样做没有意义。

## 系列相关文章

[CLR Via C# 学习笔记（1） 基元类型 值类型 引用类型](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-1-primitive-types/)
[CLR Via C# 学习笔记（2） 装箱和拆箱](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-2-boxing-and-unboxing/)
[CLR Via C# 学习笔记（3） 常量和字段（cosnt readonly）](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-3-constants-and-fields/)
CLR Via C# 学习笔记（4） 方法 构造函数
[CLR Via C# 学习笔记（5） 静态构造函数的性能](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-5-the-performance-of-the-static-constructor/)
[CLR Via C# 学习笔记（6） 方法参数相关（out ref params）](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-6-the-method-parameters-related/)

