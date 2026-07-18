---
title: “无法在web服务器上启动调试,不具备调试此程序的权限” 问题解决
date: 2007-11-28
categories: [技术]
tags: [AspNet,错误解决]
---

最近维护以前用03做的一个项目,又重新将03装上了，很久都没有用03了,装上后打开项目没有问题,但按F5运行却出现下面错误
<!--more-->

![iShot2022-01-30 21.40.02](/Users/fengwei/Documents/my/typora-img/unable-to-start-debugging-on-the-web-server-do-not-have-permission-to-debug-the-program-problem-solving/iShot2022-01-30 21.40.02.jpg)

解决方法如下:

在INTERNET选项–>安全–>选择internet–>点击“自定义级别”–>移到“用户验证”，选择“自动使用当前名和密码登录”，点击“确定”。

