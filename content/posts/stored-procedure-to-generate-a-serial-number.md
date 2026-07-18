---
title: 存储过程生成流水号
date: 2007-10-31
categories: [技术]
tags: [Sql,SqlServer,存储过程]
---

## 首先在数据库中创建一个存放流水号的表

```
CREATE TABLE [dbo].[NumSeq] (
    [Cate] [varchar] (2)  NOT NULL ,
    [DateNo] [varchar] (4)  NOT NULL ,
    [Seq] [int] NULL ,
    [CrTime] [datetime] NOT NULL
)
```

上面的代码中，Cate 字段为流水号的头，可以在下面的存储过程中用参数的方式传入，我的定义是2个字符，这个可以根据具体需要更改

* DateNo 字段为获取日期信息
* Seq 字段为流水号，但最终生成的流水号是这三个字段的相加

## 创建存储过程

```
CREATE  PROC dpPMT_SGetMaintainSeq
@MaintainCate VARCHAR(2)

AS
--***********************累加编号*************************************************
DECLARE @MaintainNo VARCHAR(12)
IF NOT EXISTS(SELECT
            *
        FROM
            NumSeq
        WHERE
            Cate=@MaintainCate AND DATEDIFF(DAY,CrTime,GETDATE())=0)
    BEGIN
        INSERT INTO
            NumSeq(Cate,DateNo,Seq)
        values(@MaintainCate,RIGHT(CONVERT(VARCHAR(4),YEAR(GETDATE())),2)+
                REPLICATE('0',2-LEN(MONTH(GETDATE())))+CONVERT(VARCHAR(2),MONTH(GETDATE())),0)

    END
ELSE
    BEGIN
        UPDATE
            NumSeq
        SET
            Seq=Seq+1
        WHERE
            Cate=@MaintainCate AND DateNo=RIGHT(CONVERT(VARCHAR(4),YEAR(GETDATE())),2)+
                       REPLICATE('0',2-LEN(MONTH(GETDATE())))+CONVERT(VARCHAR(2),MONTH(GETDATE()))
    END

--************************组合编号***************************************************************
SELECT
    @MaintainNo=Cate+DateNo+REPLICATE('0',6-LEN(Seq))+CONVERT(VARCHAR(6),Seq)
FROM
    NumSeq
WHERE
    Cate=@MaintainCate AND DateNo=RIGHT(CONVERT(VARCHAR(4),YEAR(GETDATE())),2)+
                      REPLICATE('0',2-LEN(MONTH(GETDATE())))+CONVERT(VARCHAR(2),MONTH(GETDATE()))

SELECT @MaintainNo
```

这个存储过程最终输出的结果如：AA071031000001 前面两位是传入的参数，中间四位是年份的后两位和月，最后的六位为6位数字的流水号。您也可以修改上面的存储过程来生成符合您要求的流水号

