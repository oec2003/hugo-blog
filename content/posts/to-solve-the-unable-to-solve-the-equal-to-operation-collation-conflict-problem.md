---
title: 解決“无法解决 equal to 操作的排序规则冲突 ”问题
date: 2008-07-03
categories: [技术]
tags: [SqlServer,错误解决]
---

## 问题：

在创建存储过程时 出现 “无法解决 equal to 操作的排序规则冲突 ”

## 解决方法：

1 WHERE 列名 collate Chinese_PRC_CI_AS(强制指定排序规则)，如：

```
select
    *
from
    test
where
    name collate chinese_prc_ci_as in
     (select name1 chinese_prc_ci_as from test1)
```

2 如果涉及到多表查询，则在on后面加上collate Chinese_PRC_CI_AS(强制指定排序规则) 如：

```
select
    *
from
    test1 1
join
    test2 2
on
    1.id=2.id collate Chinese_PRC_CI_AS
```

