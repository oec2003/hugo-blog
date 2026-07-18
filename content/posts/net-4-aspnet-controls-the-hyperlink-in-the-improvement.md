---
title: Net4.0—AspNet中的控件HyperLink的改进（支持路由跳转）
date: 2010-07-28
categories: [技术]
tags: [AspNet, DotNet4, URL重写]
---

作过Web开发的人对HyperLink控件一定非常熟悉，在客户端生成的代码就是一个a标签。AspNet4中的Hyperlink控件相比以前的版本做了些改进，可以更好地支持URl重写，下面结合在[Net4.0—AspNet中URL重写的改进](http://blog.fwhyy.com/?p=20)一文中的例子来讲解下Hyperlink这个新的功能。

1 在项目中的Default.aspx页面中加入一个Hyperlink控件，在设计视图中右击该控件，选择属性，在属性窗口中选择Expresstions，如下图：

![2010-07-27_172142](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300729640.png)

2 点击右边的三个小点点，在弹出的对话框中进行如下设置：

![2010-07-27_172422](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300729586.png)

设置RouteName为productdetail，就是让该链接导向test.aspx页面，因为在Global.asax中设置名为productdetail的路由对应的物理文件时test.aspx。RouteValus就是配置参数项，此处的category和name也是在Global.asax中配置的。

3 设置好后点击OK，切换到代码视图，可以看到代码如下：

```
<asp:HyperLink ID="HyperLink1" runat="server"
    NavigateUrl="<%$ RouteUrl:RouteName=productdetail,category=computer,name=thinkpad %>">
    Test Page</asp:HyperLink>
```

4 设置Default.aspx为起始页，按F5运行，点击链接Test Page链接，会跳转到test.aspx页面，如下图：

![2010-07-27_173712](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300729625.png)

