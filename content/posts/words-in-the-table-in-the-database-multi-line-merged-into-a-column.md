---
title: 在数据库中将字表中的多行合并到一列中
date: 2009-10-15
categories: [技术]
tags: [Sql, 合并列]
---

几年前就做过这样的查询，在最近的项目中又遇到这样的需求，在此记录一下。

假设有一个文章表Post和一个评论表Comments，可以对文章进行多次评论，现在希望在对Post表查询时能将Post的所有评论内容组合到一个字段中显示。

首先创建表Post和Comments

```
create table Post
(
    [PostID] int identity(1,1) primary key not null,
    [Title] nvarchar(50),
    [Content] text,
    [CreateDate] datetime default getdate()
)

create table Comments
(
    [CommentID] int identity(1,1) primary key not null,
    [PostID] int,
    [Content] text,
    [CreateDate] datetime default getdate()
)
```

给这两个表添加一些测试数据

```
insert into Post select '钓鱼岛是中国的吗？','钓鱼岛是中国的',getdate()
insert into Comments select 1,'绝对是',getdate()
insert into Comments select 1,'必须是的',getdate()
insert into Comments select 1,'谁说不是呢',getdate()
```

评论内容的组合使用一个函数来实现，在函数中使用游标去遍历给定PostID的所有评论然后进行拼接，函数代码如下：

```
create  FUNCTION fn_GetAllComments(@PostID int)
RETURNS NVARCHAR(4000)
AS
BEGIN
    DECLARE @result VARCHAR(4000)
    SET @result=''
    DECLARE getAllComments CURSOR
    FOR
        select CommentID from Comments where PostID=@PostID
    OPEN getAllComments
    DECLARE @ID SYSNAME
    FETCH  FROM getAllComments INTO @ID
    WHILE @@fetch_status=0
    BEGIN
        SET @result=@result+(select convert(nvarchar(20),CreateDate,120)
                                from Comments where CommentID=@ID)+':'+
                            (select cast([Content] as nvarchar(4000))
                                from Comments where CommentID=@ID)+'；'
        FETCH  FROM getAllComments INTO @ID
    END
    CLOSE getAllComments
    SET @result= substring(@result,0,len(@result))
    DEALLOCATE getAllComments
    RETURN @result
END
```

现在写SQL语句来测试一下结果

```
select
    Title,[Content],CreateDate,dbo.fn_GetAllComments(PostID) as AllComments
from Post
```

查询结果如下：

![2010-10-15_153653](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290653710.png)

