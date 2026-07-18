---
title: C#3.0学习(2)—对象集合初始化器
date: 2008-02-25
categories: [技术]
tags: [C#,DotNet3.0]
---

创建一个对象时可以包含一个对象初始化器或集合初始化器，用于初始化所创建对象的成员或新创建的集合的元素。使用初始化器可以让我们的代码变得更简洁。
<!--more-->

## 对象初始化器

在以前如果定义了一个类，并将类实例化，我们会像下面这样做

```
public class oec2003
{
    int x,y;
    public int X
    {
        get{return x;}
        set{x=value;}
    }
    public int Y
    {
        get{return x;}
        set{x=value;}
    }

}
```

调用

```
oec2003 o=new oec2003();
o.X=2003;
o.Y=2004;
```

使用对象初始化器

```
public class oec2003
{
    int x, y;
    public int X
    {
        get { return x; }
        set { x = value; }
    }
    public int Y
    {
        get { return x; }
        set { x = value; }
    }
}
```

调用

```
var o=new oec2003{X=2003,Y=2004};
```

对象初时化器是利用了编译器对对象中的对外可见的字段或属性进行按序赋值，在编译还是隐式调用了构造函数，对字段或属性的赋值可以是一个或是多个。

## 集合初时化器

集合初始化器会对初始化器中的元素进行按序调用，下面是一个集合初时化器的例子

```
List<int> num= new List<int> { 0, 1, 2, 6, 7, 8, 9 };
```

应用集合初始化器的对象的类型必须实现了System.Collections.Generic.ICollections<T>接口并指定了确定的T。集合初始化器将依次对每个指定的元素调用ICollection<T>.Add(T)。

有下面这样一个类，记录一个人的个人信息

```
public class Oec2003Info
{
    string name;
    int age;
    List<string> phoneNumbers = new List<string>();

    public string Name
    {
        get { return name; }
        set { name = value; }
    }
    public string Age
    {
        get { return age; }
        set { age = value; }
    }
    public List<string> PhoneNumbers
    {
        get { return phoneNumbers; }
    }
}
```

以前的做法

```
var oec2003infos = new List<Oec2003Info>();

var tmp1= new Oec2003Info();
tmp1.Name = "oec2003";
tmp1.Age=100;
tmp1.PhoneNumbers.Add("
tmp1.PhoneNumbers.Add("1592********");
Oec2003Info.Add(tmp1);

var tmp2 = new Oec2003Info();
tmp2 .Name = "oec2003";
  tmp2.Age=100;
tmp2.PhoneNumbers.Add("1593********");
tmp3.PhoneNumbers.Add("1594********");
Oec2003Info.Add(tmp2);
```

使用对象初始化器

```
var oec2003infos= new List<Oec2003Info>
{
    new Oec2003Info
    {
        Name = "oec2003",
        Age=100;
        PhoneNumbers={"1591********","1592**********"}

    },

    new Oec2003Info
    {
        Name = "oec2003",
        Age=100;
        PhoneNumbers = { "1593********","1594*********"}

    }
};
```

