---
title: SQL查询-将列转换成字符串（for xml path）
date: 2013-03-19
categories: [技术]
tags: [For Xml, Sql, SqlServer]
---

## 背景

最近做一报表，因为查询的SQL很长很复杂，导致直接查询出现异常，后来想到将大量重复的只是查询条件不同的子查询放到函数中去做，无奈需要的参数不能传进函数中，因为参数格式类似如：'ProjGUID1','ProjGUID2' 这样，这是报表工具生成的，无法修改。现在就要想办法让参数能传进函数中或是换用其他的方式。

## 思路

1、首先想到的是用存储过程，但是在报表工具中调试不通，存储过程不能得到有效的执行，可能是根本就不支持存储过程；

2、将参数作为in的条件，查询出符合条件的GUID，返回的是一个表，然后循环表的行记录，拼接GUID传入函数，但是报表工具中的SQL不支持定义变量和临时表，此方法也行不通；

3、利用SQL语句的For Xml 将GUID查询成一个XML结构的字符串，但传入函数中后解析该XML需要用到系统存储过程sp_xml_preparedocument ，函数中并不支持调用存储过程，此路也不通。关于SQL中解析XML可以参见我之前的博文《[使用sp_xml_preparedocument处理XML文档](http://blog.fwhyy.com/2011/07/use-sp_xml_preparedocument-processing-xml-documents/)》。

## 解决方法

上面说到了SQL的For Xml可以将查询的列转换成XML结构的字符串，还有一种方法可以将查询的字段转换成以特定符号隔开的字符串，那就是For Xml Path：

```
SELECT TOP 2 CONVERT(VARCHAR(40),ProjGUID)+',' FROM p_Project FOR XML PATH('')
```

上面的语句得到的结果如下：

```
BAA95B67-FC41-4A78-AF1C-014BBE0AC368,37641496-23AA-46CB-9817-027AA120F5C6,
```

至此问题解决，这样的字符串是可以传进函数的，只需将最后的逗号去掉即可。

