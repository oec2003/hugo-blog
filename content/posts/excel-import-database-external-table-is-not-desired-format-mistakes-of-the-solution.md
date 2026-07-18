---
title: Excel导入数据库出现“外部表不是预期的格式”错误的解决方法
date: 2011-03-08
categories: [技术]
tags: [AspNet, Excel, 错误解决]
---

下图为出错的界面

![20110308001](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300645078.jpg)

出错的原因是因为Excel的格式不是标准的Excel格式，像我出现这个错误的原因就是使用的Excel是用程序导出的Excel。

解决此问题方法很简单：

* 将格式不标准的Excel另存为一个标准格式。
* 如果Excel是用程序导出的，可以修改导出程序，将其导出为标准格式。

