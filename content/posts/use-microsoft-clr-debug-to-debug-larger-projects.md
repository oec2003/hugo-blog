---
title: 使用MicroSoft CLR Debug来调试较大项目
date: 2011-07-20
categories: [技术]
tags: [AspNet, DotNet, 小技巧, 调试]
---

在以前的开发中，调试时很自然的会直接按F5进行调试，有时项目部署在IIS中也只是将项目的服务器指向IIS，仍然是将整个项目运行设置断点进行调试。最近遇到了一个问题，项目很大，直接F5运行会导致VS卡死，这种时候使用MicroSoft CLR Debug来进行调试是最合适不过了。

首先打开MicroSoft CLR Debug

![2011-07-18_164829](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290710632.png)

打开后界面如下

![2011-07-18_164908](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290710108.png)

从项目中选择一个需要调试的文件，并在需要调试的地方设置断点

![2011-07-18_165017](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290710393.png)

选择“调试”-“附加到进程”

![2011-07-18_165041](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290710454.png)


附加进程前确保你的项目已经运行，如果是Win2003系统，会有一个w3wp.exe的进程存在,如果是xp系统，该进程名是aspnet_wp.exe。

![2011-07-18_165126](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290710503.png)

此时运行程序就会命中断点，个人认为此方法比较适用于将项目部署到IIS中进行调试，此方法的几个优点：

* 不会占用很多资源，只需要将需要调试的文件添加进来设置断点即可。
* 如果是管理系统之类的项目，只需要登陆一次即可，不需要每次调试时都重新登陆。
* 退出调试不会对运行的程序有什么影响，如果是F5进行调试，退出调试页面就关闭了。

