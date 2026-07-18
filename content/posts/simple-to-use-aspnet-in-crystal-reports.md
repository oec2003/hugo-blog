---
title: Asp.Net中水晶报表的简单使用
date: 2007-01-11
categories: [技术]
tags: [AspNet,水晶报表]
---

Crystal Reports是具有强大内容创建和集成功能的高效的报表技术，是第三方开发的报表工具，使用水晶报表我们可以更好地向用户展示数据。以前可以通过编程的方式将数据集中的数据进行处理后在windows应用程序或web应用程序中输出显示，但如果要做超出了基本格式化的一些工作如：求和、平均、多极汇总、制作图标等就会显得比较复杂，而水晶报表正好弥补了其中的不足。
<!--more-->
在windows应用程序和web应用程序中我们都可以使用水晶报表，不过在windows应用程序中的水晶报表要比web应用程序中的功能强大，可以很容易地实现打印和导出功能。在这儿只讨论一下在asp.net中水晶报表的一些简单使用。

在asp.net中使用水晶报表专家，可以很快速地创建报表，虽然水晶报表是第三方开发的，但在vs2003中水晶报表已经成为了开发环境的一个组成部分。先做一个很简单的小例子。新建一个web应用程序，在页面上添加工具箱中web窗体下的Button控件，CrystalReportViewer控件（这个就是水晶报表控件）和html下的File Field控件。File Field控件可以让我们从本地选择一个文件，要想实现水晶报表的显示我们首先需要一个水晶报表文件，该文件的后缀为rpt，这个文件可以通过添加新项添加。现在假设已经有一个水晶报表文件，通过以下几步就可以在页面上显示。

1 双击页面进入代码环境在page_load事件中添加如下代码：

```
if(Session["filename"]!=null)
{
    CrystalReportViewer1.ReportSource = Session["filename"].ToString();
}
```

这段代码主要是将文件的名字保存在session里面在pageload事件中加以判断，避免在刷新页面的时候出现错误。

2 在Button按钮的单击事件中添加以下代码：

```
string strName = File1.PostedFile.FileName;
if(strName.Trim()!="")
{
    CrystalReportViewer1.ReportSource = strName;
    Session["filename"] = strName;
}
```

然后按F5运行，选择一个已经做好的rpt文件，点击按钮就可以看见页面上显示的报表结果了。

在整个过程中重要的还是水晶报表文件的建立，水晶报表的创建有pull和push两种模式，pull模式是直接指定数据库驱动然后组装这些数据，push模式需要自己写代码来连接数据库，并将它们传至报表，push模式比pull要更灵活。

由于篇幅原因先说一下pull模式：

在页面中添加一个rpt文件，这时会弹出一个对话框，选择作为空白报表然后点击确定。

在右边的“字段资源管理器”中右键点击“数据库字段”选择“添加删除数据库”，会弹出数据库专家的对话框，选择可用数据源中的OLEDB(ADO)根据向导创建数据库的连接。

建立好数据库连接后可以将数据库中的表加到报表中，然后就可以将我们要显示的字段总结拖到rpt文件中的详细资料中，并且在页眉会自动添加字段名，这个名字是可以根据自己的喜好更改的。

这样一个很简单的报表就做好的，当然报表的功能远远不止这些，下面就该写代码了。

1、首先要导入命名空间

```
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
```

2、命名空间导入后就要申明一个ReportDocument类的对象

```
ReportDocument ReportDoc;
```

3、最后在pageload事件中加入下面代码就ok了

```
ReportDoc = new ReportDocument();
ReportDoc.Load(Server.MapPath("CraystalReport.rpt"));
CrystalReportViewer1.ReportSource = ReportDoc;
```

按F5运行就可以看到结果，这只是最最简单的一个小例子，要了解水晶报表的强大功能还需要不断努力学习，在vs2003中rpt的界面非常傻瓜化，只要右击页面就可以插入狠多东西，如图片、图表、汇总等等，有待日后慢慢尝试了

就写到这儿了，继续学习中………

