---
title: SqlServer数据库的语句及一些操作整理
date: 2010-02-02
categories: [技术]
tags: [Sql, 小技巧]
---

临近年终，在工作之余对工作和学习中遇到的问题以及常用的一些知识点做了些整理，以备后用。本文涉及的内容为数据库,算是对开发总结(1)—数据库一文的补充。

1 对于主键设置了Identity的表，在删除表中数据后再往表中插入数据，Identity列不是从1起始了，如果想删除数据后Indentity列仍从1起始，可以用下面代码来删除数据。

```
truncate table tablename
DBCC CHECKIDENT(tablename,RESEED,1)
```

2 判断指定表在数据库中是否存在

```
if exists(select name from sysobjects where name='tablename' and type='u')
```

3 判断指定列在指定表中是否存在

```
if exists(select * from sys.columns,sys.tables
      where sys.columns.object_id = sys.tables.object_id
      and sys.tables.name='tablename' and sys.columns.[name]='columnname')
```

4 在编写代码生成器之类的程序的时候，通常需要取出数据库中所有的表名以及表中字段的一些基本信息，如字段长度、字段类型、描述等。实现上面要求的sql语句如下：

```
--取数据库中表的集合
select * from sysobjects where xtype='u' order by name

--取表中字段的一些基本信息
select
    sys.columns.name,  --字段名
    sys.types.name as typename, --字段类型
    sys.columns.max_length,    --字段长度
    sys.columns.is_nullable,    --是否可空
    (select
        count(*)
    from
        sys.identity_columns
    where
        sys.identity_columns.object_id = sys.columns.object_id
    and
        sys.columns.column_id = sys.identity_columns.column_id
    ) as is_identity ,--是否自增

    (select
        value
    from
        sys.extended_properties
    where
        sys.extended_properties.major_id = sys.columns.object_id
    and
        sys.extended_properties.minor_id = sys.columns.column_id
    ) as description  --注释
from
    sys.columns, sys.tables, sys.types
where
    sys.columns.object_id = sys.tables.object_id
and
    sys.columns.system_type_id=sys.types.system_type_id
and
    sys.tables.name='tablename'
order by sys.columns.column_id
```

5 在存储过程中使用事务

```
create procedure procname
as
begin tran
    --执行sql语句

if @@ERROR!=0
begin
    rollback tran   --失败
end
else
begin
    commit tran   --成功
end  
```

6 清除数据库日志

```
DUMP TRANSACTION DatabseName WITH NO_LOG
BACKUP LOG DatabseName WITH NO_LOG
DBCC  SHRINKFILE(DatabseLogName,1)
--DatabseName为数据库名称
--DatabseLogName为日志文件名，可以通过下面语句得到
--select name from sysfiles
```

还有一种比较简单的方法是分离数据库，删除日志文件，再附加数据库，这样产生的日志文件只有500多k。

下面介绍几个常用的系统存储过程和函数

7 db_name()  得到数据库名称

```
select db_name()
Test
(1 行受影响)
```

8 object_id 可以得到对象在系统中的编号，对象包括表、视图、存储过程等。如果不存在返回null，所以也可以用来判断表是否存在。

```
select object_id('objectname')
--判断表是否存在
if  object_id('tablename') is not null
```

9 sp_helptext 用来得到视图、存储过程等对象的文本，可以很快速找到，不过会改变视图或存储过程的格式。所以这个系统存储过程我通常都是用来查看，如果要修改一个存储过程我还是会通过树形菜单去找到存储过程然后修改保存。
```
sp_helptext 'objectname'
```

10 parsename，可以得到对象名称的指定部分，该函数有两个参数，第一个为对象名称，第二个为指定部分的代号。

```
select parsename('oec2003.databasename.dbo.tablename',1)
--对象名称返回tablename
select parsename('oec2003.databasename.dbo.tablename',2)
--Schema名称返回dbo
select parsename('oec2003.databasename.dbo.tablename',3)
--数据库名称返回databasename
select parsename('oec2003.databasename.dbo.tablename',4)
--服务器名称返回oec2003
```

先就写这么多吧，后面整理出来的会陆续补上

