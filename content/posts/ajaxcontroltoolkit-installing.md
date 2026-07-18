---
title:  AjaxControlToolkit安装&下载
date:  2007-08-03
categories: [技术]
tags:  [Ajax,AspNet]
---

以下是收集关于AjaxControlToolkit安装的一篇文章，感谢原作者
<!--more-->

## AjaxControlToolkit下载

[http://ajax.asp.net/downloads/default.aspx?tabid=47](http://ajax.asp.net/downloads/default.aspx?tabid=47)

[http://www.codeplex.com/AtlasControlToolkit/Release/ProjectReleases.aspx?ReleaseId=1425](http://www.codeplex.com/AtlasControlToolkit/Release/ProjectReleases.aspx?ReleaseId=1425)

## 环境设置

1 下载完 ASPAJAXExtSetup.msi 安装更新后在你的系统盘下的（以C盘为例） 出现这个 文件夹：

```
C:\Program Files\Microsoft asp.NET\ASP.NET 2.0 ajax Extensions\v1.0.61025
```

2 安装这个后我们就可以创建Asp.net AJAXEnabledWebSite站点了，这其实就是个ajax.net网站的模板。但是我们现在还不能使用微软给我们开发好的ajax控件 。要想知道怎么使用ajax.net控件往下看。

3 下载AjaxControlToolkit ，上面两个一个是带源代码的 一个是不带源代码的toolkit。建议下载带源代码的 toolkit。下载完成后把该文件解压到：

```
C:\Program Files\Microsoft asp.NET\ASP.NET 2.0 ajax Extensions\v1.0.61025\AjaxContronlToolkit\
```

4 双击运行AjaxControlToolkit.sln。用vs2005打开这个sln，编译TemplateVSI这个项目后，把在C:\Program Files\Microsoft ASP.NET\ASP.NET 2.0 AJAX Extensions\SampleWebSite\Bin下面生成的AjaxControlToolkit.dll和AjaxControlToolkit.pdb复制到C:\Program Files\Microsoft asp.NET\ASP.NET 2.0 AJAX Extensions\Binaries文件夹下面，这样我们就可以在vs2005中使用ajax.net这些控件了。

5 新建一个Ajax ControlToolkitWebSite 类型的web项目。在工具栏中新添加一个选项卡起名：AjaxControltoolkit

