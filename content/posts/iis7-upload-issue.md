---
title: IIS7上传出现乱码问题解决
date: 2013-03-22
categories: [技术]
tags: [IIS7, 上传, 乱码]
---

最近查一个bug，客户那边将上传超过30兆的文件时，上传页面出现乱码，如下图所示：

![1](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300703232.png)

系统默认是只能上传10兆以内的文件，客户自己修改了webconfig文件后发现此问题。

通过Fiddler2跟踪页面得出乱码内容为“您要找的资源已被删除、已更名或暂时不可用”，然后通过Google得出结论如下：

在IIS7中出了修改webconfig的配置外还需要修改`C:\Windows\System32\inetsrv\config\schema \IIS_schema.xml`文件，该文件中的默认设置为30兆，根据需要修改默认值大小即可：

![2](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300703951.png)

