---
title: C#：8.0 & 9.0 常用新特性
date: 2021-04-19T08:05:00+08:00
categories: [技术]
tags: [C#,新特性]
---

在《[带你了解C#每个版本新特性](http://mp.weixin.qq.com/s?__biz=MzU0NjgzNzQyMw==&mid=2247483852&idx=1&sn=8a7fd3a21e0c174bb237d59d802131a9&chksm=fb56c70ccc214e1aaf4037521134d2f3a5cfe54dac1f0dd06b52cb53794379946ebfa7a25890&scene=21#wechat_redirect)》 一文中介绍了，C# 1.0 到 7.0 的不同特性，本文接着介绍在 8.0 和 9.0 中的一些常用新特性。

<!--more-->

## C# 8.0

在 dotNET Core 3.1 及以上版本中就可以使用 C# 8 的语法，下面是 C# 8 中我认为比较常用的一些新功能。

### 默认接口方法

接口是用来约束行为的，在 C# 8 以前，接口中只能进行方法的定义，下面的代码在 C# 8 以前是会报编译错误的：

```
public interface IUser
{
    string GetName() =>  "oec2003";
}
```

![iShot2022-02-02 06.23.24](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020623854.jpg)

那么在 C# 8 中，可以正常使用上面的代码，也就是说可以对接口中的方法提供默认实现。

接口默认方法最大的好处是，当在接口中进行方法扩展时，之前的实现类可以不受影响，而在 C# 8 之前，接口中如果要添加方法，所有的实现类需要进行新增接口方法的实现，否则编译失败。

C# 中不支持多重继承，主要的原因是会导致菱形问题：

![iShot2022-02-02 06.23.50](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020624100.jpg)

- 类 A  是一个抽象类，定义有一个 方法 Test；
- 类 B 和 类 C 继承自抽象类 A，并有各自的实现；
- 类 D 同时继承类 B 和类 C；

当调用类 D 的 Test 方法时，就不知道应该使用 B 的 Test 还是 C 的 Test，这个就是菱形问题。

而接口是允许多继承的，那么当接口支持默认方法时，是否也会导致菱形问题呢？看下面代码：

```
public interface IA
{
    void Test() => Console.WriteLine("Invoke IA.Test");
}
public interface IB:IA
{
    void Test() => Console.WriteLine("Invoke IB.Test");
}
public interface IC:IA
{ 
    void Test() => Console.WriteLine("Invoke IC.Test");
}
public class D : IB, IC { }

static void Main(string[] args)
{
    D d = new D();
    d.Test();
}
```

上面的代码是无法通过编译的，因为接口的默认方法不能被继承，所以类 D 中没有 Test 方法可以调用，如下图：

![iShot2022-02-02 06.24.16](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020624802.jpg)

所以，必须通过接口类型来进行相关方法的调用：

```
static void Main(string[] args)
{
    IA d1 = new D();
    IB d2 = new D();
    IC d3 = new D();
    d1.Test();  // Invoke IA.Test
    d2.Test();  // Invoke IB.Test
    d3.Test();  // Invoke IC.Test
}
```

也正是因为必须通过接口类型来进行调用，所以也就不存在菱形问题。而当具体的类中有对接口方法实现的时候，就会调用类上实现的方法：

```
public interface IA
{
    void Test() => Console.WriteLine("Invoke IA.Test");
}
public interface IB:IA
{
    void Test() => Console.WriteLine("Invoke IB.Test");
}
public interface IC:IA
{ 
    void Test() => Console.WriteLine("Invoke IC.Test");
}
public class D : IB, IC 
{
    public void Test() => Console.WriteLine("Invoke D.Test");
}
static void Main(string[] args)
{
    IA d1 = new D();
    IB d2 = new D();
    IC d3 = new D();
    d1.Test();  // Invoke D.Test
    d2.Test();  // Invoke D.Test
    d3.Test();  // Invoke D.Test
}
```

类可能同时继承类和接口，这时会优先调用类中的方法：

```
public class A
{
    public void Test() => Console.WriteLine("Invoke A.Test");
}
public interface IA
{
    void Test() => Console.WriteLine("Invoke IA.Test");
}

public class D : A, IA { }
static void Main(string[] args)
{
    D d = new D();
    IA d1 = new D();
    d.Test();  // Invoke A.Test
    d1.Test();  // Invoke A.Test
}
```

关于默认接口方法，总结如下：

- 默认接口方法可以让我们在往底层接口中扩展方法的时候变得比较平滑；
- 默认方法，会优先调用类中的实现，如果类中没有实现，才会去调用接口中的默认方法；
- 默认方法不能够被继承，当类中没有自己实现的时候是不能从类上直接调用的。

### using 变量声明

我们都知道 using 关键字可以导入命名空间，也能定义别名，还能定义一个范围，在范围结束时销毁对象，在 C# 8.0 中的 using 变量声明可以让代码看起来更优雅。

在没有 using 变量声明的时候，我们是这样使用的：

```
static void Main(string[] args)
{
    var connString = "Host=221.234.36.41;Username=gpadmin;Password=123456;Database=postgres;Port=54320";
    using (var conn = new NpgsqlConnection(connString))
    {
        conn.Open();

        using (var cmd = new NpgsqlCommand("select * from user_test", conn))
        {
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                    Console.WriteLine(reader["user_name"]);
            }
        }
    }
    Console.ReadKey();
}
```

当调用层级比较多时，会出现 using 的嵌套，对影响代码的可读性，当然，当两个 using 语句中间没有其他代码时，可以这样来优化：

```
static void Main(string[] args)
{
    var connString = "Host=221.234.36.41;Username=gpadmin;Password=123456;Database=postgres;Port=54320";
    using (var conn = new NpgsqlConnection(connString))
    {
        conn.Open();

        using (var cmd = new NpgsqlCommand("select * from user_test", conn))
        using (var reader = cmd.ExecuteReader())
                while (reader.Read())
                    Console.WriteLine(reader["user_name"]);
    }
    Console.ReadKey();
}
```

使用 using 变量声明后的代码如下：

```
static void Main(string[] args)
{
    var connString = "Host=221.234.36.41;Username=gpadmin;Password=123456;Database=postgres;Port=54320";
    using var conn = new NpgsqlConnection(connString);
    conn.Open();

    using var cmd = new NpgsqlCommand("select * from user_test", conn);
    using var reader = cmd.ExecuteReader();

    while (reader.Read())
       Console.WriteLine(reader["user_name"]);
     Console.ReadKey();
}
```

### Null 合并赋值

这是一个很有用的语法糖，在 C# 中如果调用一个为 Null 的引用类型上的方法，会出现经典的错误：”未将对应引用到对象的实例“，所以我们在返回引用类型时，需要做些判断：

```
static void Main(string[] args)
{
    List<string> list = GetUserNames();
    if(list==null)
    {
        list = new List<string>();
    }
    Console.WriteLine(list.Count);
}
public static List<string> GetUserNames()
{
    return null;
}
```

在 C# 8 中可以使用 ??= 操作符更简单地实现：

```
static void Main(string[] args)
{
    List<string> list = GetUserNames();
    list ??= new List<string>();
    Console.WriteLine(list.Count);
}
```

当 list 为 null 时，会将右边的值分配给 list 。

## C# 9.0

在 .NET 5 中可以使用 C# 9 ，下面是  C# 9 中几个常用的新特性。

### init

init 是属性的一种修饰符，可以设置属性为只读，但在初始化的时候却可以指定值:

```
public class UserInfo
{
    public string Name { get; init; }
}
UserInfo user = new UserInfo { Name = "oec2003" };
//当 user 初始化完了之后就不能再改变 Name 的值
user.Name = "oec2004";
```

上面代码中给 Name 属性赋值会出现编译错误：

![iShot2022-02-02 06.24.41](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020624612.jpg)

### record

在 C# 9 中新增了 record 修饰符，record 是一种引用类型的修饰符，使用 record 修饰的类型是一种特别的 class，一种不可变的引用类型。

我们创建一个名为 UserInfo 的 class ，不同的实例中即便属性值完全相同，这两个实例也是不相等的，看下面代码：

```
public class UserInfo
{
    public string Name { get; set; }
}
static void Main(string[] args)
{
    UserInfo user1 = new UserInfo { Name = "oec2003" };
    UserInfo user2 = new UserInfo { Name = "oec2003" };

    Console.WriteLine(user1== user2); //False
}
```

如果使用 record ，将会看到不一样的结果，因为 record 中重写了 ==、Equals 等 ，是按照属性值的方式来进行比较的：

```
public record UserInfo
{
    public string Name { get; set; }
}
static void Main(string[] args)
{
    UserInfo user1 = new UserInfo { Name = "oec2003" };
    UserInfo user2 = new UserInfo { Name = "oec2003" };

    Console.WriteLine(user1== user2); //True
}
```

在 class 中我们经常将一个对象的实例赋值给另一个值，对赋值后的对象实例进行属性值的改变会影响到原对象实例：

```
public class UserInfo
{
    public string Name { get; set; }
}
static void Main(string[] args)
{
    UserInfo user = new UserInfo { Name = "oec2003" };

    UserInfo user1 = user;
    user1.Name = "oec2004";
    Console.WriteLine(user.Name); // oec2004
}
```

如果想要不影响原对象实例，就需要使用到深拷贝，在 record 中，可以使用 with 语法简单地达到目的：

```
public record UserInfo
{
    public string Name { get; set; }
}
static void Main(string[] args)
{
    UserInfo user = new UserInfo { Name = "oec2003" };
    UserInfo user1 = user with { Name="eoc2004"};

    Console.WriteLine(user.Name); // oec2003
    Console.WriteLine(user1.Name); // oec2004
}
```

### 模式匹配增强

模式匹配中我觉得最有用的就是对 Null 类型的判断，在 9.0 中支持这样的写法了：

```
public static string GetUserName(UserInfo user)
{
    if(user is not null)
    {
        return user.Name;
    }
    return string.Empty;
}
```

### 顶级语句

这个不知道有啥用？但挺好玩的，创建一个控制台程序，将 Program.cs 中的内容替换为下面这一行，程序也能正常运行：

```
System.Console.WriteLine("Hello World!");
```



除此之外，在 C# 8.0 和 9.0 中还有一些其他的新功能，我目前没有用到或者我觉得不太常用，就没有写在本文中了。

希望本文对您有所帮助。
