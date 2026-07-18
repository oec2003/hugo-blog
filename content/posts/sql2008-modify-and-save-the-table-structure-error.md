---
title: SQL2008修改并保存表结构时报错的解决(阻止保存要求重新创建表的更改)
date: 2011-03-09
categories: [技术]
tags: [SqlServer, 错误解决]
---

今天在SqlServer2008中修改表结构时，弹出下面对话框阻止我保存

![20100304002](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301954622.png)

解决此问题方法为：

1 打开SqlServer2008工具—>选项

2 在弹出的对话框中去掉“阻止保存要求重新创建表的更改”，如下图

![2011-03-09_161021](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301954844.png)

