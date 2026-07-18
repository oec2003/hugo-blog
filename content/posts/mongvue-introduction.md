---
title: MongoDB(2)–MongVUE介绍
date: 2011-09-20
categories: [技术]
tags: [MongoDB, MongVUE, NoSQL]
---

对于数据库来说有一款功能强大的管理工具将会大大的提高我们的工作效率。对于MongoDB来说MongoVUE就是这样一款工具，MongoVUE在1.0版以后就开始收费了，所以我现在用的还是0.9.7.2版。对于初学来时已经够用了。

安装运行后的界面如下：

![2011-09-12_150826-300x199](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300728711.png)

点击Connect来连接MongoDB数据库

![2011-09-12_150941-300x225](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300728115.png)

填写好Name 和Server后点击Save，Name随便给取个名字就型，Server为服务器的地址，本机即127.0.0.1，Port默认为27017，可以根据实际情况进行设置。保存后在Connect界面就多了一个MyMongoDB的数据库连接，点击Connect即可连接到数据库。

![2011-09-12_200130](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300728285.png)

除了系统默认的admin和local数据库外，在上一篇中创建的Blogs数据库也在列表中。并且在Blogs库中已经存在一个Collection，就是在上篇中insert的一条数据。双击Posts，在右边的窗口中会展示数据，分为三个Tab页来进行展示，分别是树状结构、表结构（类似关系型数据库的展示方式）和文本结构（BSON）。

![2011-09-12_200949-300x203](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300728453.png)

本篇就介绍到这里，更多的功能和用法还是让读者自己下载试用吧。

MongoDB0.9.7.2 版下载：[http://download.csdn.net/detail/oec2003/3595146](http://download.csdn.net/detail/oec2003/3595146)

