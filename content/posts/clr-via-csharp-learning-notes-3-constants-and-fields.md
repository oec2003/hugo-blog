---
title: CLR Via C# 学习笔记（3） 常量和字段（const readonly）
date: 2009-06-22
categories: [技术]
tags: [CLR via C#, DotNet]
---

> 《CLR Via C#》这本书以前就粗略看过两遍，但一直都没能深入理解，而且很多内容也忘记了，现在准备重新看一遍，并将看过的部分写出来，因为写的过程也是一个加深理解的过程。本系列算是学习的一个记录吧，也可以方便以后自己查阅，如果对大家还有些帮助的话，我就很高兴了。书我是选择性的看的，所以顺序和书中的顺序可能不一样。

常量和字段都是类型的数据成员，但是区别却是很大的。

1. 常量的值永远不会改变。字段有多种类型，非只读字段的值是可以改变的。
2. 常量的值必须在编译时就确定，也就是说在定义时就要赋值。编译后常量的值就保存在程序集的元数据中；字段是存储在动态内存中，在运行时才能得到字段的值。
3. 常量的定义必须用基元类型，关于基元类型可以参考(CLR Via C# 学习笔记（1） 基元类型 值类型 引用类型 )；字段的定义可以是任何类型。
4. 因为常量的值不能改变，可以将其看做是静态类型，在IL代码中可以看到常量有static修饰符，所以在调用的时候和调用静态字段一样，直接用类名.常量名；字段中的静态字段的调用才和常量一样直接用类名.字段名，调用非静态字段必须用类的实例。、
5. C#不允许使用static修饰常量，因为常量本身就隐含是static类型；字段可以使用static，使用static定义的字段为静态字段。

## 下面看个例子来理解下常量

1 创建一个类库项目命名为Oec2003ClassLibrary ,在默认的类Class1中写如下代码

```
namespace Oec2003ClassLibrary
{
    public class Class1
    {
        public const double PI = 3.14;

        public static double _pi = 3.14;
    }
}
```

2 创建一个web项目，添加对Oec2003ClassLibrary类库项目的引用，新建页面ConstTest.aspx,在PageLoad中写如下代码

```
protected void Page_Load(object sender, EventArgs e)
{
    Response.Write(Class1.PI+"<br/>");
    Response.Write(Class1._pi);
}
```

3 将ConstTest设为起始页，运行，可以看到结果如下

![2010-12-29_181713](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290816263.gif)

4 现在将Oec2003ClassLibrary 项目中的Class1的代码改写如下，然后从新编译该项目。

```
namespace Oec2003ClassLibrary
{
    public class Class1
    {
        public const double PI = 3.1415926;
        public static double _pi = 3.1415926;
    }
}
```

5 刷新刚才的页面 ，可以看到结果如下

![2010-12-29_181748](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290816174.gif)

6 从新运行ConstTest页面可以看到如下结果

![2010-12-29_181824](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290816233.gif)

从上面的例子可以看出，在应用程序不从新编译的情况下，常量的值永远不会发生改变。如果应用程序想要获得常量的新值，就必须重新编译，所以在运行时一个应用程序集想获得另一个应用程序集中的值，则不能使用常量，可以使用只读字段（readonly）。

字段也是一种类型的数据成员，字段的修饰符有 static readonly volatile，没有上述修饰修饰的字段为普通的实例字段。static可以和readonly一起使用，就是静态只读字段。有关volatile将在后面的部分介绍。

## 关于readonly要注意的地方

* 当readonly修饰的字段为值类型时，在调用的时候如果视图去改变字段的值，将会编译出错。
* 当readonly修饰的字段为引用类型时，调用时不能改变其引用，但可以改变应用对象的值，看下面的例子。

1 在Oec2003ClassLibrary项目的Class1.cs文件写如下代码

```
namespace Oec2003ClassLibrary
{
    public class Class1
    {
        public const double PI = 3.14;
        public static readonly double _pi = 3.14;

        public static readonly User user = new User("oec2003");
    }
    public class User
    {
        public User(string name)
        {
            Name = name;
        }
        public string Name { get; set; }
    }
}
```

2 在web项目中添加页面，命名为Readonly.aspx，PageLoad代码如下

```
protected void Page_Load(object sender, EventArgs e)
{
    User user = Class1.user;
    //正确 修改静态只读字段应用对象的值，运行会在页面显示oec2005
    Class1.user.Name = "oec2005";
    //错误 不能通过编译，不能改变为另一个引用
    Class1.user = new User("oec2005"); 

    Response.Write(user.Name);
}
```

从上面的讲述中可以知道只读（Readonly）字段一旦定义了是不能够改变其值的，即使是引用类型也只能改变其引用对象的值。不过也并不是这么绝对，下面就来看看怎样用反射来实现改变只读字段的值。

1 既然用到反射，首先引用命名空间using System.Reflection; ，然后修改Class1的代码。

```
namespace Oec2003ClassLibrary
{
    public class Class1
    {
        public readonly Int32 _age = 25;
        public readonly User _user = new User("oec2003");
    }
    public class User
    {
        public User(string name)
        {
            Name = name;
        }
        public string Name { get; set; }
    }
}
```

2 修改PageLoad中的代码，将使用反射前的只读字段的内容输出。

```
protected void Page_Load(object sender, EventArgs e)
{
    Class1 myClass = new Class1();

    User user = myClass._user;

    Response.Write("姓名："+user.Name+" 年龄："+myClass._age);
}
```

结果如下

![2010-12-29_182011](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290817341.gif)

3 修改PageLoad的代码，使用反射修改只读字段的值然后输出。

```
protected void Page_Load(object sender, EventArgs e)
{
    Class1 myClass = new Class1();

    Type myType = typeof(Oec2003ClassLibrary.Class1);
    //改变值类型只读字段的值
    myType.GetField("_age").SetValue(myClass, 30);
    //改变引用只读字段的值
    myType.GetField("_user").SetValue(myClass, new User("水杯")); 

    User user = myClass._user;
    Response.Write("姓名："+user.Name+" 年龄："+myClass._age);
}
```

结果如下

![2010-12-29_182116](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290817145.gif)

呵呵，可以看出不管是值类型只读字段还是引用类型只读字段都可以通过反射顺利修改。

在一些面试中经常会遇到const和readonly的区别这样的问题，归根基地就是常量和字段的区别，readonly修饰的字段只是字段的一种而已，实际应用中该选择const还是readonly要根据实际的需求，const的性能要好，因为不用分配内存，不过限制很多，比如定义时类型的限制，显得不是很灵活。

## 系列相关文章

[CLR Via C# 学习笔记（1） 基元类型 值类型 引用类型](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-1-primitive-types/)
[CLR Via C# 学习笔记（2） 装箱和拆箱](http://blog.fwhyy.com/2009/06/clr-via-csharp-learning-notes-2-boxing-and-unboxing/)
CLR Via C# 学习笔记（3） 常量和字段
[CLR Via C# 学习笔记（4） 方法 构造函数](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-5-methods-the-constructor/)
[CLR Via C# 学习笔记（5） 静态构造函数的性能](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-5-the-performance-of-the-static-constructor/)
[CLR Via C# 学习笔记（6） 方法参数相关（out ref params）](http://blog.fwhyy.com/2009/07/clr-via-csharp-learning-notes-6-the-method-parameters-related/)

