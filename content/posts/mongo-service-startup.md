---
title: MongoDB(4)–MongoDB服务的启动
date: 2011-11-03
categories: [技术]
tags: [MongoDB]
---

## 原始方式

只有启动了MongoDB的服务，才能使用MongoDB的功能，通常情况下会开一个命令窗口，输入下面的命令来启动服务：

![2011-10-14_222912](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300726402.png)

## 配置文件方式

如果不想每次启动的时候都在命令行中输入很多繁琐的参数，可以把参数信息保存在配置文件中。创建一个名为mongodb.cnf的配置文件，和那些小工具放在同一个目录中，文件的内容如下：

```
dbpath="d:\database\mongodb\data"
```

然后在命令窗口输入下面命令就可以启动服务

![2011-10-14_225624](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300726049.png)

看似和上面的方法差不多，还是需要指定配置文件，但如果参数不止-dbpath的时候，就可以将参数都写在配置文件中，在命令行调用的时候就会显得方便很多。

## Daemon方式

上面介绍的两种方式启动服务都需要打开一个命令行窗口，窗口关闭了服务也就停止了。我们使用–fork参数可以将mongodb的服务放在后台运行，这样相对比较安全。–fork参数是和–logpath参数一起使用的

![2011-10-14_235943](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300726756.png)

[MongoDB(3)–有关NoSQL及MongoDB的一些概念](http://fwhyy.com/2011/09/some-concepts-about-nosql-and-mongodb/)
[MongoDB(2)–MongVUE介绍](http://fwhyy.com/2011/09/mongvue-introduction/)
[MongoDB(1)--MongoDB介绍及安装](http://fwhyy.com/2011/09/mongo-introduction-and-installation/)

