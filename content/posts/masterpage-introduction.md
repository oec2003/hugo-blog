---
title: MasterPage 小谈
date: 2008-12-06
categories: [技术]
tags: [AspNet,MasterPage]
---

## 设置Title

1 如果想所有使用了masterpage的页面都是用一个title ，可以在masterpage页中设置title，并将内容页中的title去掉，否则内容页中的title会将masterpage中的title覆盖。
<!--more-->

```
<%@ Page Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true"
CodeFile="MasterpageTest.aspx.cs" Inherits="MasterpageTest" Title="Test"%>
```

改成

```
<%@ Page Language="C#" MasterPageFile="~/MasterPage.master"
AutoEventWireup="true" CodeFile="MasterpageTest.aspx.cs" Inherits="MasterpageTest" %>
```

2 如果想每个页面中使用不同等title就比较简单，在内容页中设置就可以，masterpage中的title不用去管 ，应为最终会被内容页中的覆盖掉。

## 在内容页取 masterpage中的属性和字段

在内容页中取masterpage中的属性或字段应该是比较常用的。创建一个masterpage页MasterTest.master 和内容页Test.aspx，在MasterTest.master的后台代码中添加一个属性，如下：

```
private string m_Name;
public string Name
{
    get { return m_Name; }
    set { m_Name = value; }
}
```

然后在内容页的后台代码中你会发现不能访问masterpage中的属性，这时切换到内容页的源里 在上面添加

```
<%@ MasterType VirtualPath="~/MasterTest.master" %>
```

再切换到后台中 就可以访问masterpage中的属性了。

## MasterPage页的作用范围

1 页面级 通常情况下我们使用masterpage都是页面级的，就是在每个内容页中都会来指定masterpage的名字，通过MastPageFile属性来设置，如下：

```
<%@ Page Language="C#" MasterPageFile="~/MasterPage.master"  %>
```

2 应用程序级 这中就是只需在webconfig文件中做相应配置，全站所有的内容页都会引用设置的masterpage，如在webconfig中添加如下代码：

```
<configuration>
        <system.web>
            <pages masterPageFile="~/Test.master" />
        </system.web>
</configuration>
```

这样在内容页中就不用再去设置MastPageFile属性了，所有的内容页都会使用Test.master 。如果有些页面比较特殊需要用其他的masterpage ，可以这是MastPageFile属性，将会覆盖在webconfig中的配置。

用这种方法也可以对某些文件夹中的所有文件来进行设置，配置如下：

```
<configuration>
  <location path="Admin">
    <system.web>
      <pages masterPageFile="~/ Test.master " />
    </system.web>
  </location>
</configuration>
```

Location的path属性设置路径

