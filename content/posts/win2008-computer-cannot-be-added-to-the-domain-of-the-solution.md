---
title: Win2008计算机不能添加到域的解决方法
date: 2010-04-28
categories: [技术]
tags: [AD, win2008, 错误解决]
---

最近接触了一点win2008活动目录，所谓万事开头难，本来很简单的事情在刚刚接触时就很费劲。

在远程的一台机子上成功安装了AD后，想将本机添加到域中，试了很多次都不行，出现下面的错误：

![2010-04-28_114731](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290645332.png)

查了很久的msdn文档，说的都不是很清楚，也许是我对dns的理解不够深入，最后得知原来是dns的指向问题。假如安装了AD的机子的IP为192.168.1.50，就将需要添加到域中的机子的dns设置为192.168.1.50，如下图：

![2010-04-28_114829](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290645237.png)

设置好了dns后，再添加计算机到域，就可以出现登录框了：

![2010-04-28_114936](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290646257.png)

输入用户名和密码就会出现欢迎窗口了：

![2010-04-28_115054](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290646603.png)

