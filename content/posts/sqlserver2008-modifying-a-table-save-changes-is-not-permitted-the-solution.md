---
title: SqlServer2008修改表时出现“save changes is not permitted…”解决方法
date: 2010-06-03
categories: [技术]
tags: [sqlserver2008, 错误解决]
---

最近使用SqlServer2008，发现在修改完表字段名或是类型后点击保存时会弹出一个对话框，对话框内容大致如下

> Saving changes is not permitted. The changes you have made require the following tables to be dropped and re-created. You have either made changes to a table that can’t be re-created or enabled the option Prevent saving changes that require the table to be re-created

如下图：

![2010-06-03_094326](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302001803.png)

如果点击 Save Text File ，会保存一个文本文件，感觉没什么作用，内容如下图：

![2010-06-03_095158](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302001334.png)

点击 Cancel 后会弹出另一个对话框，如下图：

![2010-06-03_095243](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302001972.png)

点击OK就关闭了对话框，当然我们的修改肯定也没有保存上。

## 解决方法

打开工具-选项，如下图：

![2010-06-03_100942](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302001623.png)

在选项对话框中选择：Designers—Table and DataBase Designers ，将右边的Prevent saving changes that require table re-creation 前的勾选去掉，如下图：

![2010-06-03_101349](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302001244.png)

点击OK后，表的结构就可以随意修改保存了

