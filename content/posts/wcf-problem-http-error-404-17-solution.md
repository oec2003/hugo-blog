---
title: WCF问题:“HTTP 错误 404.17 – Not Found 请求的内容似乎是脚本，因而将无法由静态文件处理程序来处理”解决方法
date: 2010-07-19
categories: [技术]
tags: [WCF, 错误解决]
---

在写[在IIS中寄存已有WCF服务](http://blog.fwhyy.com/?p=23)文章的时候，创建了WCF Service模板站点，按F5运行的时候会出现“HTTP 错误 404.17 – Not Found 请求的内容似乎是脚本，因而将无法由静态文件处理程序来处理 ”的错误，如下图：

![2010-07-19_173102](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290630316.png)

在网上查出的解决方为重新注册WCF，在命令提示符中输入如下图的命令运行即可:

![2010-07-19_173337](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290630346.png)

安装成功后再次运行站点就会出现正确的页面，如下：

![image-20220129063819672](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290638830.png)

