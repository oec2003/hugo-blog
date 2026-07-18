---
title: 带你了解C#每个版本新特性
date: 2019-06-16T14:19:33+08:00
categories: [技术]
tags: [C#]
---

上学时学习C#和.NET，当时网上的资源不像现在这样丰富，所以去电脑城买了张盗版的VS2005的光盘，安装时才发现是VS2003，当时有一种被坑的感觉，但也正是如此，让我有了一个完整的.NET的学习生涯。

<!--more-->

一直都认为学习语言应该系统的进行学习，了解每一个版本的新增特性，才能在实际应用中做到有的放矢。最近发现团队中有不少人虽然用着最新的技术，但知识储备还停留在一个比较初始的状态，这样在编码过程中会走不少弯路。

本文梳理下C#从1.0到7.0版本的一些常用特性，对于不常用的或者我没有用到过的一些特性，会列出来，但不会做详细描述。另外C#8.0现在还没有正式推出，并且目前我们也只是在使用dotNet Core2.1，所以C#8.0本文也不会涉及。

## C#1.X

| C# | VS版本 | CLR版本 | .NET Framework |
| --- | --- | --- | --- |
| 1.0 | VS2002 | 1.0 | 1.0 |
| 1.1 | VS2003 | 1.1 | 1.1 |


在C#1.0或1.1版本中，从语言的角度就是基本的面向对象的语法，可以说任何一本C#语言的书籍都包含了C#1.X的所有内容。

如果您已经在使用C#语言编写代码，那么C#1.X的相关知识应该已经掌握。基础语法部分这里就不再赘述了。

## C#2.0

| C# | VS版本 | CLR版本 | .NET Framework |
| --- | --- | --- | --- |
| 2.0 | VS2005 | 2.0 | 2.0 |


2.0中对应VS2005我用的也不多，因为很快就被VS2008替代了，不过在语言方面却带来了很多新的东西。

### 泛型

C#2中最重要的一个特性应该就是泛型。泛型的用处就是在一些场景下可以减少强制转换来提高性能。在C#1中就有很多的强制转换，特别是对一些集合进行遍历时，如ArrayList、HashTable，因为他们是为不同数据类型设计的集合，所以他们中键和值的类型都是object，这就意味着会平凡发生装箱拆箱的操作。C#2中有了泛型，所以我们可以使用List<T>、Dictionary<Tkey,TValue> 。泛型能够带来很好的编译时类型检查，也不会有装箱拆箱的操作，因为类型是在使用泛型的时候就已经指定了。

.NET已经通过了很多的泛型类型供我们使用，如上面提到的List<T>,Dictionary<Tkey,TValue>,我们也可以自己来创建泛型类型(类、接口、委托、结构)或是方法。在定义泛型类型或时可以通过定义泛型约束来对泛型参数进行限制，更好的使用编译时检查。泛型约束是通过关键字where来实现的，C#2中的泛型约束有4种：

* 引用类型约束：确保类型实参是引用类型，使用where T:class来表示；
* 值类型约束：确保类型实参是值类型，使用where T:truct来表示；
* 构造函数类型约束，使用where T:new()来表示；
* 转换类型约束：约束类型实参是另外的一种类型，例如：where T:IDisposable 。

### 分部类（Partil）

分部类可以允许我们在多个文件中为一个类型（class、struct、interface）编写代码，在Asp.Net2.0中用的极为广泛。新建一个Aspx页面，页面的CodeBehind和页面中的控件的定义就是通过分部类来实现的。如下：

```
public partial class _Default : System.Web.UI.Page 
public partial class _Default 
```

分部类使用关键字partial来定义，当一个类中的代码非常多时，可以使用分部类来进行拆分，这对代码的阅读很有好处，而且不会影响调用。不过现在我们前后端分离，后端代码要做到单一职责原则，不会有很多大的类，所以这个特性很少用到。

### 静态类

静态类中的公用方法必须也是静态的，可以由类名直接调用，不需要实例化，比较适用于编写一些工具类。如System.Math类就是静态类。工具类有一些特点，如：所有成员都是静态的、不需要被继承、不需要进行实例化。在C#1中我们可以通过如下代码来实现：

```
//声明为密封类防止被继承 
public sealed class StringHelper
{
    //添加私有无参构造函ˉ数防止被实例化，如果不添加私有构造函数 
    //会自动生成共有无参构造函数 
    private StringHelper(){};
    public static int StringToInt32(string input)
    {
        int result=0;
        Int32.TryParse(input, out result);
        return result;
    }
}
```

C#2中可以使用静态类来实现：

```
public static class StringHelper
{
    public static int StringToInt32(string input)
    {
        int result=0;
        Int32.TryParse(input, out result);
        return result;
    }
}
```

### 属性的访问级别

在C#1中声明属性，属性中的get和set的访问级别是和属性一致，要么都是public要么都是private，如果要实现get和set有不同的访问级别，则需要用一种变通的方式，自己写GetXXX和SetXXX方法。在C#2中可以单独设置get和set的访问级别，如下：

```
private string _name;
public string Name
{
    get { return _name; }
    private set { _name = value; }
}
```

需要注意的是，不能讲属性设置为私有的，而将其中的get或是set设置成公有的，也不能给set和get设置相同的访问级别，当set和get的访问级别相同时，我们可以直接设置在属性上。

### 命名空间别名

命名空间可以用来组织类，当不同的命名空间中有相同的类时，可以使用完全限定名来防止类名的冲突，C#1中可以使用空间别名来简化书写，空间别名用using关键字实现。但还有一些特殊情况，使用using并不能完全解决，所以C#2中提供了下面几种特性：

* 命名空间修饰符语法
* 全局命名空间别名
* 外部别名

我们在构建命名空间和类的时候，尽量避免出现冲突的情况，这个特性也较少用到。

### 友元程序集

当我们希望一个程序集中的类型可以被外部的**某些**程序集访问，这时如果设置成Public，就可以被所有的外部程序集访问。怎样只让部分程序集访问，就要使用友元程序集了，具体参考之前的博文《[C#：友元程序集（http://blog.fwhyy.com/2010/11/csharp-a-friend-assembly/）](http://blog.fwhyy.com/2010/11/csharp-a-friend-assembly/)》

### 可空类型

可空类型就是允许值类型的值为null。通常值类型的值是不应该为null的，但我们很多应用是和数据库打交道的，而数据库中的类型都是可以为null值的，这就造成了我们写程序的时候有时需要将值类型设置为null。在C#1中通常使用”魔值“来处理这种情况，比如DateTiem.MinValue、Int32.MinValue。在ADO.NET中所有类型的空值可以用DBNull.Value来表示。C#2中可空类型主要是使用System.Nullable<T>的泛型类型，类型参数T有值类型约束。可以像下面这样来定义可空类型：

```
Nullable<int> i = 20;
Nullable<bool> b = true;
```

C#2中也提供了更方便的定义方式，使用操作符?:

```
int? i = 20;
bool? b = true;
```

### 迭代器

C#2中对迭代器提供了更便捷的实现方式。提到迭代器，有两个概念需要了解

* 可枚举对象和枚举器，实现了System.Collections.IEnumerable接口的对象是可枚举对象，这些对象可以被C#中的foreach进行迭代；
* 实现了System.Collections.IEnumeror接口的对象被称为枚举器。在C#1中实现迭代器非常繁琐，

看下面一个例子：

```
public class Test 
{
    static void Main()
    {
        Person arrPerson = new Person("oec2003","oec2004","oec2005");
        foreach (string p in arrPerson)
        {
            Console.WriteLine(p);
        }
        Console.ReadLine();
    }
}
public class Person:IEnumerable 
{
    public Person(params string[] names)
    {
        _names = new string[names.Length];
        names.CopyTo(_names, 0);
    }
    public string[] _names;
    public IEnumerator GetEnumerator()
    {
        return new PersonEnumerator(this);
    }
    private string this[int index]
    {
        get { return _names[index]; }
        set { _names[index] = value; }
    }
}
public class PersonEnumerator : IEnumerator 
{
    private int _index = -1;
    private Person _p;
    public PersonEnumerator(Person p) { _p = p; }
    public object Current
    {
        get { return _p._names[_index]; }
    }
    public bool MoveNext()
    {
        _index++;
        return _index < _p._names.Length;
    }
    public void Reset()
    {
        _index = -1;
    }
}
```

C#2中的迭代器变得非常便捷，使用关键字yield return关键字实现，下面是C#2中使用yield return的重写版本：

```
public class Test 
{
    static void Main()
    {
        Person arrPerson = new Person("oec2003","oec2004","oec2005");
        foreach (string p in arrPerson)
        {
            Console.WriteLine(p);
        }
        Console.ReadLine();
    }
}
public class Person:IEnumerable 
{
    public Person(params string[] names)
    {
        _names = new string[names.Length];
        names.CopyTo(_names, 0);
    }
    public string[] _names;
    public IEnumerator GetEnumerator()
    {
        foreach (string s in _names)
        {
            yield return s;
        }
    }
}
```

### 匿名方法

匿名方法比较适用于定义必须通过委托调用的方法，用多线程来举个例子，在C#1中代码如下：

```
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
{
    label1.Text = i + "/100";
}
```

使用C#2中的匿名方法，上面的例子中可以省去DoWork和ChangeLabel两个方法，代码如下：

```
private void btnTest_Click(object sender, EventArgs e)
{
    Thread thread = new Thread(new ThreadStart(delegate() {
        for (int i = 0; i < 100; i++)
        {
            Thread.Sleep(100);
            this.Invoke(new Action(delegate() { label1.Text = i + "/100"; }));
        }
    }));
    thread.Start();
}
```

### 其他相关特性

* 固定大小缓冲区（Fixed-size buffers）
* 编译指令（Pragma directives）
* 委托的逆变协变

## C#3.0

| C# | VS版本 | CLR版本 | .NET Framework |
| --- | --- | --- | --- |
| 3.0 | VS2008 | 2.0 | 3.0 3.5 |

如果说C#2中的核心是泛型的话，那么C#3中的核心就应是Linq了，C#3中的特性几乎都是为Linq服务的，但每一项特性都可以脱离Linq来使用。下面就来看下C#3中有哪些特性。

### 自动实现的属性

这个特性非常简单，就是使定义属性变得更简单了。代码如下：

```
public string Name { get; set; }
public int Age { private set; get; }
```

### 隐式类型的局部变量和扩展方法

隐式类型的局部变量是让我们在定义变量时可以比较动态化，使用var关键字作为类型的占位符，然后由编译器来推导变量的类型。

扩展方法可以在现有的类型上添加一些自定义的方法，比如可以在string类型上添加一个扩展方法ToInt32，就可以像“20”.ToInt32()这样调用了。

具体参见《[C#3.0学习(1)—隐含类型局部变量和扩展方法(http://blog.fwhyy.com/2008/02/learning-csharp-3-0-1-implied-type-of-local-variables-and-extension-methods/)](http://blog.fwhyy.com/2008/02/learning-csharp-3-0-1-implied-type-of-local-variables-and-extension-methods/)》。

隐式类型虽然让编码方便了，但有些不少限制：

* 被声明的变量只能是局部变量，而不能是静态变量和实例字段；
* 变量在声明的同时必须初始化，初始化值不能为null；
* 语句中只能声明一个变量；

### 对象集合初始化器

简化了对象和集合的创建，具体参见《[C#3.0学习(2)—对象集合初始化器(http://blog.fwhyy.com/2008/02/learning-c-3-0-2-object-collection-initializer/)](http://blog.fwhyy.com/2008/02/learning-c-3-0-2-object-collection-initializer/)》。

### 隐式类型的数组

和隐式类型的局部变量类似，可以不用显示指定类型来进行数组的定义，通常我们定义数组是这样：

```
string[] names = { "oec2003", "oec2004", "oec2005" };
```

使用匿名类型数组可以想下面这样定义：

```
protected void Page_Load(object sender, EventArgs e)
{
    GetName(new[] { "oec2003", "oec2004", "oec2005" });
}
public string GetName(string[] names)
{
    return names[0];
}
```

### 匿名类型

匿名类型是在初始化的时候根据初始化列表自动产生类型的一种机制，利用对象初始化器来创建匿名对象的对象，具体参见《[C#3.0学习(3)—匿名类型（http://blog.fwhyy.com/2008/03/learning-csharp-3-0-3-anonymous-types/）](http://blog.fwhyy.com/2008/03/learning-csharp-3-0-3-anonymous-types/)》。

### Lambda表达式

实际上是一个匿名方法，Lambda表达的表现形式是：(参数列表)=>{语句}，看一个例子，创建一个委托实例，获取一个string类型的字符串，并返回字符串的长度。代码如下：

```
Func<string, int> func = delegate(string s) { return s.Length; };
Console.WriteLine(func("oec2003"));
```

使用Lambda的写法如下：

```
Func<string, int> func = (string s)=> { return s.Length; };
Func<string, int> func1 = (s) => { return s.Length; };
Func<string, int> func2 = s => s.Length;
```

上面三种写法是逐步简化的过程。

### Lambda表达式树

是.NET3.5中提出的一种表达方式，提供一种抽象的方式将一些代码表示成一个对象树。要使用Lambda表达式树需要引用命名空间System.Linq.Expressions，下面代码构建一个1+2的表达式树，最终表达式树编译成委托来得到执行结果：

```
Expression a = Expression.Constant(1);
Expression b = Expression.Constant(2);
Expression add = Expression.Add(a, b);
Console.WriteLine(add); //(1+2) Func<int> fAdd = Expression.Lambda<Func<int>>(add).Compile();
Console.WriteLine(fAdd()); //3 
```

Lambda和Lambda表达式树为我们使用Linq提供了很多支持，如果我们在做的一个管理系统使用了Linq To Sql，在列表页会有按多个条件来进行数据的筛选的功能，这时就可以使用Lambda表达式树来进行封装查询条件，下面的类封装了And和Or两种条件：

```
public static class DynamicLinqExpressions 
{
    public static Expression<Func<T, bool>> True<T>() { return f => true; }
    public static Expression<Func<T, bool>> False<T>() { return f => false; }

    public static Expression<Func<T, bool>> Or<T>(this Expression<Func<T, bool>> expr1,
                                                        Expression<Func<T, bool>> expr2)
    {
        var invokedExpr = Expression.Invoke(expr2, expr1.Parameters.Cast<Expression>());
        return Expression.Lambda<Func<T, bool>>
              (Expression.Or(expr1.Body, invokedExpr), expr1.Parameters);
    }

    public static Expression<Func<T, bool>> And<T>(this Expression<Func<T, bool>> expr1,
                                                         Expression<Func<T, bool>> expr2)
    {
        var invokedExpr = Expression.Invoke(expr2, expr1.Parameters.Cast<Expression>());
        return Expression.Lambda<Func<T, bool>>
              (Expression.And(expr1.Body, invokedExpr), expr1.Parameters);
    }
}
```

下面是获取条件的方法：

```
public Expression<Func<Courses, bool>> GetCondition()
{
    var exp = DynamicLinqExpressions.True<Courses>();
    if (txtCourseName.Text.Trim().Length > 0)
    {
        exp = exp.And(g => g.CourseName.Contains(txtCourseName.Text.Trim()));
    }
    if (ddlGrade.SelectedValue != "-1")
    {
        exp=exp.And(g => g.GradeID.Equals(ddlGrade.SelectedValue));
    }
    return exp;
}
```

### Linq

Linq是一个很大的话题，也是NET3.5中比较核心的内容，有很多书籍专门来介绍Linq，下面只是做一些简单的介绍，需要注意的是Linq并非是Linq To Sql，Linq是一个大的集合，里面包含：

* Linq To Object：提供对集合和对象的处理；
* Linq To XML：应用于XML；
* Linq To Sql：应用于SqlServer数据库；
* Linq To DataSet： DataSet；
* Linq To Entities：应用于SqlServer之外的关系数据库，我们还可以通过Linq的扩展框架来实现更多支持Linq的数据源。

下面以Linq To Object为例子来看看Linq是怎么使用的：

```
public class UserInfo 
{
    public string Name { get; set; }
    public int Age { get; set; }
}
public class Test 
{
    static void Main()
    {
        List<UserInfo> users = new List<UserInfo>()
        {
            new UserInfo{Name="oec2003",Age=20},
            new UserInfo{Name="oec2004",Age=21},
            new UserInfo{Name="oec2005",Age=22}
        };
        IEnumerable<UserInfo> selectedUser = from user in users
                                             where user.Age > 20
                                             orderby user.Age descending select user;
        foreach (UserInfo user in selectedUser)
        {
            Console.WriteLine("姓名:"+user.Name+",年龄:"+user.Age);
        }
        Console.ReadLine();
    }
}
```

可以看出，Linq可以让我们使用类似Sql的关键字来对集合、对象、XML等进行查询。

## C#4.0

| C# | VS版本 | CLR版本 | .NET Framework |
| --- | --- | --- | --- |
| 4.0 | VS2010 | 4.0 | 4.0 |

### 可选参数

VB在很早就已经支持了可选参数，而C#知道4了才支持，顾名思义，可选参数就是一些参数可以是可选的，在方法调用的时候可以不用输入。看下面代码：

```
public class Test 
{
    static void Main()
    {
        Console.WriteLine(GetUserInfo()); //姓名：ooec2003,年龄：30 
        Console.WriteLine(GetUserInfo("oec2004", 20));//姓名：ooec2004,年龄：20 
        Console.ReadLine();
    }
    public static string GetUserInfo(string name = "oec2003", int age = 30)
    {
        return "姓名：" + name + ",年龄：" + age.ToString();
    }
}
```

### 命名实参

命名实参是在制定实参的值时，可以同时指定相应参数的名称。编译器可以判断参数的名称是否正确，命名实参可以让我们在调用时改变参数的顺序。命名实参也经常和可选参数一起使用，看下面的代码：

```
static void Main()
{
    Console.WriteLine(Cal());//9 
    Console.WriteLine(Cal(z: 5, y: 4));//25 
    Console.ReadLine();
}
public static int Cal(int x=1, int y=2, int z=3)
{
    return (x + y) * z;
}
```

通过可选参数和命名参数的结合使用，我们可以减少代码中方法的重载。

### 动态类型

C#使用dynamic来实现动态类型，在没用使用dynamic的地方，C#依然是静态的。静态类型中当我们要使用程序集中的类，要调用类中的方法，编译器必须知道程序集中有这个类，类里有这个方法，如果不能事先知道，编译时会报错，在C#4以前可以通过反射来解决这个问题。看一个使用dynamic的小例子：

```
dynamic a = "oec2003";
Console.WriteLine(a.Length);//7 
Console.WriteLine(a.length);//string 类型不包含length属性，但编译不会报错，运行时会报错 
Console.ReadLine();
```

您可能会发现使用dynamic声明变量和C#3中提供的var有点类似，其他他们是有本质区别的，var声明的变量在编译时会去推断出实际的类型，var只是相当于一个占位符，而dynamic声明的变量在编译时不会进行类型检查。

dynamic用的比较多的应该是替代以前的反射，而且性能有很大提高。假设有一个名为DynamicLib的程序集中有一个DynamicClassDemo类，类中有一个Cal方法，下面看看利用反射怎么访问Cal方法：

```
namespace DynamicLib
{
    public class DynamicClassDemo 
    {
        public int Cal(int x = 1, int y = 2, int z = 3)
        {
            return (x + y) * z;
        }
    }
}
static void Main()
{
    Assembly assembly = Assembly.Load("DynamicLib");
    object obj = assembly.CreateInstance("DynamicLib.DynamicClassDemo");
    Type type = obj.GetType();
    MethodInfo method = type.GetMethod("Cal");
    Console.WriteLine(method.Invoke(obj, new object[] { 1, 2, 3 }));//9 
    Console.ReadLine();
}
```

用dynamic的代码如下：

```
Assembly assembly = Assembly.Load("DynamicLib");
dynamic obj = assembly.CreateInstance("DynamicLib.DynamicClassDemo");
Console.WriteLine(obj.Cal());
Console.ReadLine();
```

在前后端分离的模式下，WebAPI接口的参数也可以采用dynamic来定义，直接就可以解析前端传入的json参数，不用每一个接口方法都定义一个参数类型。不好的地方就是通过Swagger来生产API文档时，不能明确的知道输入参数的每个属性的含义。

C#4中还有一些COM互操作性的改进和逆变性和协变性的改进，我几乎没有用到，所以在此就不讲述了。

## C#5.0

| C# | VS版本 | CLR版本 | .NET Framework |
| --- | --- | --- | --- |
| 5.0 | VS2012\2013 | 4.0 | 4.5 |

### 异步处理

异步处理是C#5中很重要的一个特性，会涉及到两个关键字：async和await，要讲明白这个需要单独写一篇来介绍。

可以简单理解为，当Winform窗体程序中有一个耗时操作时，如果是同步操作，窗体在返回结果之前会卡死，当然在C#5之前的版本中有多种方法可以来解决这个问题，但C#5的异步处理解决的更优雅。

### 循环中捕获变量

与其说是一个特性，不如说是对之前版本问题的修复，看下面的代码：

```
public static void CapturingVariables()
{
    string[] names = { "oec2003","oec2004","oec2005"};
    var actions = new List<Action>();

    foreach(var name in names)
    {
        actions.Add(() => Console.WriteLine(name));
    }
    foreach(Action action in actions)
    {
        action();
    }
}
```

这段代码在之前的C#版本中，会连续输出三个oec2005，在C#5中会按照我们的期望依次输出oec2003、oec2004、oec2005。

如果您的代码在之前的版本中有利用到这个错误的结果，那么在升级到C#5或以上版本中就要注意了。

### 调用者信息特性

我们的程序通常是以release形式发布，发布后很难追踪到代码执行的具体信息，在C#5中提供了三种特性(Attribute), 允许获取调用者的当前编译器的执行文件名、所在行数与方法或属性名称。代码如下：

```
static void Main(string[] args)
{
    ShowInfo();

    Console.ReadLine();

}
public static void ShowInfo(
   [CallerFilePath] string file = null,
   [CallerLineNumber] int number = 0,
   [CallerMemberName] string name = null)
{
    Console.WriteLine($"filepath:{file}");
    Console.WriteLine($"rownumber:{number}");
    Console.WriteLine($"methodname:{name}");
}
```

调用结果如下：

```
filepath:/Users/ican_macbookpro/Projects/CsharpFeature/CsharpFeature5/Program.cs
rownumber:12
methodname:Main
```

## C#6.0

| C# | VS版本 | CLR版本 | .NET Framework |
| --- | --- | --- | --- |
| 6.0 | VS2015 | 4.0 | 4.6 |

在C#6中提供了不少的新功能，我认为最有用的就是Null条件运算符和字符串嵌入。

### Null条件运算符

在C#中，一个常见的异常就是“未将对象引用到对象的实例”，原因是对引用对象没有做非空判断导致。在团队中虽然再三强调，但依然会在这个问题上栽跟头。下面的代码就会导致这个错误：

```
class Program
{
	static void Main(string[] args)
	{
	    //Null条件运算符
	    User user = null;
	    Console.WriteLine(user.GetUserName());
	    Console.ReadLine();
	}
}
class User
{
	public string GetUserName() => "oec2003";
}
```

要想不出错，就需要对user对象做非空判断

```
if(user!=null)
{
    Console.WriteLine(user.GetUserName()); 
}
```

在C#6中可以用很简单的方式来处理这个问题

```
//Null条件运算符
User user = null;
Console.WriteLine(user?.GetUserName()); 
```

注：虽然这个语法糖非常简单，也很好用，但在使用时也需要多想一步，当对象为空时，调用其方法返回的值也是空，这样的值对后续的操作会不会有影响，如果有，还是需要做判断，并做相关的处理。

### 字符串嵌入

字符串嵌入可以简化字符串的拼接，很直观的就可以知道需要表达的意思，在C#6及以上版本中都应该用这种方式来处理字符串拼接，代码如下：

```
//字符串嵌入
string name = "oec2003";
//之前版本的处理方式1
Console.WriteLine("Hello " + name);
//之前版本的处理方式2
Console.WriteLine(string.Format("Hello {0}",name));
//C#6字符串嵌入的处理方式
Console.WriteLine($"Hello {name}");
```

### 其他相关特性

* 只读自动属性
* 自动属性初始化表达式
* using static
* nameof表达式
* 异常筛选器
* 使用索引器初始化关联集合

## C#7.0

| C# | VS版本  | .NET Framework |
| --- | --- | --- |
| 7.0 | VS2017 15.0 | .NET Core1.0 |
| 7.1 | VS2017 15.3 | .NET Core2.0 |
| 7.2 | VS2017 15.5 | .NET Core2.0 |
| 7.3 | VS2017 15.7 | .NET Core2.1 |

### out 变量

此特性简化了out变量的使用，之前的版本中使用代码如下：

```
int result = 0;
int.TryParse("20", out result);
Console.WriteLine(result);
```

优化后的代码，不需要事先定义一个变量

```
int.TryParse("20", out var result);
Console.WriteLine(result);
```

### 模式匹配

这也是一个减少我们编码的语法糖，直接看代码吧

```
public class PatternMatching
{
    public void Test()
    {
        List<Person> list = new List<Person>();
        list.Add(new Man());
        list.Add(new Woman());
        foreach (var item in list)
        {
        		 //在之前版本中此处需要做类型判断和类型转换
            if (item is Man man)
                Console.WriteLine(man.GetName());
            else if (item is Woman woman)
                Console.WriteLine(woman.GetName());
        }
    }
}
public abstract class Person
{
    public abstract string GetName();
}
public class Man:Person
{
    public override string GetName() => "Man";
}
public class Woman : Person
{
    public override string GetName() => "Woman";
}
```

详细参考官方文档：[https://docs.microsoft.com/zh-cn/dotnet/csharp/pattern-matching](https://docs.microsoft.com/zh-cn/dotnet/csharp/pattern-matching)

### 本地方法

可以在方法中写内部方法，在方法中有时需要在多个代码逻辑执行相同的处理，之前的做法是在类中写私有方法，现在可以让这个私有方法写在方法的内部，提高代码可读性。

```
static void LocalMethod()
{
    string name = "oec2003";
    string name1 = "oec2004";

    Console.WriteLine(AddPrefix(name));
    Console.WriteLine(AddPrefix(name1));
    
    string AddPrefix(string n)
    {
        return $"Hello {n}";
    }
}
```

### 异步 main 方法

这个最大的好处是，在控制台程序中调试异步方法变得很方便。

```
static async Task Main()
{
    await SomeAsyncMethod();
}
```

### private protected 访问修饰符

可以限制在同一个程序集中的派生类的访问，是对protected internal的一种补强，protected internal是指同一程序集中的类或派生类进行访问。

### 其他相关特性

* 元组优化(7.0)
* 弃元(7.0)
* Ref 局部变量和返回结果(7.0)
* 通用的异步返回类型(7.0)
* 数字文本语法改进(7.0)
* throw 表达式(7.0)
* 默认文本表达式(7.1)
* 推断元组元素名称(7.1)
* 非尾随命名参数(7.2)
* 数值文字中的前导下划线(7.2)
* 条件 ref 表达式（7.2）

## 总结

每个特性都需要我们去编码实现下，了解了真正的含义和用途，我们才能在工作中灵活的运用。

本文所涉及到的实例代码后面也会上传到Github上。

希望本文对您有所帮助。

