---
title: SQL 计算一個字符串在另一个字符串中出現的次数
date: 2008-08-06
categories: [技术]
tags: [Sql,小技巧]
---

在sqlserver中來計算一個字符串在另一個字符串中出現的次數，通常會去用循環來匹配，然後計算出出現的次數，這樣的效能不是很高。現在講一種比較簡單的方法也能實現同樣的功能，思路如下：
<!--more-->

* 設有字符串str1 str2 ，現在要求str1 在 str2中出現的次數。
* 將str1後面加上一個字符，如：str1+’_’，設更改後的字符串為str3。
* 在str2中如果有子串str1 ，將之替換成str3，替換後的字符串設為str4。
* str4與str2的長度之差即為str1在str2中出現的次數。

看下面这个函数

```
CREATE  function fn_SCountOneWordOnOtherWord
(
    @Word NVARCHAR(200),
    @WordAll NVARCHAR(2000)
)
RETURNS CHAR(4)
AS
BEGIN
    RETURN  len(replace(@WordAll,@Word,@Word+'_'))-len(@WordAll)
END
```

