---
title: Net4.0—对HTML净化的处理
date: 2010-07-28
categories: [技术]
tags: [AspNet, DotNet4]
---

在使用Asp.Net进行Web开发时我一直都很注重最终生成的HTML是否干净，所以我会使用Repeater取代GridView等控件，可控性好而且生成的HTML代码也非常干净。干净的HTML有很多好处，如代码相应较少加载速度快，便于控制页面元素等。在AspNet4中对HTML的净化做了很大的改进，下面的文字中会做一个简单的介绍。

## 设置controlRenderingCompatibilityVersion

controlRenderingCompatibilityVersion需要在Webconfig文件中设置，配置在Pages节点中，可以设置使用3.5还是4.0的引擎来渲染HTML，默认是使用4.0。

![2010-07-28_143021](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300730129.png)

在VS2010中创建一个AspNet项目，在项目中的site.master中会有一个Menu控件来显示导航，代码如下：

```
<asp:Menu ID="NavigationMenu" runat="server" CssClass="menu"
EnableViewState="false" IncludeStyleBlock="false" Orientation="Horizontal">
    <Items>
        <asp:MenuItem NavigateUrl="~/Default.aspx" Text="Home"/>
        <asp:MenuItem NavigateUrl="~/About.aspx" Text="About"/>
    </Items>
</asp:Menu>
```

分别设置 controlRenderingCompatibilityVersion属性值为3.5和4.0，运行项目，看到页面源码的区别如下：

4.0

![2010-07-28_150119](http://fwhyy.com/img/post/2010-07-28_150119.png)

3.5

![2010-07-28_150528](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300730347.png)

可以看出使用4.0的引擎是将Menu控件生成的Ul 标签，而3.5中是生成的table，代码的复杂度明显大了很多。当然并不只是对Menu控件进行了优化，还有其他一些方面如：

* 一些控件的内置样式被去掉，而是在页面中生成样式代码；
* 模板控件中移除了外表表格渲染；
* 向导类控件使用站位符控制层。

## 使用ClientIDMode

在继承了masterpage页的页面中添加其他的服务器控件，最终呈现的HTML的的ID都会改变，如下：

![2010-07-28_152923](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300731072.png)

AspNet4中可以使用ClientIDMode来改变这一局面，ClientIDMode在页面的Page指令中设置，如下：

```
<%@ Page Title="" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
CodeBehind="test.aspx.cs" Inherits="UrlRewriterDemo.test" ClientIDMode="Static" %>
```

将ClientIDMode设置为Static后，刷新页面查看源代码，控件的ID变成本来面目了，如下：

![2010-07-28_154000](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300731621.png)

ClientIDMode有四个属性值：AutoID、Inherit、Predictable和Static，下面以上面的按钮为例，列出分别在这四种属性值下呈现的ID值：

* AutoID：ctl00_MainContent_btnTest
* Inherit：MainContent_btnTest
* Predictable：MainContent_btnTest
* Static：btnTest

## 对ViewState更细致化的管理

ViewState是让人又爱又恨的东西，控制不好会使页面变得非常庞大，在AspNet4中可以使用ViewStateMode对ViewState进行更细致化的管理。ViewStateMode可以在页面级设置也可以在控件级设置，有三个属性值：

* Inherit：从父控件中继承；
* Enabled：当父控件的ViewState处于Disabled状态时可以设置当前控件ViewState可用；
* Disabled：当父控件的ViewState处于Enalbed状态时可以设置当前控件ViewState禁用。

在以前的AspNet版本中有个EnableViewState属性可以来设置ViewState，不过ViewStateMode和EnableViewState还是有很大区别的：

### EnableViewState

* 其值为布尔类型，决定其控件或是子控件是否开启ViewState；
* 优先级别大于ViewStateMode，只要 EnableViewState设置为false，就算设置了ViewStateMode为Enabled，控件的ViewState还是关闭的；
* 当设置父控件的EnableViewState为false后，其子控件的ViewState就都关闭了，不能在子控件中单独开启ViewState。

### ViewStateMode

* 在父控件以及本身的EnableViewState设置为true时，才会起作用；
* 子控件不受父控件ViewStateMode的影响；
* 在父控件中设置ViewStateMode为Disabled后，可以在子控件中设置ViewStateMode为Enabled来开启子控件的ViewState。

