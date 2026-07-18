---
title: MySQL服务不能启动，原因竟然是...
date: 2018-01-31T23:13:02+08:00
categories: [成长]
tags: [Tips, MySql,博客]
---

老婆最近使用MWeb往部署在Linode中的Wordpress博客中更新女儿的博客，发现图片不能正常上传，出现各种状况：

* MWeb闪退
* 提示图片张数超过限制
* 一直Loading...

有重度拖延症的我今天在老婆的“强迫”下决定解决此问题。

<!--more-->

首先在浏览器中访问博客，博客内容可以正常访问，但登录后台失败，俗话说，重启服务器可以解决90%的问题，于是在Linode后台重启了服务器。重启完成后，发现博客内容也不能正常访问了，提示“数据库连接失败”。

SSH到服务器上查看MySql的日志，发现如下错误信息：

```
180130 23:29:48 InnoDB: The InnoDB memory heap is disabled
180130 23:29:48 InnoDB: Mutexes and rw_locks use GCC atomic builtins
180130 23:29:48 InnoDB: Compressed tables use zlib 1.2.3.4
180130 23:29:48 InnoDB: Initializing buffer pool, size = 16.0M
180130 23:29:48 InnoDB: Completed initialization of buffer pool
180130 23:29:48 InnoDB: highest supported file format is Barracuda.
InnoDB: The log sequence number in ibdata files does not match
InnoDB: the log sequence number in the ib_logfiles!
180130 23:29:48  InnoDB: Database was not shut down normally!
InnoDB: Starting crash recovery.
InnoDB: Reading tablespace information from the .ibd files...
InnoDB: Restoring possible half-written data pages from the doublewrite
InnoDB: buffer...
InnoDB: Last MySQL binlog file position 0 210522228, file name ./mysql-bin.000048
```

根据错误信息在Google搜索，所有方法尝试一遍，依然不能正常启动MySql服务

![](http://fwhyy.com/img/post/15181064653071.jpg)

忽然发现在MySql的目录中有很多文件名类似`mysql-bin.000001`的文件，这些文件是MySql的事物日志文件，极有可能是这些文件占满了磁盘空间，马上用`df -h`命令查看磁盘空间，果然，磁盘空间已满。删掉这些事物日志文件，重启MySql服务，一切正常。

