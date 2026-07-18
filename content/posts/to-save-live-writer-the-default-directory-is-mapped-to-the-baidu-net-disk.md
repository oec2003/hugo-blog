---
title: 将Live Writer默认保存目录映射到百度网盘
date: 2012-05-13
categories: [成长]
tags: [mklink, 小技巧, 百度网盘]
---

Window Live Writer是我一直以来写博客的工具，但是他的默认保存路径是C:\Users\Administrator\Documents\My Weblog Posts，并且不能更改。最近在使用百度网盘，所以就想到将Live Writer的保存目录能同步到百度网盘的目录中，在网上查了些资料，还真有办法，如果是Win7或是Windows Server2008系统，可以用系统自带的mklink命令，如果是XP系统可以下载Junction.exe达到同样的目的。

我百度网盘的目录是D:\百度网盘，在命令行中输入如下命令可以实现Live Witer默认目录到百度网盘目录的链接：

![2012-05-13_221120](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302121952.jpg)

**注意：在D:\百度网盘 目录中不要先创建了“My Weblog posts”目录，如果先创建了该目录在执行命令式会出现如下错误：**

![2012-05-13_222209](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302121630.jpg)

有关mklink的使用方法可以在命令行下输入mklink\？，也可以点击[这里](http://wenku.baidu.com/view/56453dcfda38376baf1fae2c.html)。

junction下载地址：[http://technet.microsoft.com/en-us/sysinternals/bb896768.aspx](http://technet.microsoft.com/en-us/sysinternals/bb896768.aspx)

junction使用参考教程：[http://sigh-ishldg.iteye.com/blog/1096606](http://sigh-ishldg.iteye.com/blog/1096606)

