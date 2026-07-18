---
title: Asp.Net正在中止线程引发的问题
date: 2013-11-22
categories: [技术]
tags: [AspNet, TimeOut]
---

Asp.Net做的一个同步程序，同步的方法是通过JQuery的Ajax调用，同步过程大概要执行20多分钟，程序部署到服务器后执行一段时间后就弹出执行失败的对话框，日志记录的错误信息是“正在中止线程”。

## 查错过程：

1、根据“AspNet 正在中止线程“进行搜索，得到的结果基本都是跟”Response.End“有关的，但我的代码中没有Response.End，所以基本可以排除；

2、因为使用JQuery的Ajax，所以猜想会不会是因为Ajax超时导致，修改代码将返回状态弹出：

![3cefded1gw1eatnxducbjj20k0051dg8](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290809786.jpg)

发现返回的status为”error“，也尝试过将timeout设置为一个较大值，发现问题依然存在，所以可以排除是JQuery Ajax超时；

3、使用Fiddler2进行监控，发现执行一段时间后报了500错误，显示的错误详细信息如下图：

![3cefded1gw1eatnxcw1mrj20f607st9e](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290809600.jpg)

到了这一步就好办了，可以知道是httpRuntime超时了，配置Webconfig就可以了，如下图：

![3cefded1gw1eatnxep1sfj20gb031wet](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290809727.jpg)

设置好好后发不到服务器，再次运行程序，问题解决。

奇怪的是在本机运行的时候即使没有设置executionTimeout也不会出现问题，原因是在本机的Webconfig中的compilation节点的有个debug属性设置为true，发布后的Webconfig中的compilation没有debug节点，当debug属性为false时，httpRuntime的executionTimeout属性才会生效。

