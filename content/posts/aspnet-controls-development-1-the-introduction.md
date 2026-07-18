---
title: Asp.Net控件开发(1)—入门介绍
date: 2010-02-09
categories: [技术]
tags: [AspNet, 控件开发]
---

AspNet为我们提供了很多的控件，尽管如此，很多时候我们还是会感觉这些控件不够用，想根据自己的需求去定制一些控件，比如想在DropDownList控件中实现可以输入，AspNet并没有为我们提供这样的控件，这时就需要我们去编写自定义控件来满足需要。 本系列文章打算对AspNet控件开发做个入门级介绍，如果想了解更详细和深入可以参考[《深入解析ASP.NET 2.0控件开发》](http://www.douban.com/subject/2268475/)和[《纵向切入ASP.NET 3.5控件和组件开发技术》](http://www.douban.com/subject/3626223/)这两本书。

言归正传，通常我们开发自定义控件会创建一个类库项目，编写完代码后编译会生成一个dll文件，这个dll文件就是我们自己开发的控件了。假设现在已经有一个名为HelloWorld.dll的控件，按照下面方法可以将该控件用在我们的项目中。

1 在工具箱中点击右键->添加选项卡。选项卡可以任意命名，比如：MyControls

2 在新添加的选项卡区域中右键->选择项。选择HelloWorld.dll文件后确定，会看到控件已经添加到工具箱中，如下图：

![2010-12-28_235751](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290824855.png)

3 使用自定义控件和使用普通的AspNet控件一样，直接拖到页面中即可。将该控件拖入到页面中后，源视图中会添加如下代码：

```
<%@ Register Assembly="ControlsDemo1" Namespace="ControlsDemo1" TagPrefix="cc1" %>

 <cc1:HelloWorld ID="HelloWorld2" runat="server">
 </cc1:HelloWorld>
```

上面代码的第一行是注册该控件，TagPrefix属性指定控件的前缀，cc1是系统默认的前缀，我们也可以根据自己的喜好来自定义前缀，如下：

```
<%@ Register Assembly="ControlsDemo1" Namespace="ControlsDemo1" TagPrefix="oec2003" %>
    <oec2003:HelloWorld ID="HelloWorld1" runat="server">
    </oec2003:HelloWorld>
```

`<%@ Resgiter />`指令只是在单个页面中使用，我们还可以通过在web.config中配置来使全局都能够使用。web.config配置如下：

```
<system.web>
  <pages>
    <controls>
      <add assembly="ControlsDemo1" namespace="ControlsDemo1" tagPrefix="oec2003"/>
    </controls>
  </pages>
</system.web>
```

上面简单介绍了怎样使用一个已经编写好的自定义控件，并且知道编写一个自定义控件通常是创建一个类库项目。现在就来看看一个自定义控件的具体实现方法。

实现一个自定义控件，我们需要选择一个基类，这些基类有控件需要的最基本的功能，下面的三个类就是开发控件常用的基类。

```
System.Web.UI.Control
System.Web.UI.WebControls.WebControl
System.Web.UI.WebControls.CompositeControl
```

* Control：控件开发的基类，所有控件都直接或间接继承该类。该类的扩展性和灵活性最强。
* WebControl：该类继承自Control类，除了有Control的所有属性外，还提供布局样式等特性。比较适合对布局和外观样式要求较高的控件。和Control相同的是都适用于开发单个控件。
* CompositeControl：该类为AspNet2.0提供的一个控件基类。如果想把现有控件组合起来创建一个组合控件时，可以继承此类，此类继承了WebControl并实现了INamingContainer接口。

如果我们只是对某一个现有的AspNet控件进行简单的扩充，我们可以用现有的任一控件作为基类。

Control类最基础灵活性最强，那么就先以Control类为基类实现一个简单的HelloWorld控件。在新建的项目中创建一个类HelloWorld，继承Control，并重写Render方法，代码如下：

```
public class HelloWorld:Control
{
    protected override void Render(HtmlTextWriter writer)
    {
        writer.WriteLine("hello world!");
    }
}
```

编译后按照上面介绍的方法添加到工具箱中，然后拖到页面，运行后会在页面上呈现Hello world文本。现在对上面的代码做点改动让hello world文本的显示区加上边框和背景色，代码如下：

```
public class HelloWorld:Control
{
    protected override void Render(HtmlTextWriter writer)
    {
        writer.WriteLine(@"<div style=""width:200px;height:100px;
                border:1px solid #4DA9C2;background-color:#C3D9FF"" >");
        writer.WriteLine("hello world!");
        writer.WriteLine(@"</div>");
    }
}
```

运行后的效果：

![2010-12-28_235833](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290825971.png)

效果虽然出来了，但是代码中是使用直接输出html代码和内嵌样式的方式，这样做当然是不好的，不是很好扑捉错误并且生成到客户端的html代码格式也不好。这个问题我们可以通过HtmlTextWriterAttribute、HtmlTextWriterTag、HtmlTextWriterStyle这三个枚举来解决。看下面代码：

```
public class HelloWorld:Control
{
    protected override void Render(HtmlTextWriter writer)
    {
        writer.AddStyleAttribute(HtmlTextWriterStyle.BorderWidth, "1px");
        writer.AddStyleAttribute(HtmlTextWriterStyle.BorderStyle, "solid");
        writer.AddStyleAttribute(HtmlTextWriterStyle.BorderColor, "#4DA9C2");
        writer.AddStyleAttribute(HtmlTextWriterStyle.BackgroundColor, "#C3D9FF");
        writer.AddStyleAttribute(HtmlTextWriterStyle.Width, "200px");
        writer.AddStyleAttribute(HtmlTextWriterStyle.Height, "100px");
        writer.RenderBeginTag(HtmlTextWriterTag.Div);

        writer.WriteLine("hello world!");

        writer.RenderEndTag();
    }
}
```

运行后效果和上面一样。并且查看页面的源代码可以看出用这种方式生成的html有规范的缩进，并且代码也是符合xhtml规范的，所以建议尽量使用这种方式而不是直接拼写html代码。

现在我们来使用WebControl作为基类来实现上面的效果，需要重写TagKey属性以及RenderContents和AddAttributesToRender方法，默认的TagKey为Span，而我们需要的是Div所以需要重写为Div，代码如下：

```
protected override HtmlTextWriterTag TagKey
{
    get
    {
        return HtmlTextWriterTag.Div;
    }
}
```

AddAttributesToRender方法用来设置div的样式及属性

```
protected override void AddAttributesToRender(HtmlTextWriter writer)
{
    base.AddAttributesToRender(writer);
    writer.AddStyleAttribute(HtmlTextWriterStyle.BorderWidth, "1px");
    writer.AddStyleAttribute(HtmlTextWriterStyle.BorderStyle, "solid");
    writer.AddStyleAttribute(HtmlTextWriterStyle.BorderColor, "#4DA9C2");
    writer.AddStyleAttribute(HtmlTextWriterStyle.BackgroundColor, "#C3D9FF");
    writer.AddStyleAttribute(HtmlTextWriterStyle.Width, "200px");
    writer.AddStyleAttribute(HtmlTextWriterStyle.Height, "100px");
}
```

RenderContents方法用来呈现内容，此处的内容为“hello world！”，所以只有一行代码，当然也可以是其他的一些控件。

```
protected override void RenderContents(HtmlTextWriter writer)
{
    writer.WriteLine("hello world!");
}
```

使用WebControl做基类的完整代码：

```
public class HelloWorld:WebControl
{
    protected override HtmlTextWriterTag TagKey
    {
        get
        {
            return HtmlTextWriterTag.Div;
        }
    }
    protected override void AddAttributesToRender(HtmlTextWriter writer)
    {
        base.AddAttributesToRender(writer);
        writer.AddStyleAttribute(HtmlTextWriterStyle.BorderWidth, "1px");
        writer.AddStyleAttribute(HtmlTextWriterStyle.BorderStyle, "solid");
        writer.AddStyleAttribute(HtmlTextWriterStyle.BorderColor, "#4DA9C2");
        writer.AddStyleAttribute(HtmlTextWriterStyle.BackgroundColor, "#C3D9FF");
        writer.AddStyleAttribute(HtmlTextWriterStyle.Width, "200px");
        writer.AddStyleAttribute(HtmlTextWriterStyle.Height, "100px");
    }
    protected override void RenderContents(HtmlTextWriter writer)
    {
        writer.WriteLine("hello world!");
    }
}
```

本文首先介绍了自定义控件的使用方法，然后讲了使用不同类做基类的自定义控件的简单实现方法，应该说算是走进了开发控件的大门了，关于CompositeControl以及其他更深入的内容将在后面介绍。

