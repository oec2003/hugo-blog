---
title: C#3.0学习(1)—隐含类型局部变量和扩展方法
date: 2008-02-22
categories: [技术]
tags: [C#,DotNet3.0]
---

## 隐含类型局部变量

隐含类型的局部变量是用var关键字来声明的，如下：

```
var i = 123;
var h=123.123;
var s = “oec2003";
var intArr = new[] {1,2,3,4} ;
var a = new[] { 1, 10, 100, 1000 };
```

乍一看有点像javascript中的声明方式，虽然关键字一样但是有着本质区别。

在c#3.0中用var关键字声明的变量被赋值后，在编译时编译器会根据变量值的类型自动推断出变量的类型。所以仍然是强类型，这点和object不同。其实var 关键字并不是一个具体的类型，只是起到了一个占位符的作用，编译后将替换成相应的类型。要注意的一点是用var声明的变量一定要赋初始值，否则会出现编译错误，因为如果不赋值就无法根据值来推断变量的类型。

var只能声明局部变量，而且可以在foreach中使用，如：

```
var nums=new []{1,2,3,4,5};
foreach(var i in nums)
{

}
```

## 扩展方法

这是个非常有用的特性，扩展方法允许我们在不改变源码的情况下添加现有类型中的实例方法。扩展方法所在的类必须为静态类。如下：

```
public static class oec2003Extensions
{
    public static bool IsValidEmail(this String s)
    {
        Regex regex = new Regex(@"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$");
        return regex.IsMatch(s);
    }
}
```

上面的IsValidEmail静态方法在静态类oec2003Extensions类中，这个类可以在任何的名称空间下，在要用的地方引用名称空间就行。IsValidEmail方法的作用是用来验证电子邮件。方法中有三个参数：this  String  s 。this只是一个编译上的要求，作为一个提示来告诉编译器此方法有可能作为扩展方法来使用；String就是我们需要扩展的类型；s则为要验证邮件的内容。下面来看看怎样来使用此扩展方法。

```
protected void Button2_Click(object sender, EventArgs e)
{
    if (this.TextBox1.Text.Trim().IsValidEmail())
    {
        Response.Write("email is right");
    }
    else
    {
        Response.Write("email is error");
    }
}
```

是不是很神奇，在string类型中就多了一个刚才添加的IsValidEmail方法，可以直接调用，用来实现邮件地址的验证。

