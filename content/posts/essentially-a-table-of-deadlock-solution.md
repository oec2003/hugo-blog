---
title: SqlServer表死锁的解决方法
date: 2011-08-06
categories: [技术]
tags: [Sql, SqlServer, 死锁]
---

前些天写一个存储过程，存储过程中使用了事务，后来我把一些代码注释掉来进行调试找错，突然发现一张表被锁住了，原来是创建事务的代码忘记注释掉。本文表锁住了的解决方法。

其实不光是上面描述的情况会锁住表，还有很多种场景会使表放生死锁，解锁其实很简单，下面用一个示例来讲解：

1 首先创建一个测试用的表：

```
CREATE TABLE Test
(
    TID INT IDENTITY(1,1)
)
```

2 执行下面的SQL语句将此表锁住：

```
SELECT * FROM Test WITH (TABLOCKX)
```

3 通过下面的语句可以查看当前库中有哪些表是发生死锁的：

```
SELECT request_session_id spid,OBJECT_NAME(resource_associated_entity_id)tableName
FROM  sys.dm_tran_locks
WHERE resource_type='OBJECT ' 
```

4 上面语句执行结果如下：



spid ：被锁进程ID。
tableName：发生死锁的表名。
5 只需要使用kill关键字来杀掉被锁的进程ID就可以对表进行解锁：

```
KILL 52
```

