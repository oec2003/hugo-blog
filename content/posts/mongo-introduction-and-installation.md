---
title: MongoDB(1)--MongoDB介绍及安装
date: 2011-09-13
categories: [技术]
tags: [MongoDB, NoSQL]
---

NoSql已经流行好一阵子了，我似乎接触的有点晚了。NoSql的产品有很多，MongoDB只是其中一种，之所以选在学习MongoDB是因为最早知道的就是她，也比较具有代表性。

MongoDB相比传统的关系型数据库有一些优势，比如在海量数据下的性能表现、很好的扩展性等。初识MongoDB感觉和关系型数据库最大的区别就是没有关系型数据库中的那种关系模型，更准确的说她是一个面向文档的数据库。通俗的讲在MongoDB中集合对应关系型数据库的表，文档对应着行。在MongoDB中一条记录的表现形式是BSON的格式，和JavaScript中的JSON类似。

## MongDB的下载安装

下载地址：[http://www.mongodb.org/downloads](http://www.mongodb.org/downloads)

下载下来的是一个mongodb-win32-i386-1.8.2.zip文件，将该文件解压，会发现里面的bin目录下有很多的exe文件，这些是MongoDB的一些工具，比如要启动MongoDB服务就要用到里面的Mongod.exe。

![2011-09-12_114648](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300726967.png)

* bsondump:  将 bson 格式的文件转储为json 格式的数据 
* mongo:  客户端命令行工具，其实也是一个javascript解释器，支持javascript语法 
* mongod:  数据库服务端，每个实例启动一个进程，可以fork 为后台运行 
* mongodump/ mongorestore:  数据库备份和恢复工具 
* mongoexport/ mongoimport:  数据导出和导入工具 
* mongofiles: GridFS 管理工具，可实现二制文件的存取 
* mongos:  分片路由，如果使用了sharding功能，则应用程序连接的是 mongo而不是 mongod 
* mongosniff:  这一工具的作用类似于tcpdump，不同的是他只监控MongoDB 相关的包请求，并且是以指定的可读性的形式输出
* mongostat:  实时性能监控工具

要正常的使用MongoDB首先要做的就是启动MongoDB服务，打开CMD进入到MongoDB的bin目录，执行Mongod.exe，如下：

![2011-09-12_132542-300x66](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300726870.png)

可以看到在mongod.exe 后面有一个-dbpath来制定数据库的存放路径。这个目录我们必须事先创建好。如果没有制定-dbpath，会使用默认路径：C：\data\db\。

下面就可以在MongoDB中来创建数据库了，本文中使用MongoDB自带的Shell来进行操作，在下一篇中将介绍MongoDB的一款IDE工具MongoVUE，使用bin先的mongo.exe可以打开Shell窗口。

![2011-09-12_133937-300x58](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300727903.png)

执行show dbs命令可以查看所有数据库的列表，关于更多的Shell命令可以通过执行help命令查看。

![2011-09-12_142453](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300727232.png)

admin和local数据库是MongoDB自带的数据库，这两个数据库在系统中有特殊的作用。

* admin：最高权限的一个数据库，该数据库中的用户会拥有所有数据库的权限。一些特殊的服务器端的命令也只能从这个数据库中运行。
* local：该数据库不会被复制，可以用来存储限与本地单台服务器的任意集合。

在MongoDB的Shell命令中并没有创建数据库的命令，假设现在要创建一个名为Blogs的数据库，并在这个数据库中添加集合和文档，我们可以想下面这样做：

1 执行use Blogs命令将数据库切换到Blogs，当然此时Blogs还并没有被创建。

2 创建一条数据记录保存在一个变量post中，执行db.Blogs.insert(post)。

![2011-09-12_201351-300x91](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300727969.png)


这时可以看在在上面设定的路径中已经生产了数据库的文件：

![2011-09-12_201414-300x103](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300727295.png)

有关更多的Shell命令使用在后面的文章中再介绍。

## MongoDB Drivers

要在程序中使用MongoDB，需要要到MongoDB针对某一语言的驱动，在MongoDB的官网中已经提供了Ruby 、Python、C#、PHP等多种语言的驱动。

* 驱动列表页：[http://www.mongodb.org/display/DOCS/Drivers](http://www.mongodb.org/display/DOCS/Drivers)
* C#驱动下载：[https://github.com/samus/mongodb-csharp](https://github.com/samus/mongodb-csharp)

对MongoDB的简单介绍就到此，后面的文章会用C#来写一个完整的示例。





