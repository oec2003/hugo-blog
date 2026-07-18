---
title: HTTP 错误 500.19 – Internal Server Error 错误解决方法
date: 2010-04-15
categories: [技术]
tags: [WebService, 部署, 错误解决]
---

刚在本机部署了一个WebService测试，浏览的时候出现了“HTTP 错误 500.19 – Internal Server Error ”错误，如下图：

![2010-04-15_134600](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300701743.png)

经过检查发现是由于先安装vs2008后安装iis的缘故，只需重新注册下AspNet就可以了，具体步骤如下

* 打开运行，输入cmd进入到命令提示符窗口。
* 进入到C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727 目录。
* 输入aspnet_regiis.exe –i 执行既可

注意：如果系统为64位 第二步的路径为C:\WINDOWS\Microsoft.NET\Framework64\v2.0.50727

