---
title: 在Windows Server2008R2中部署WebAPI
date: 2015-09-16
categories: [技术]
tags: [AspNet, MVC, Web API]
---

一直以来都是在win8或windows server2012中进行asp.net mvc或webapi程序的部署，没有发现任何问题。今天在win2008中进行asp.net webapi的部署，访问api的时候页面显示404错误。下面步骤将解决asp.net webapi在win2008中的部署问题。
<!--more-->
![3cefded1gw1ew4lvjcckcj20fh066dgx](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290624314.jpg)

## 添加映射

在iis中选中需要设置的webapi站点，双击“处理程序映射”，如下图：

![3cefded1gw1ew4lvk40lvj20et06w75a](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290625810.jpg)

在弹出框中添加对webapi的请求映射：

![3cefded1gw1ew4lvjpyltj20av07u74](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290625173.jpg)

请求路径：api /*

可执行文件：%windir%\Microsoft.NET\Framework64\v4.0.30319\aspnet_isapi.dll，注意32位和64位路径的区别。

名称：webapi，自定义名称即可

## 修改应用程序池的管道模式

将webapi的应用程序池的管道模式修改为**经典**

## 更新dll

映射添加之后，访问站点，不会报404错误了，但会报一些dll文件未能加载，一共有4个，名称分别如下：

* System.Web.WebPages.Deployment.dll
* Microsoft.Web.Infrastructure.dll
* System.Web.WebPages.Razor.dll
* System.Web.WebPages.dll

将上面四个dll文件复制到webapi站点到bin目录中，问题解决。

