---
title: C#:友元程序集
date: 2010-11-15
categories: [技术]
tags: [C#,友元程序集]
---

C#中的访问修饰符Internal可以说是介于Public和Private之间，可以使类型在同程序集中可以被互相访问。但有时会有这样的需求，我们希望一个程序集中的类型可以被外部的某些程序集可以访问，这时当然不能设置成Public，否则可以被所有的外部程序集访问。要达到上述要求我们可以使用友元程序集。

下面用一个简单的例子来介绍下友元程序集。

1 在一个解决方案中创建两个类库项目TestA和TestB，分别在两个类库项目中创建类A和类B。

![2010-11-14_175103](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290807599.png)

2 在项目TestA中添加对项目TestB的引用。

3 将项目TestB中的类B访问级别设置为Internal。

```
namespace TestB
{
    internal class B
    {

    }
}
```

4 现在在TestA项目的类A中是肯定不能访问到类B的，如果想让类A可以访问类B，必须将项目TestA的程序集添加为项目TestB程序集的友元程序集。添加友元程序集我们要使用InternalIsVisibleTo特性，使用该特性需要添加命名空间

```
using System.Runtime.CompilerServices。
```

5 在B类中使用InternalIsVisibleTo特性将程序集TestA添加为友元程序集。

```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.CompilerServices;
[assembly: InternalsVisibleTo("TestA")]
namespace TestB
{
    internal class B
    {

    }
}
```

6 InternalIsVisibleTo特性也可以添加到AssemblyInfo.cs中。

![2010-11-14_181114](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290808640.png)

7 现在在项目TestA的类A中就可以访问TestB项目的类B了。

![2010-11-14_181324](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290808258.png)

