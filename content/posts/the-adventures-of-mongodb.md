---
title: MongoDB历险记
date: 2017-10-24T23:56:57+08:00
categories: [技术]
tags: [MongoDB]
---

一直在使用`MongoDB`来做为底层的数据存储，一直也没有出现什么问题。但就在`MongoDB`上市之际，一客户的`MongoDB`挂了,原因很复杂，大概有下面的一些原因和操作：

* 客户的存储做过迁移；
* 服务器打补丁做过重启；
* 服务器重启后其中有一台的存储盘丢失；
* `MongoDB`的所有服务都恢复后，在一个很短的时间内是正常的，测试在这期间做过`Web`端和`PC`客户端端测试；
* 当测试通知文件不能上传时，发现一台服务器端`MongoDB`服务不能正常启动，紧接着另一台也不能正常启动；
* 此时`MongoDB`已彻底瘫痪。

上面就是整个事故的经过，发生在周六的夜里九十点钟，接下来就是长达一天一夜的修复工作。

<!--more-->

## 查看日志

服务不能启动后，查看日志如下：

```
2017-10-21T22:40:12.892+0800 I CONTROL  [initandlisten] db version v3.0.6-rc2
2017-10-21T22:40:12.892+0800 I CONTROL  [initandlisten] git version: eae8389c38450b02e75ead3808cab48dc6b146a2
2017-10-21T22:40:12.892+0800 I CONTROL  [initandlisten] build info: windows sys.getwindowsversion(major=6, minor=1, build=7601, platform=2, service_pack='Service Pack 1') BOOST_LIB_VERSION=1_49
2017-10-21T22:40:12.892+0800 I CONTROL  [initandlisten] allocator: tcmalloc
2017-10-21T22:40:12.892+0800 I CONTROL  [initandlisten] options: { net: { port: 40000 }, replication: { replSet: "whrt" }, service: true, storage: { dbPath: "y:\data" }, systemLog: { destination: "file", path: "y:\logs\Mogolog.log" } }
2017-10-21T22:40:13.532+0800 I -        [initandlisten] Assertion: 10334:BSONObj size: 945160192 (0x38560000) is invalid. Size must be between 0 and 16793600(16MB) First element: EOO
2017-10-21T22:40:14.407+0800 I CONTROL  [initandlisten] mongod.exe    ...\src\mongo\util\stacktrace_win.cpp(175)                        mongo::printStackTrace+0x43
2017-10-21T22:40:14.407+0800 I CONTROL  [initandlisten] mongod.exe    ...\src\mongo\util\log.cpp(134)                                   mongo::logContext+0x97
2017-10-21T22:40:14.407+0800 I CONTROL  [initandlisten] mongod.exe    ...\src\mongo\util\assert_util.cpp(219)                           mongo::msgasserted+0xd7
2017-10-21T22:40:14.407+0800 I CONTROL  [initandlisten] mongod.exe    ...\src\mongo\util\assert_util.cpp(211)                           mongo::msgasserted+0x13
2017-10-21T22:40:14.407+0800 I CONTROL  [initandlisten] mongod.exe    ...\src\mongo\bson\bsonobj.cpp(73)                                mongo::BSONObj::_assertInvalid+0x40d
2017-10-21T22:40:14.407+0800 I CONTROL  [initandlisten] mongod.exe    ...
```

其中比较关键的是这句：

```
BSONObj size: 945160192 (0x38560000) is invalid. Size must be between 0 and 16793600(16MB) 
```

根据这个错误信息查出来就两个结果；

1. 使用`mongod --repair`命令修复；
2. 如果有备份的话，使用`mongorestore`命令进行还原。

## 数据修复

对原数据进行了备份之后，使用`mongod --repair`来修复数据，最终没有执行成功，错误信息和之前启动服务时一样，如下图：

![](https://img.fwhyy.com/2022/202201302006150.webp)

幸好数据有做备份，就只剩下还原这一条路了。

## 数据还原

重新搭建MongoDB集群，执行下面命令进行还原

```
mongorestore -h 10.10.10.10 --port 20720 -d DB --dir Z:\Backup\2017-10-20\DB
```

命令执行了十几分钟，进度一直卡着不动，也没有提示错误信息，如下图：

![](https://img.fwhyy.com/2022/202201302006972.webp)

时间不等人，果断启了一个新的单台的MongoDB实例，在执行还原，进度终于正常了，剩下的就是漫长的等待。五六个小时之后，终于成功还原。

使用MongoDB客户端工具连接到服务，文件列表可以正常展示出来，在工具中做添加文件操作，又报错了，如下：

```
Command 'filemd5' failed: exception: Can't get executor for query { files_id: ObjectId('59ec72c2aab0502374afbd60'), n: { $gte: 0 } } (response: { "errmsg" : "exception: Can't get executor for query { files_id: ObjectId('59ec72c2aab0502374afbd60'), n: { $gte: 0 } }", "code" : 17241, "ok" : 0.0 })
```

又是一通查，期间还咨询了公司系统部大牛，最终抱着试试的心态执行了重建索引的命令

```
use <yourdatabasename>
db.fs.files.ensureIndex({ filename : 1, uploadDate : 1})
db.fs.chunks.ensureIndex({ files_id : 1, n : 1 })
```

索引重建完成后，文件可以正常添加和下载。

## 用到的一些命令

### 安装服务到Windows服务

```
mongod  --dbpath Y:\New\data\ --logpath Y:\New\log\Mongolog.log --port 40000 --install --serviceName "DBService" --serviceDisplayName "DBService"   --replSet db
```

### 副本集部署

```
config = { _id:"db", members:[
{_id:0,host:"10.104.13.41:40000",priority:1},
{_id:1,host:"10.104.13.22:40000",priority:2},
{_id:2,host:"10.104.13.40:40000",arbiterOnly:true}]
}
rs.initiate(config)
```

### 还原

```
mongorestore -h 10.10.10.10 --port 20720 -d DB --dir Z:\Backup\2017-10-20\DB
```

### MongoDB修改库名

```
db.copyDatabase('DBName','DBName_New')
```

原理是复制了一份数据到新的名称的库

### 删除Windwos服务

停掉服务然后执行下面命令：

```
sc delete ServiceName
```

### 重建索引

```
use <yourdatabasename>
db.fs.files.ensureIndex({ filename : 1, uploadDate : 1})
db.fs.chunks.ensureIndex({ files_id : 1, n : 1 })
```

