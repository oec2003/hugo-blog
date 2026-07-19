---
title:  附加数据库失败 操作系统错误5
date:  2011-05-22
categories: [技术]
tags:  [SqlServer,sqlserver2008,错误解决]
---

## 环境

数据库版本：SqlServer2008 R2 32位

附加文件的版本：SqlServer2008 R2 64位
<!--more-->

## 出错截图

![2011-05-22_101011](https://img.fwhyy.com/2022/202201292118500.webp)

## 解决方法

设置数据库文件mdf和ldf两个文件的权限，在这两个文件上点击右键-》属性-》安全，在用户和组中添加Authenticated Users用户，然后设置该用户的权限为完全控制，重新附加数据库。

