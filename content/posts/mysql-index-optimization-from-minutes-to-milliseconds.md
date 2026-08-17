---
title: "MySQL 索引优化实战：从一分钟查不出到毫秒级返回"
date: 2026-08-17T16:38:00+08:00
categories: ["技术"]
tags: ["MySql","性能优化","Sql"]
---
> 一次真实的慢查询排查记录：一张 1000 多万行的业务表，一条看似普通的 SQL 跑了一分钟没出结果。从 OR 条件、单列索引与联合索引的误区，到 EXPLAIN 逐列解读、覆盖索引的"假象"、最左前缀原则，完整复盘整个优化过程。
>

## 背景

业务上有一个很常见的需求：查询某个用户经手过的所有任务实例。任务表 `t_task_record` 有 1000 多万行数据，一条任务可能和多个用户字段相关——创建人、参与人、委托人、办结人、转发人。

最初的 SQL 长这样：

```sql
SELECT task_id FROM t_task_record 
WHERE process_code='p1001'
  AND (creator_id='u1001' 
    OR participant_id='u1001' 
    OR delegate_id='u1001' 
    OR finisher_id='u1001' 
    OR forwarder_id='u1001');
```

## 第一轮：跨列 OR 是索引杀手

这个写法功能正确，但性能堪忧。**对多个不同字段做 OR 条件，索引基本用不上**——即使 5 个字段各自都有单列索引，MySQL 大多数情况下也无法把它们组合起来（index_merge_union 优化很少触发），通常退化为只走其中一个索引再逐行过滤。

常见的改进是拆成 UNION：

```sql
SELECT task_id FROM t_task_record WHERE process_code='p1001' AND creator_id='u1001'
UNION
SELECT task_id FROM t_task_record WHERE process_code='p1001' AND participant_id='u1001'
UNION
-- ... 其余三个字段同理
```

用 UNION 自动去重（同一条任务可能多个角色都是同一个人）；业务上确定不会重复时用 UNION ALL 更快。每个子查询都能走各自字段的索引。

更根本的解法是把 5 个平铺字段重构成参与人关系表：

```
t_task_participant(task_id, user_id, role)
```

一条任务涉及几个人就插几行，role 区分角色。查询变成 `WHERE user_id='u1001'`，一个索引解决所有问题。这是"查某人经手过的记录"这类需求的标准设计。

## 第二轮：为什么"两个字段都有索引"还是慢

有趣的是，即便简化成单条最简单的 SQL，依然一分钟查不出来：

```sql
SELECT task_id FROM t_task_record 
WHERE process_code='p1001' AND creator_id='u1001';
```

表近千万级数据，两个字段"都有索引"。问题出在哪？

**"两个字段都有索引"大概率是两个单列索引，而不是联合索引。** 对 AND 条件，MySQL 通常只能选一个索引用：先扫描出符合这一个条件的所有行，再逐行回表检查另一个条件。如果这个 process_code 对应几百万行，那就是几百万次索引扫描加回表——不慢才怪。

AND 条件下 MySQL 几乎不会自动合并两个单列索引（index merge intersection 极少生效）。记住：

> **两个单列索引 ≠ 联合索引。**

## 第三轮：EXPLAIN 逐列解读

执行计划完全印证了判断：

```
type: ref
key: idx_process_code        ← 只用了 process_code 单列索引
key_len: 803
rows: 3,712,170              ← 要扫描约 370 万行！
filtered: 10                 ← 扫出的行只有 10% 能满足另一个条件
Extra: Using where           ← 逐行回表过滤
```

几个关键信息：

- `possible_keys` 里只有 `idx_process_code`，creator_id 的索引压根没被考虑；
- 这个 process_code 的记录占了**全表将近一半**（370 万 / 740 万），是个"超级流程"，单靠它过滤没有意义；
- `key_len=803` 暴露了另一个隐患：803 ≈ 200 × 4 + 3，说明 process_code 很可能是 `varchar(200)` utf 8 mb 4，而实际的编码只有几位。**列定义严重过大**，导致索引又大又深，扫描和缓存效率都差。

修复方案是建复合覆盖索引（先收窄列宽，再建索引）：

```sql
ALTER TABLE t_task_record MODIFY process_code varchar(32);
ALTER TABLE t_task_record 
ADD INDEX idx_proc_creator (process_code, creator_id, task_id);
```

建完后扫描行数从 370 万降到个位数，`Extra` 变成 `Using index`（覆盖索引，无需回表），毫秒级返回。

## 第四轮：SHOW INDEX 发现的意外

查看表的真实索引情况：

```sql
SHOW INDEX FROM t_task_record;
```

发现两个问题：

**1. creator_id 根本没有索引。** 已有的单列索引是 process_code、app_code、receive_time、finish_time、status、delegate_id、finisher_id、task_id、participant_id——creator_id 和 forwarder_id 不在其中。这正是 `possible_keys` 只有 idx_process_code 的原因。

**2. 一个可疑的 8 列复合索引 `idx_report`：**

```
(id, title, operator_name, finish_time, receive_time, status, used_time, task_id)
```

第一列是 id——也就是主键本身。我当时判断：任何查询用主键定位后不需要再走它，而 WHERE 里没有 id 的查询又用不上它（最左前缀原则）。

**这个判断后来被证明说得太绝对了。**

另外还有个插曲：客户端表设计器里看到的索引列表和 SHOW INDEX 的结果互有出入（设计器里有 idx_creator_id、idx_forwarder_id，却没有 idx_report）。这种"互有出入"通常意味着：看的是两张不同的表（库里可能同时存在正式表和某个冗余副本）、设计器里有未保存的修改，或者连的根本不是同一个库。**SHOW INDEX 才是数据库的真实状态，永远以它为准**，设计器只是客户端的编辑界面。

## 第五轮：type=index——"用了索引"的假象

验证 idx_report 是否真的无用时，出现了一条有趣的执行计划：

```sql
EXPLAIN SELECT task_id FROM t_task_record WHERE title='xxx';
```

```
type: index                  ← 注意，是 index 不是 ref
key: idx_report
key_len: 1923
rows: 877,002
Extra: Using where; Using index
```

索引"用了"，但这是**索引全扫描**，不是索引查找。

EXPLAIN 的 `type` 从好到差大致是：

```
const > eq_ref > ref > range > index > ALL
```

- `ref`：索引**查找**（seek），精确定位；
- `index`：**把索引树从头到尾完整扫一遍**，扫到每个条目再逐个判断条件（`Using where`）。

优化器选 idx_report 不是因为它能查 title（最左前缀确实让它无法 seek），而是出于成本算计：这条 SQL 只需要 task_id 和 title 两列，**恰好都在 idx_report 里**（`Using index` = 覆盖索引，不回表）；idx_report 这棵索引树比整张表窄得多，扫它 87 万个条目比扫 740 万行完整数据便宜。

本质上，**idx_report 在这里扮演的是"一张瘦身版的表"，而不是索引**。扫描行数并没有减少，只是每行变窄了。

由此得出的修正结论：

1. WHERE 没有 id 时，idx_report 不能做查找，但仍可能作为覆盖索引被全扫描——不能简单说"完全用不上"；
2. 但"用了索引"≠"索引有效"，87 万行扫描和 ref 查找的性能天差地别；
3. 正确的优化是给 title 建专用索引，让 `type` 变成 `ref`；
4. idx_report 不能直接删——有些查询依赖它做覆盖扫描，删掉会退化成全表扫描。正确顺序是**先补齐专用索引，确认无依赖后再删**。

## 第六轮：SELECT * 为什么用不上索引

把上面的 SQL 改成 `SELECT *`：

```sql
SELECT * FROM t_task_record WHERE title='xxx';
```

idx_report 就彻底用不上了（`type=ALL` 全表扫描）。原因：

1. `SELECT *` 需要整行几十个字段，idx_report 只有 8 列，**覆盖不了，必须回表**；
2. title 不是最左列，索引**做不了查找**；
3. "扫索引全树 740 万个条目 + 每个匹配条目再回表"比直接全表扫描还贵，优化器弃用索引。

规律总结：

| 查询形态 | 索引能否用上 |
|---|---|
| 条件命中索引**最左前缀**（能 seek） | 能用，`SELECT *` 也能用（查找后回表，行数少所以划算） |
| 条件不在最左前缀，但查询列都在索引里 | 只能**覆盖全扫描**（type=index） |
| 条件不在最左前缀，又要 `SELECT *` | **用不上**，全表扫描（type=ALL） |

核心不是"SELECT * 用不到索引"，而是：**覆盖索引只是"次优替代品"，只在查询列恰好被索引包含时成立**。真正可靠的方案永远是让条件字段拥有能做最左前缀查找的索引。

## 第七轮：联合索引的列顺序

假设索引改为 `(title, operator_name, finish_time, ...)`，回答两个经典问题。

**问题一：WHERE 里条件的书写顺序影响索引使用吗？**

```sql
SELECT * FROM t_task_record 
WHERE operator_name='xxx' AND title='xxx';
```

不影响。AND 满足交换律，优化器会收集所有等值条件去匹配索引从左到右的列。title 命中第 1 列、operator_name 命中第 2 列，两列连起来一起查找。判断用到第几列看 `key_len`：两列都命中时 key_len 是两列长度之和。双条件比单条件还快——过滤后命中行更少，回表次数也更少。

**问题二：条件列不在最左会怎样？**

| 查询条件 | 效果 |
|---|---|
| 两列都有等值条件 | 两列都用于查找，最优 |
| 只有 title（最左列） | 用第 1 列查找，也挺好 |
| 只有 operator_name（跳过最左列） | **无法查找**，只能索引全扫或全表扫 |

联合索引设计的经验法则：

1. **等值查询的列放前面**，范围查询（>、<、LIKE 'xx%'）的列放后面；
2. 都是等值条件时，**选择性高（区分度大）的列放前面**；
3. 如果"只按第二列查"也是高频场景，它需要单独一个自己打头的索引——一个联合索引覆盖不了两种查询模式。

## 附：一个冷知识

InnoDB 的二级索引会自动在叶子节点附加主键值。也就是说 `(title, ...)` 这棵索引树的每个条目里天然带着主键 id，**根本不需要显式把主键写进联合索引的第一列**。idx_report 把 id 放第一位不仅是冗余，还把 title 挤出了最左位置，毁掉了它对 title 查询的查找能力。

另外，即使索引可用，如果条件匹配的行占比太高（如超过全表 10%），优化器会判断"索引查找 + 海量回表"比全表扫描还贵，转而走全表扫描——这是基于成本的正常决策，不是索引失效。

## 总结

这次排查的完整清单：

| 问题 | 动作 |
|---|---|
| 跨 5 列 OR 无法用索引 | UNION 拆分；长期重构为参与人关系表 |
| 只有单列索引，AND 条件只能用一个 | 建 `(process_code, creator_id, task_id)` 复合覆盖索引 |
| creator_id / forwarder_id 无索引 | 按查询模式补齐复合索引 |
| 列宽定义过大（varchar(200) 存短编码） | 收窄列宽后再建索引 |
| process_code 数据严重倾斜（单值占全表一半） | 靠联合索引精确定位；`ANALYZE TABLE` 刷新统计 |
| idx_report 主键打头的 8 列冗余索引 | 先补齐专用索引，确认无覆盖扫描依赖后再删 |

一句话记住这次的核心教训：

> **"有索引"和"索引能被用上"是两回事，"索引被用上"和"索引用得好"又是两回事。** 看 EXPLAIN 时别只看 key 列有没有值——type 是 ref 还是 index、rows 是个位数还是几百万、Extra 是 Using index 还是 Using where，这些才是真相。
