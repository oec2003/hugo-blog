---
title: 在SQL查询中使用LIKE来代替IN
date: 2011-08-13
categories: [技术]
tags: [Sql, SqlServer, 小技巧]
---

在SQL查询中根据已知ID的集合来查询结果我们通常会用到IN，直接在IN后面给出ID的集合或是在IN后面跟一个子查询。如下：

```
SELECT * FROM Orders
WHERE OrderGUID IN('BC71D821-9E25-47DA-BF5E-009822A3FC1D','F2212304-51D4-42C9-AD35-5586A822258E')
```

可以看出直接在IN后面跟ID的集合需要将每一个ID都用单引号引起来。在实际应用中会遇到这么一种情况，在界面中收集的是一串GUID的拼接字符串，中间以逗号隔开，如果作为参数传到一个存储过程中执行，最终生成的语句会是下面这样：

```
SELECT * FROM Orders
WHERE OrderGUID IN('BC71D821-9E25-47DA-BF5E-009822A3FC1D,F2212304-51D4-42C9-AD35-5586A822258E')
```

这样就不能查询到正确的结果。

一般情况下我们解决此问题的思路是将传入的字符串用一个split函数来处理，最终处理的结果是一张表，然后将这个表做自查询即可，如下：

```
DECLARE @IDs VARCHAR(4000)
SET @IDs='BC71D821-9E25-47DA-BF5E-009822A3FC1D,F2212304-51D4-42C9-AD35-5586A822258E'
DECLARE @temp TABLE(str VARCHAR(50))
INSERT INTO @temp
SELECT * FROM dbo.Split(@IDs,',')
SELECT * FROM Orders WHERE OrderGUID IN (SELECT str FROM @temp)
```

当然split函数系统比不提供，需要我们自己写：

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

像这样做非常麻烦，而且还需要借助函数来实现，下面介绍一种简单的方法，因为GUID是唯一的，所以在上面的例子中可以使用LIKE来代替IN也可以达到同样的查询效果：

```
SELECT * FROM Orders
WHERE 'BC71D821-9E25-47DA-BF5E-009822A3FC1D,F2212304-51D4-42C9-AD35-5586A822258E'
LIKE '%'+convert(VARCHAR(40),OrderGUID)+'%'
```

