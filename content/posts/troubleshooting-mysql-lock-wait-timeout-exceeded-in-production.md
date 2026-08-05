---
title: "生产环境 MySQL Lock wait timeout exceeded 排查实战"
date: 2026-08-05T15:39:00+08:00
categories: ["技术"]
tags: ["MySQL","技巧"]
---
> **案例背景**：某业务系统在执行单条数据删除时频繁报错 `Lock wait timeout exceeded`，初步怀疑是数据量过大导致超时，经排查实为**锁竞争**问题。本文完整记录从现象到根因的排查过程，以及 MySQL 8.0 下的适配方案，供参考。

---

## 一、问题现象

业务系统调用删除接口时返回异常：

```
Message: DELETE FROM d_xxx 
WHERE ObjectID='57736651-819e-4f9c-acb9-ceef7c49a2ef'

InnerException: Lock wait timeout exceeded; try restarting transaction
```

**关键特征**：
- SQL 是**单条精确删除**（`WHERE ObjectID = 'xxx'`）
- 堆栈显示为业务表单删除（`RemoveFormData` → `RemoveSubFormData`）
- 超时时间约 50 秒（MySQL 默认 `innodb_lock_wait_timeout`）

---

## 二、初步判断：不是数据量问题

| 误判点         | 实际情况                             |
| ----------- | -------------------------------- |
| `DELETE` 语句 | 单条精确删除，扫描行数极少                    |
| 超时时间        | 如果是数据量大，应该是执行时间长；但这里是**等待锁**的时间长 |

**结论**：这是典型的 **InnoDB 锁等待超时**，即当前事务需要获取的行锁/间隙锁被其他事务持有，等待超过阈值后被强制回滚。

---

## 三、排查流程（Step by Step）

### Step 1：定位活跃事务

通过 `INNODB_TRX` 查看当前未提交的事务：

```sql
SELECT 
    trx_id,
    trx_mysql_thread_id,
    trx_state,
    trx_started,
    TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS trx_idle_seconds
FROM information_schema.INNODB_TRX
WHERE trx_state = 'RUNNING'
ORDER BY trx_started;
```

**发现**：存在一个已运行数分钟甚至数小时的 `RUNNING` 事务，线程 ID 为 `xxx`。

### Step 2：确认阻塞关系（MySQL 5.7 写法）

在 MySQL 5.7 中，可通过以下 SQL 确认谁阻塞了谁：

```sql
SELECT 
    r.trx_id AS waiting_trx_id,
    r.trx_mysql_thread_id AS waiting_thread,
    b.trx_id AS blocking_trx_id,
    b.trx_mysql_thread_id AS blocking_thread
FROM information_schema.INNODB_LOCK_WAITS w
JOIN information_schema.INNODB_TRX b ON b.trx_id = w.blocking_trx_id
JOIN information_schema.INNODB_TRX r ON r.trx_id = w.requesting_trx_id;
```

### ⚠️ Step 3：MySQL 8.0 的坑

**如果使用的是 MySQL 8.0**，执行上述 SQL 会报错：

```
1109 - Unknown table 'INNODB_LOCK_WAITS' in information_schema
```

**原因**：MySQL 8.0 重构了锁信息表，相关视图迁移到了 `performance_schema`：

| MySQL 5.7 | MySQL 8.0 |
|-----------|-----------|
| `information_schema.INNODB_LOCK_WAITS` | `performance_schema.data_lock_waits` |
| `information_schema.INNODB_LOCKS` | `performance_schema.data_locks` |
| `information_schema.INNODB_TRX` | 保留不变 |

**MySQL 8.0 正确写法**：

```sql
SELECT 
    r.engine_transaction_id AS waiting_trx_id,
    r.thread_id AS waiting_thread,
    r.processlist_id AS waiting_process,
    b.engine_transaction_id AS blocking_trx_id,
    b.thread_id AS blocking_thread,
    b.processlist_id AS blocking_process
FROM performance_schema.data_lock_waits w
JOIN performance_schema.data_locks r 
    ON r.engine_lock_id = w.requesting_engine_lock_id
JOIN performance_schema.data_locks b 
    ON b.engine_lock_id = w.blocking_engine_lock_id;
```

### Step 4：查看阻塞线程在做什么

```sql
SELECT ID, USER, HOST, DB, COMMAND, TIME, STATE, INFO 
FROM information_schema.PROCESSLIST 
WHERE ID = <blocking_thread_id>;
```

判断依据：
- 如果是正常业务操作且即将完成 → 可等待
- 如果是卡死、重复、异常的 SQL → 直接杀掉

---

## 四、解决方案

### 应急处理：杀掉阻塞事务

```sql
KILL <blocking_thread_id>;
```

杀掉后：
- 该事务回滚，释放所有持有的锁
- 被阻塞的删除操作即可正常执行

### 验证

```sql
-- 确认该事务已消失
SELECT * FROM information_schema.INNODB_TRX 
WHERE trx_mysql_thread_id = <blocking_thread_id>;

-- 确认无锁等待
SELECT * FROM performance_schema.data_lock_waits;
```

---

## 五、根因分析与预防措施

### 常见根因

| 场景 | 说明 |
|------|------|
| **未提交事务** | 应用代码开启事务后，因异常或逻辑漏洞未执行 `commit/rollback` |
| **长事务** | 批量处理、报表统计等操作在一个事务中执行过久 |
| **连接池配置** | `autocommit=false` 但代码未手动管理事务边界 |
| **子表级联** | 主表删除时检查外键，子表被其他事务锁定 |

### 预防措施

1. **代码层面**
   - 确保事务边界清晰，使用 `try-finally` 或框架事务管理
   - 避免在事务中调用外部 HTTP/RPC 接口
   - 批量操作拆分为小事务，单事务控制在千行以内

2. **监控层面**
   - 部署长事务告警：监控 `INNODB_TRX` 中 `trx_idle_seconds > 60` 的事务
   - 对核心表操作增加慢事务巡检

3. **数据库层面**
   - 合理设置 `innodb_lock_wait_timeout`（默认 50 s，可根据业务调整）
   - 评估外键必要性，必要时用应用层保证一致性，减少级联锁

4. **排查工具包**
   - MySQL 5.7 与 8.0 的锁查询 SQL 不同，需要注意

---

## 六、总结

| 要点         | 内容                                                   |
| ---------- | ---------------------------------------------------- |
| **错误本质**   | `Lock wait timeout` = 锁竞争，不是数据量大                     |
| **排查核心**   | `INNODB_TRX` 找长事务 → 确认阻塞关系 → 杀掉或等待                   |
| **8.0 注意** | 锁信息在 `performance_schema.data_lock_waits/data_locks` |
| **根治关键**   | 消灭长事务，确保事务及时提交                                       |
