---
title: SqlServer2008R2用Windows身份登录18456错误解决
date: 2013-09-07
categories: [技术]
tags: [SqlServer, sqlserver2008, 错误解决]
---

重装系统后发现SqlServer2008R2使用Windows身份验证不能进行连接，如下图：

![07070635-ce750450dc434a518651c5d3b77f9402](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302000357.png)

以前经常会碰到SqlServer 身份验证连接失败，Windows身份验证的连接失败还是第一次，试了下SqlServer 身份验证可以正常连接，sa账号连接进去后，在安全性-》登录名下没有发现当前登录用户的账号，在登录名上点击邮件，新建登录名即可：

![07070636-ed428dd377a147e99a2e428551933309](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302000426.png)

