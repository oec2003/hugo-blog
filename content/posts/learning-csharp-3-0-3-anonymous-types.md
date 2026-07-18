---
title: C#3.0学习(3)—匿名类型
date: 2008-03-09
categories: [技术]
tags: [C#,DotNet3.0]
---

匿名类型是在初始化的时候根据初始化列表自动产生类型的一种机制，利用对象初始化器来创建匿名对象的对象。如:
<!--more-->

```
var oec=new {Name="oec2003", Age=100}
```

在创建对象的语句中用到了var和new两个关键字，

var关键字用来声明一个匿名类型的对象名字，var和Object不同，她是一种强类型，在此是起到了一个占位符的作用，编译时编译器会推断出实际类型。

new关键字后直接是一对大括号，并不是类型名称，因为匿名类型的名字是在编译时由编译器自动生成。大括号里的Name和Age为匿名类型的属性，可以看到是在Name和Age的后面直接赋值，并没有指明类型，也将由编译器来推断出他们的类型，比如编译后会将Name推断为string型，Age推断为Int型。所以我们可以看到匿名类型给我们带来了很大的方面和灵活性，同时也将使代码变得不易看懂。

上面的代码经过编译后会产生类似如下代码

```
class Anonymous1
{
    private int _name = oec2003;
    private int _age = 100;

    public int a
    {
        get { return _name; }
        set { _name = value; }
    }
    public int b
    {
        get { return _age; }
        set { _age = value; }
    }
}
```

在同一个程序中如果定义的不同匿名类型中的对象初始化器中的名称，类型，和顺序都相同，将会长生同一个匿名类型的不同实例，如下:

```
var oec1=new {Name="oec2003" ,Age=100}
var oec2=new {Name="oec2004" ,Age=200}
oec1=oec2
```

我们可以这样来访问匿名类型中的成员

```
var oec=new {Name="oec2003", Age=100}
string name=oec.Name;
int age=oec.Age
```

