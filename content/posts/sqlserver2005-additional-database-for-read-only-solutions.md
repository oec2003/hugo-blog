---
title: Sqlserver2005附加数据库为只读的解决方法
date: 2009-05-08
categories: [技术]
tags: [SqlServer, 错误解决]
---

## 症状：

在sqlserver2005中附加数据库时，附加的数据库会变成只读的，只能进行查询操作。
<!--more-->

![2010-12-30_105751](https://img.fwhyy.com/2022/202201301953243.webp)

## 解决方法：

1 打开SqlServer Configuration Manager   开始-》Microsoft Sqlserver 2005-》配置工具-》SqlServer Configuration Manager

![2010-12-30_105828](https://img.fwhyy.com/2022/202201301953142.webp)

2 在SqlServer Configuration Manager 窗口左边选中SQLServer 2005 服务，在窗口右边会出现一些列表项，选中Sqlserver（MSSqlserver）或SqlServer（SqlExpress）点击右键选择属性。

![2010-12-30_105935](https://img.fwhyy.com/2022/202201301953835.webp)

3 打开属性窗口，会发现内置帐户下面的下拉框选中的网络服务，将其改为本地服务。

![2010-12-30_110010](https://img.fwhyy.com/2022/202201301953913.webp)

4 打开SqlServer 2005 ，在只读的数据库上右击选择属性，选中属性窗口左边选择页下面的选项，在窗口右边将“数据库为只读”改为false ，点击确定即可。

![2010-12-30_110055](https://img.fwhyy.com/2022/202201301953088.webp)

