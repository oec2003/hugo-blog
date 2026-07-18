---
title: 开发总结—数据库篇
date: 2008-08-06
categories: [技术]
tags: [Sql,小技巧]
---

本文是我在平时工作中所遇到的数据库方面的一些知识总结
<!--more-->

1.多条件查询

多条件查询在实际应用中用的很多，在一些页面上会要求根据时间，类别，或是其他的一些关键字来查询数据，而且这些条件并不是一定要输入的。以前有过在C#代码中根据条件选中的情况来拼where条件字串，也有过在存储过程中用if来判断传进的参数，但是后来知道早存储过程中使用OR是最简单的，如下：

```
create Table Users
(
    id int,
    name nvarchar(20),
    age int
)

create proc sp_SGetUserInfo
(
  @Name nvarchar(20),
  @Age int
)
as
select
    *
from
    Users
where
    (@Name='' or name=@Name)
and
    (@Age='' or age=@Age)
```

2.使用isnull

对于传进的参数有可能为空或是null的情况，isnull就很有用了。 通常可以这样来判断

```
ISNULL(@Name,'')  --如果参数@Name为null，则返回''
```

3.在数据库中几个常用的日期格式转换

日期格式转换也是经常用到的，通常2008-04-12和20080412 这两种格式用的比较多，下面列出一些常用的：

```
CONVERT(VARCHAR(10),GETDATE(),120)
--返回-04-12
CONVERT(VARCHAR(10),GETDATE(),20)
--返回-04-12
CONVERT(VARCHAR(10),GETDATE(),112)
--返回
CONVERT(VARCHAR(10),GETDATE(),111)
--返回/04/12
```

4.取指定字符串中两个字符 中间的字符串

```
declare @str1 nvarchar(20)
declare @str2 nvarchar(20)
declare @str3 nvarchar(20)
set @str1 = 'ABCDEFGH'
set @str2 = 'ab'
set @str3 = 'f'

declare @a int  ,@b int
set @a=CHARINDEX(right(@str2,1),@str1) --第二个字符串的最后一个字符的索引
set @b=CHARINDEX(left(@str3,1),@str1)  --第三个字符串的第一个字符的索引

--结果取得是第二个字符串和?第三个字符串中间的字符
select substring(@str1,@a+1,@b-@a-1)  
```

5.一个实现拆分由特殊符分隔的字符串的函数

```
Create   FUNCTION split
(
  @StrAll varchar(8000),
  @StrSeprate varchar(10)
)
RETURNS @temp TABLE(F1 VARCHAR(100))
AS
BEGIN
    DECLARE @i INT
    SET @StrAll =rtrim(ltrim(@StrAll ))
    SET @i=charindex(@StrSeprate,@StrAll )
    WHILE @i>=1
    BEGIN
        INSERT @temp VALUES(left(@StrAll ,@i-1))
        SET @StrAll =substring(@StrAll ,@i+1,len(@StrAll )-@i)
        SET @i=charindex(@StrSeprate,@StrAll )
    END
    IF @StrAll <>''
    INSERT @temp VALUES(@StrAll )
    RETURN
END
```

6.取出数据库中所有的表名

```
select name as  tablename from sysobjects where type='U' and name<>'dtproperties'
```

7.sqlserver中取随机数的两种方法

a.创建一个表Rand，字段是：RandomNum ，存储0到9的数据。

使用下面SQL语句可产生随机数：

```
select top 1 RandomNum from Rand order by NewID()
```

b.使用sqlserver提供的Rand()函数

```
select cast( floor(rand()*N) as int)
--产生到N-1之间的随机数
select cast(ceiling(rand() * N) as int)
--产生到N之间的随机数
```

8.数据库中的集合运算（交， 并 ，差）

先创建示例表

```
create table T1
(
    id int
)

create table T2
(
    id int
)
insert T1
select 1 union all
select 2 union all
select 3 union all
select 4 

insert T2
select 3 union all
select 4
运算代码：

--交集
----------------------------------------------
--方法
select *  from T1
intersect
select * from T2
--方法
select distinct
    *
from
    T1
where
    T1.id in (select id from T2)
--方法
select distinct
    *
from
    T1
where exists(select id from T2 where T2.id=T1.id)

--in和exists 的不同是in只能判断唯一列，而exists可以判断多列
---------------------------------------------------

--并集
select *  from T1
union all
select * from T2
----------------------------------------------------
--差集
select *  from T1
except
select * from T2
```

返回结果就不写了，呵呵，大家运行一下就知道了。

9 在sqlserver实现除法

通常情况下在用sql语句写除法得到的都是整数部分

```
select 29/3
--结果为
```

用下面的方法可以得到小数

```
--定义结果变量为Decimal类型
declare @result decimal(18,2)
--关键在于除数要乘以1.0
set @result=cast((29*1.0)/3  as decimal(18,2))
select @result
--结果为9.67
```

10 SqlServer 中根据时间得到星期

```
select datename(weekday,'2009-06-19')
--结果星期五 

select DATEPART(dw,'2009-06-19')
-- 结果6 

--因为系统默认星期天为一个星期的第一天，所以星期五对应的值为
```

11 使用sql语句设置表主键

```
alter table TableName alter column ColumnName int not null
 go
alter table TableName add constraint pk_ColumnName primary key(ID)
```

12 SCOPE_IDENTITY   @@IDENTITY    IDENT_CURRENT的区别

```
--SCOPE_IDENTITY和@@IDENTITY都返回上面操作的数据表最后row的IDENTITY 列的值
--不过SCOPE_IDENTITY受到作用域的限制,@@IDENTITY不受作用域的限制
/*
    如有T1和T2两种?表?,在?表?T1中有一insert触发器,当在表T1中插入一条数据时,触发
    器被激发,在T2表中插入一条数据,这时就存在两个作用域,T1 和T2 ,这时如果在
    T1的insert语句后执行SCOPE_IDENTITY() 和@@IDENTITY将返回不同的值
    SCOPE_IDENTITY 返回的是T1的IDENTITY
    @@IDENTITY 返回的是T2的IDENTITY
*/
select SCOPE_IDENTITY()
select @@IDENTITY 

--返回指?定表中的最后一个identity的值
select IDENT_CURRENT('TableName')
```

13 truncate和delete的区别

```
--delete 和truncate的作用作用都是将指定表中的数据清除，但两种方法有很大的区别

--delete语句是dml,这个操作会放到?rollback segement中
--事务提交之后才生效，如果有相应的trigger,执行的时候将被触发
--用delete删除的数据可以找回来
delete from tablename 

--truncate是ddl, 操作立即生效,
--原数据不放到rollback segment中,不能回滚. 操作不触发trigger
--所以在使用truncate的时候要特别小心
truncate table tablename
```

14 sqlservr中随机取数据

```
--MsSql随机取数据
select top 10 * from tablename order by newid()
--Access 随机取数据
select  top 10 *  FROM tablename order by rnd(id)
--mySql 随机取数据
SELECT * FROM tablename order by rand() limit 10
```

15 根据当前时间取上个月1号的时间

```
select dateadd(month,-1,getdate())-
             day(dateadd(month,-1,getdate()))+1
```

不断更新中……



