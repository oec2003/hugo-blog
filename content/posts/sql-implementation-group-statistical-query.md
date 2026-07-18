---
title: SQL实现分组统计查询（按月、小时分组）
date: 2009-06-04
categories: [技术]
tags: [SqlServer]
---

## 首先创建数据表

```
Create table Counter
(
    CounterID int identity(1,1) not null,
    IP varchar(20),
    AccessDateTime datetime,
    AccessCount int
)
```

该表在这儿只是演示使用，所以只提供了最基本的字段:IP地址，访问时间和访问次数。如果每访问一次就插入一条记录，那么AccessCount可以不要，查询时使用count就可以了，这样当访问量很大的时候会对数据库造成很大压力。设置AccessCount字段可以根据需求在特定的时间范围内如果是相同IP访问就在AccessCount上累加。

现在往表中插入几条记录

```
insert into Counter
select '127.0.0.1',getdate(),1 union all
select '127.0.0.2',getdate(),1 union all
select '127.0.0.3',getdate(),1
```

## 根据年来查询，以月为时间单位

通常情况下一个简单的分组就能搞定

```
select
    convert(varchar(7),AccessDateTime,120) as Date,
    sum(AccessCount) as [Count]
from
    Counter
group by
    convert(varchar(7),AccessDateTime,120)
```

像这样分组后没有记录的月份不会显示，如下：

![2010-12-30_103754](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301950583.gif)

这当然不是我们想要的，所以得换一种思路来实现，如下：

```
declare @Year int
set @Year=2009
select
    m as [Date],
    sum(
        case when datepart(month,AccessDateTime)=m
        then   AccessCount else 0 end
       )  as [Count]
from
    Counter c,
    (
        select 1 m
        union all select 2
        union all select 3
        union all select 4
        union all select 5
        union all select 6
        union all select 7
        union all select 8
        union all select 9
        union all select 10
        union all select 11
        union all select 12
    ) aa
where
    @Year=year(AccessDateTime)
group by
    m
```

查询结果如下：

![2010-12-30_104014](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301950245.gif)

## 根据天来查询，以小时为单位。

```
declare @DateTime datetime
set @DateTime=getdate()
select
    right(100+a,2)+ ':00 ->  '+right(100+b,2)+ ':00 ' as DateSpan,
    sum(
        case when datepart(hour,AccessDateTime)> =a 

                  and datepart(hour,AccessDateTime) <b
        then AccessCount else 0 end
       )  as [Count] 

from   Counter c ,
(select   0 a,1 b
union   all   select     1,2
union   all   select     2,3
union   all   select     3,4
union   all   select     4,5
union   all   select     5,6
union   all   select     6,7
union   all   select     7,8
union   all   select     8,9
union   all   select     9,10
union   all   select     10,11
union   all   select     11,12
union   all   select     12,13
union   all   select     13,14
union   all   select     14,15
union   all   select     15,16
union   all   select     16,17
union   all   select     17,18
union   all   select     18,19
union   all   select     19,20
union   all   select     20,21
union   all   select     21,22
union   all   select     22,23
union   all   select     23,24
) aa
where datediff(day,@DateTime,AccessDateTime)=0
group by right(100+a,2)+ ':00 ->  '+right(100+b,2)+ ':00 '
```

查询结果如下图：

![2010-12-30_104151](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301951487.gif)

