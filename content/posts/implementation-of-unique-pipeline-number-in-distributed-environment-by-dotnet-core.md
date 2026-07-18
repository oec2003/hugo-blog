---
title: dotNET Core实现分布式环境下的流水号唯一
date: 2019-09-14T23:30:19+08:00
categories: [技术]
tags: [dotNET Core,流水号]
---

## 业务背景

在管理系统中，很多功能模块都会涉及到各种类型的编号，例如：流程编号、订单号、合同编号等等。编号各有各自的规则，但通常有一个流水号来确定编号的唯一性，保证流水号的唯一，在不同的环境中实现方式有所不同。本文将介绍在单机和分布式环境中保证流水号唯一的方式。

<!--more-->

## 实现思路

1、在数据库中创建 seqno 表，每个业务一条数据，存储业务 code 和流水号的最大值
2、获取某业务的流水号时，根据业务 code 查询 seqno 表，获取流水号返回，并将最大值加一
3、使用 Monitor.Enter 解决单机重复性问题
4、使用 Redis 分布式锁解决分布式部署的重复性问题

## 环境

* dotNET Core：2.1
* VS For Mac：2019
* Docker：18.09.2
* MySql：8.0.17，基于Docker构建
* Redis：3.2，基于Docker构建
* CSRedisCore：3.1.5

## 准备工作

1、执行下面命令构建 Redis 容器

```
docker run -p 6379:6379  -d --name s2redis_test   --restart=always redis:3.2   redis-server --appendonly yes
```

2、执行下面命令构建 MySql 容器

```
docker run -d -p 3306:3306 -e MYSQL_USER="oec2003" -e MYSQL_PASSWORD="123456" -e MYSQL_ROOT_PASSWORD="123456" --name s2mysql mysql/mysql-server --character-set-server=utf8mb4 --collation-server=utf8mb4_general_ci --default-authentication-plugin=mysql_native_password
```

3、在 MySql 中创建数据库`seqno_test`，执行下面 SQL 创建表和测试数据

```
-- ----------------------------
-- Table structure for seqno
-- ----------------------------
DROP TABLE IF EXISTS `seqno`;
CREATE TABLE `seqno` (
  `code` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `num` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of seqno
-- ----------------------------
BEGIN;
INSERT INTO `seqno` VALUES ('order', 1);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
```

4、在 VS2019 中创建两个控制台项目和一个类库项目，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280636323.jpg)

## 单机测试

1、在 SeqNo 类中添加 GetSeqByNoLock 方法

```
public static string GetSeqNoByNoLock()
{
    string connectionStr = "server = localhost; user id = oec2003; password = 123456; database = seqno_test";
    string getSeqNosql = "select num from seqno where code='order'";
    string updateSeqNoSql = "update seqno set num=num+1 where code='order'";

    var seqNo = MySQLHelper.ExecuteScalar(connectionStr, System.Data.CommandType.Text, getSeqNosql);
    MySQLHelper.ExecuteNonQuery(connectionStr, System.Data.CommandType.Text, updateSeqNoSql);

    return seqNo.ToString();
}
```

2、在 RedisLockConsoleApp1 控制台程序中用多线程来模拟测试

```
class Program
{
    static void Main(string[] args)
    {
        Task.Run(() =>
        {
            for (int i = 0; i < 50; i++)
            {
                Console.WriteLine($"Thread1:SeqNo:{SeqNo.GetSeqNoByNoLock()}");
            }
        });

        Task.Run(() =>
        {
            for (int i = 0; i < 50; i++)
            {
                Console.WriteLine($"Thread2:SeqNo:{SeqNo.GetSeqNoByNoLock()}");
            }
        });
        Console.ReadLine();
    }
}
```

3、测试结果如下，可以看出在多线程情况下会出现重复的编号

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280636693.jpg)

## 单机环境加锁测试

在 SeqNo 类中添加 GetSeqNoByLock 方法，通过 Monitor.Enter 来解决单机多线程流水号重复问题

```
public static string GetSeqNoByLock()
{
    string connectionStr = "server = localhost; user id = oec2003; password = 123456; database = seqno_test";
    string getSeqNosql = "select num from seqno where code='order'";
    string updateSeqNoSql = "update seqno set num=num+1 where code='order'";
    var seqNo = string.Empty;
    try
    {
        Monitor.Enter(_myLock);
        seqNo = MySQLHelper.ExecuteScalar(connectionStr, System.Data.CommandType.Text, getSeqNosql).ToString();

        MySQLHelper.ExecuteNonQuery(connectionStr, System.Data.CommandType.Text, updateSeqNoSql);

        Monitor.Exit(_myLock);
    }
    catch
    {
        Monitor.Exit(_myLock);
    }

    return seqNo.ToString();
}
```

运行结果如下，可以看出已经没有出现重复的流水号了

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280636458.jpg)

## 多机环境测试

Monitor 只能解决进程内的重复性问题，现在用两个控制台程序来模拟分布式下的多机器运行，在 RedisLockConsoleApp2 控制台程序添加如下代码

```
static void Main(string[] args)
{
    Task.Run(() =>
    {
        for (int i = 0; i < 50; i++)
        {
            Console.WriteLine($"Thread1:SeqNo:{SeqNo.GetSeqNoByLock()}");
        }
    });

    Task.Run(() =>
    {
        for (int i = 0; i < 50; i++)
        {
            Console.WriteLine($"Thread2:SeqNo:{SeqNo.GetSeqNoByLock()}");
        }
    });

    Console.ReadLine();
}
```

同时运行两个控制台程序，测试结果如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280636532.jpg)

可以看出在每一个控制台程序内没有重复流水号，但两个控制台还是会间歇性地出现重复流水号。

要解决这个问题就必须使用分布式锁。

## 多机环境分布式锁测试

分布式锁又很多实现方式，本例中采用 Redis 来实现，Redis 客户端使用的是 CSRedisCore ，在 CSRedisCore 最新的版本 3.1.5 中实现了分布式锁，这让使用变得非常的方便。

1、在 RedisLockLib 项目中添加 CSRedisCore 包的引用

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280636490.jpg)

2、在 SeqNo 类中添加 GetSeqNoByRedisLock 方法

```
public static string GetSeqNoByRedisLock()
{
    string connectionStr = "server = localhost; user id = oec2003; password = 123456; database = seqno_test";
    string getSeqNosql = "select num from seqno where code='order'";
    string updateSeqNoSql = "update seqno set num=num+1 where code='order'";

    var seqNo=string.Empty;
    using (_redisClient.Lock("test", 5000))
    {
        seqNo = MySQLHelper.ExecuteScalar(connectionStr, System.Data.CommandType.Text, getSeqNosql).ToString();

        MySQLHelper.ExecuteNonQuery(connectionStr, System.Data.CommandType.Text, updateSeqNoSql);
    }
    return seqNo;
}
```

3、测试结果如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280637529.jpg)

## 总结

例子非常简单，提供一种解决问题的思路，如您有更好的方式欢迎讨论。本文的示例代码已上传 Github ，地址如下：

[https://github.com/oec2003/StudySamples/tree/master/RedisLockDemo](https://github.com/oec2003/StudySamples/tree/master/RedisLockDemo)

祝大家假期快乐！

