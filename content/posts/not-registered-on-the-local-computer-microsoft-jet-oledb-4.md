---
title: 未在本地计算机上注册“Microsoft.Jet.OleDb.4.0”提供程序 错误解决
date: 2011-06-15
categories: [技术]
tags: [AspNet, Excel, 错误解决]
---

最近在做一个导入Excel数据到数据库的程序出现了如下错误：

![2011-06-15_1552061](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301558041.png)

## 运行环境

* 数据库：SqlServer2008 R2
* OS：Windows Server 2008 R2
* IIS：IIS7

## 解决方法

在应用程序对用的应用程序池的高级设置中设置“启用32位应用程序”为“True”

![2011-06-15_155851](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301558286.png)

