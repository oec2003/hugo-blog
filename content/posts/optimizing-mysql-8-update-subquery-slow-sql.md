---
title: "一次 MySQL 8 UPDATE 子查询慢 SQL 的优化过程"
date: 2026-08-08T10:34:00+08:00
categories: ["技术"]
tags: ["MySQL","性能优化"]
---
本文为 AI 整理。

最近排查了一条 MySQL 8 的 `UPDATE` SQL。表的数据量不算特别大，主表约 30 万行，关联表约 1 万多行，但会导致死锁

这个问题比较典型，记录一下排查过程。

## 1. 原始 SQL

业务逻辑很简单：根据关联表中的某个父级 ID 找到一批业务 ID，再更新主表对应记录。

为了脱敏，SQL 简化如下：

```sql
UPDATE main_table
SET status = '已处理'
WHERE ObjectID IN (
    SELECT related_id
    FROM relation_table
    WHERE ParentObjectID = 'xxx'
);
```

最开始的执行计划大致是：

```text
UPDATE
main_table
type = index
rows = 309000

DEPENDENT SUBQUERY
relation_table
type = ALL
rows = 12000
```

这里有两个明显的问题：

- 主表扫描约 30 万行；
    
- 子查询是 `DEPENDENT SUBQUERY`，而且关联表还是 `ALL` 全表扫描。
    

也就是说，MySQL 会扫描主表大量记录，并反复执行关联子查询。

---

## 2. 第一轮优化：给子查询加联合索引

查询条件是：

```sql
WHERE ParentObjectID = ?
```

同时还需要返回：

```sql
related_id
```

因此增加联合索引：

```sql
CREATE INDEX idx_parent_related
ON relation_table (
    ParentObjectID,
    related_id
);
```

索引顺序很重要：

```text
ParentObjectID
related_id
```

因为 `ParentObjectID` 是查询条件，而 `related_id` 是返回字段，这样还可以形成覆盖索引。

增加后，执行计划明显改善：

```text
UPDATE
main_table
type = index
rows = 309000

DEPENDENT SUBQUERY
relation_table
type = ref
key = idx_parent_related
rows = 1
Using index
```

原来的：

```text
ALL + 12000 行
```

变成了：

```text
ref + 1 行
```

说明索引本身是有效的。

但问题来了：**SQL 仍然需要 7 秒左右。**

更有意思的是，有一次执行结果：

```text
Affected rows: 0
Time: 7.7s
```

一行都没更新，仍然用了 7 秒。

这就证明：时间并不是花在真正的 `UPDATE` 上，而是花在了“找数据”上。

---

## 3. 真正的瓶颈：外层仍然扫描 30 万行

虽然子查询已经从全表扫描优化成索引查询，但执行计划依然是：

```text
main_table
rows = 309000
        ↓
DEPENDENT SUBQUERY
rows = 1
```

可以简单理解成：

```text
扫描主表第 1 行
    ↓
去关联表索引查一次

扫描主表第 2 行
    ↓
再查一次

...

扫描约 30 万行
```

于是问题从：

> 30 万 × 1.2 万行扫描

变成了：

> 30 万次索引探测

已经好了很多，但仍然不是理想方案。

真正希望得到的执行方式应该是：

```text
根据 ParentObjectID
        ↓
一次找到少量 related_id
        ↓
利用 ObjectID 主键
        ↓
直接更新对应记录
```

例如最终只有 20 个 ID，那应该只是几十次索引操作，而不是扫描 30 万行。

---

## 4. MySQL 版本成了关键

进一步检查发现数据库版本是：

```text
MySQL 8.0.19
```

这点很关键。

在这个版本下，类似：

```sql
UPDATE ...
WHERE id IN (
    SELECT ...
);
```

的单表 `UPDATE`，优化器在子查询转换方面还存在限制，因此执行计划仍然表现为：

```text
DEPENDENT SUBQUERY
```

即使尝试：

```sql
SELECT /*+ SUBQUERY(MATERIALIZATION) */ ...
```

也不能从根本上解决这个版本下的 UPDATE 执行方式问题。

MySQL 8.0.21 以后，对单表 `UPDATE / DELETE` 中 `IN / EXISTS` 子查询的 semijoin、materialization 等优化能力进行了增强。

所以有时候慢 SQL 并不是“索引没建好”，**数据库版本和优化器能力同样需要考虑。**

---

## 5. `UPDATE JOIN` 是更自然的写法

从 SQL 本身来说，更合适的方式其实是：

```sql
UPDATE main_table t
JOIN relation_table s
    ON t.ObjectID = s.related_id
SET t.status = '已处理'
WHERE s.ParentObjectID = 'xxx';
```

配合：

```sql
relation_table(ParentObjectID, related_id)
```

以及：

```sql
main_table.ObjectID PRIMARY KEY
```

理想执行路径就是：

```text
ParentObjectID 联合索引
        ↓
找到 related_id
        ↓
ObjectID 主键定位
        ↓
UPDATE
```

但实际项目中还遇到了另一个问题：我们的程序中间存在 SQL 解析、安全检查等逻辑，暂时不支持 `UPDATE JOIN`，虽然直接在 MySQL 客户端中执行没有问题。

这也是企业应用平台里比较常见的情况：

> **数据库支持，不代表应用层 SQL 执行器一定支持。**

---

## 6. 当前最实用的方案：拆成两步

既然暂时不能使用 `UPDATE JOIN`，在 MySQL 8.0.19 下，一个简单可靠的办法就是把 SQL 拆开。

第一步：

```sql
SELECT related_id
FROM relation_table
WHERE ParentObjectID = ?;
```

利用联合索引快速得到少量 ID。

第二步：

```sql
UPDATE main_table
SET status = '已处理'
WHERE ObjectID IN (
    ?, ?, ?, ...
);
```

此时已经没有子查询，MySQL 可以直接利用：

```text
PRIMARY KEY(ObjectID)
```

进行定位。

如果一次 ID 数量特别大，可以按 500～1000 条进行分批更新。

对于平台型产品来说，这种方案还有一个好处：SQL 执行层只需要支持普通 `SELECT` 和单表 `UPDATE`，兼容性和安全控制都更简单。

---

## 7. 顺便发现的一个数据模型问题

排查过程中还发现两个关联字段定义并不一致：

```text
ObjectID      CHAR(36)
related_id    VARCHAR(200)
```

实际上两个字段存的都是 UUID。

如果业务语义确定如此，更合理的设计应该统一为类似：

```text
CHAR(36)
```

另外：

```text
ParentObjectID VARCHAR(200)
```

如果同样保存 UUID，也可以考虑调整。

这不仅让字段语义更准确，还能明显缩小：

```sql
(ParentObjectID, related_id)
```

这个联合索引的体积。

不过需要注意：**字段类型不一致是数据建模需要优化的问题，但这次 7 秒慢 SQL 的核心原因仍然是 MySQL 8.0.19 下的执行策略。**

---

## 最后的几个经验

这次排查有几个比较值得记住的点：

1. `DEPENDENT SUBQUERY` 出现时，要特别关注外层扫描行数；
    
2. 给子查询加索引，只解决了“每次查询贵不贵”，不一定解决“要查询多少次”；
    
3. `Affected rows = 0` 仍然耗时很长，通常说明成本主要发生在数据定位阶段；
    
4. SQL 优化不能只看索引，还要看 **Join 顺序、子查询执行方式和数据库版本**；
    
5. 数据库里能执行的 SQL，到了低代码平台、ORM 或 SQL 安全层，不一定还能执行；
    
6. 对于 UUID 这类固定语义字段，字段类型最好在不同表之间保持一致。
    

这次最核心的一句话就是：

> **慢 SQL 优化的目标，不只是让“每一次查询更快”，更重要的是让那些根本没必要发生的查询不要发生。**
