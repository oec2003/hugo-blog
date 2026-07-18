---
title: Sql中分隔字串–>查询–>组合字串
date: 2008-03-18
categories: [技术]
tags: [Sql,小技巧]
---

最近在工作遇到一个数据库查询的问题，大概如下:表Table1中有字段No和Title，每一个No对应一个Title，表Table2中有NoAll字段，NoAll字段的value是No的组合，以逗号隔开，如”111,222,333″，现在要查询Table2，根据NoAll将其中的每一个No所对应的Title查询出来也以逗号分隔显示，如：”oec2003,oec2004,oec2004″。表定义如下：
<!--more-->

```
CREATE TABLE Table1
(
    No VARCHAR(5),
    Title VARCHAR(20)
)

CREATE TABLE Table2
(
    NoAll VARCHAR(100)
)

INSERT INTO Table1 VALUES('111','oec2003')
INSERT INTO Table1 VALUES('222','oec2004')
INSERT INTO Table1 VALUES('333','oec2005')

INSERT INTO Table2 VALUES('111,222,333')
```

因为NoAll是用逗号分隔的，所以要查询其中的每一个No就要将NoAll进行拆分，就想到了写一个split函数，如下：

```
CREATE FUNCTION Split
(
    @SourceSql varchar(8000),
    @StrSeprate varchar(10)
)
RETURNS @temp TABLE(F1 VARCHAR(100))
AS
BEGIN
    DECLARE @i INT
    SET @SourceSql=rtrim(ltrim(@SourceSql))
    SET @i=charindex(@StrSeprate,@SourceSql)
    WHILE @i>=1
        BEGIN
            INSERT @temp VALUES(left(@SourceSql,@i-1))
            SET @SourceSql=substring(@SourceSql,@i+1,len(@SourceSql)-@i)
            SET @i=charindex(@StrSeprate,@SourceSql)
        END
    IF @SourceSql<>''
        INSERT @temp VALUES(@SourceSql)
    RETURN
END
```

将NoAll拆分了后返回的是一个Table，Table中的每一行是一个No值，要查出每个No对应的Title就要遍历这个Table，首先想到的就是使用游标，在这里我也是将游标写在了一个函数里，如下：

```
CREATE FUNCTION GetTitle(@NoAll NVARCHAR(2000))
    RETURNS NVARCHAR(2000)
AS
BEGIN
    DECLARE @result VARCHAR(2000)
    SET @result=''
    DECLARE getTitle CURSOR
    FOR
    SELECT * FROM split(@NoAll,',')
    OPEN getTitle

    DECLARE @No SYSNAME

    FETCH FROM getTitle INTO @No
    WHILE @@fetch_status=0
    BEGIN

    SET @result=@result+(SELECT Title FROM Table1 WHERE No=@No)+','
    FETCH FROM getTitle INTO @No
    END
    CLOSE getTitle
    SET @result= substring(@result,0,len(@result))

    DEALLOCATE getTitle

    RETURN @result
END
```

最后执行下面语句出想要的结果,如下：

```
SELECT
    NoAll,
    dbo.GetTitle(No) AS TitleAll
FROM
    Table2
```

结果：

![2010-12-30_150932](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301621387.gif)



