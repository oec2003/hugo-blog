---
title: MySQL高可用-MGR运维常见问题和注意事项
date: 2025-08-13T09:45:00+08:00
categories: [技术]
tags: [MGR,MySQL]
---
MySQL 的高可用可以选择 MGR 方案，部署 MGR 很简单，可以参考《MySQL高可用-使用Docker部署MGR》，但在运行过程中，如果出现问题，如何快速解决？需要持续学习和实践。

<!-- more -->

下面我以实际用到的和我搜集到的一些资料来说说 MGR 在运维过程中的常见问题和注意事项。

## 部署前注意事项

### 硬件和环境要求

1、网络要求

- 低延迟网络：MGR 对网络延迟敏感，建议延迟 < 5ms 。因为 MGR 基于 Paxos 变种的共识算法，每提交一次事务至少跨网两次（prepare>ack>commit）。
- 稳定带宽：确保有足够的带宽支持数据同步，建议 ≥ 1Gbps 。全量 recovery、大事务或 DDL 时会产生突发流量，带宽不足会导致 flow-control 触发，集群整体降速

2、服务器配置

- CPU：建议多核 CPU，至少4核以上
- 内存：充足内存，建议 ≥ 16GB
- 存储：使用 SSD 存储，确保足够 IOPS，考虑使用 RAID 10 而非 RAID 5/6，以获得更好的写性能
- 时钟同步：所有节点必须时钟同步（NTP）。MGR 的 GTID、view_change 事件都带时间戳，时间漂移会导致 “member expel” 误判。误判会导致节点是正常的，但会被踢出去。
- 分离数据和日志：将二进制日志和数据文件放在不同的物理存储上，参数大致如下：

```bash
datadir          = /data/mysql
log_bin          = /binlog/mysql-bin
binlog_cache_size           = 1M     
sync_binlog                 = 1
innodb_flush_log_at_trx_commit = 1
```

### 操作系统优化

1、文件描述符限制

```bash
# 文件描述符限制
echo "mysql soft nofile 65536" >> /etc/security/limits.conf
echo "mysql hard nofile 65536" >> /etc/security/limits.conf
```

MGR + InnoDB 打开的文件数 = 表数量 × 分区 × 3（ibd、frm、ibtmp）+ binlog + relay log。文件描述限制如果比较小，操作系统层面的文件描述符（fd）耗尽，后果是 mysqld 再想去 open() 任何文件（包括新的 ibd、binlog、relay-log、tmp-file、socket 等）时都会得到 EMFILE，导致各种莫名奇妙的错误。

可以使用下面语句进行检查：

```bash
ulimit -n            # 当前会话
cat /proc/$(pidof mysqld)/limits | grep files
```

我在 CentOS 服务器上执行 ulimit -n 得到的结果是 1024 ，但在 MySQL 容器中的结果是 1048676 。

2、内核参数调优

```bash
# 内核参数调优
echo "net.core.rmem_max = 134217728" >> /etc/sysctl.conf
echo "net.core.wmem_max = 134217728" >> /etc/sysctl.conf
sysctl -p
```

Linux 默认的 socket 缓冲区只有 128 KB，跨机房或云环境突发流量会触发 TCP 丢包重传，将该参数调大可降低重传率，提高吞吐。

可以通过 `sysctl net.core.rmem_max net.core.wmem_max` 进行检查。

3、内存优化

```bash
# 内存优化
SET GLOBAL innodb_buffer_pool_size = 32*1024*1024*1024;

# 注释掉 /etc/fstab 里的 swap 行
sed -i '/swap/s/^/#/' /etc/fstab
```

- 确保 `innodb_buffer_pool_size` 设置合理，通常为服务器内存的 50-75% 
- 确保系统不会使用交换空间，否则可能导致严重的性能下降

## 监控

### 查看集成成员

```sql
SELECT
    MEMBER_ID       AS node_uuid,
    MEMBER_HOST     AS host,
    MEMBER_PORT     AS port,
    MEMBER_STATE    AS state,          -- ONLINE / RECOVERING / ERROR / OFFLINE
    MEMBER_ROLE     AS role            -- PRIMARY / SECONDARY
FROM performance_schema.replication_group_members
ORDER BY MEMBER_HOST;
```

- state ≠ ONLINE：立刻报警  
- role = PRIMARY：表示为主库

### 复制延迟/事务堆积（只看当前节点）

```sql
SELECT
    MEMBER_ID                                 AS my_uuid,
    COUNT_TRANSACTIONS_IN_QUEUE               AS queue_txn,   -- >0 表示延迟
    COUNT_TRANSACTIONS_REMOTE_IN_APPLIER_QUEUE AS relay_txn,  -- 未应用完的 relay log 事务
    TRANSACTIONS_COMMITTED_ALL_MEMBERS        AS cluster_lsn, -- 全局已提交位点
    LAST_CONFLICT_FREE_TRANSACTION            AS last_no_conflict_txn
FROM performance_schema.replication_group_member_stats
WHERE MEMBER_ID = @@server_uuid;
```

根据经验进行判断：

- queue_txn > 1000 或持续增长：延迟告警  
- relay_txn > 1000 表示回放慢：需检查 applier 线程、IO 能力。

queue_txn 是其它节点已经提交、通过 Paxos 共识后广播给本节点，但本节点还没开始的事务数量。

正常情况下，事务来了立即被 applier 线程消耗，queue_txn 会瞬间降到 0。queue_txn 比较大说明有堵塞。

回放慢意思是当前节点的 applier 线程来不及重放远程事务，导致数据滞后。

applier 线程是什么呢 ?

在 MGR 里，可以把 applier 线程理解为真正把远程事务写进本地 InnoDB 的工人。检查 applier 线程、IO 能力其实就是确认：

- 工人够不够
- 工人有没有被磁盘 IO 卡住
- 工人有没有报错/死锁

先看有几个工人（applier 线程）

```sql
SELECT THREAD_ID, NAME, PROCESSLIST_STATE
FROM performance_schema.threads
WHERE NAME LIKE '%group_rpl%applier%';
```

如果 PROCESSLIST_STATE 长期是 Waiting for disk space 或 Waiting for table flush，说明被 IO 堵住。

看工人是不是在慢吞吞地写

```sql
SELECT 
    EVENT_NAME,
    SUM_TIMER_WAIT/1e9 AS total_seconds,
    MAX_TIMER_WAIT/1e9 AS max_seconds
FROM performance_schema.events_waits_summary_by_thread_by_event_name
JOIN performance_schema.threads USING(THREAD_ID)
WHERE NAME LIKE '%applier%'
  AND EVENT_NAME LIKE '%io%file%';
```

total_seconds 很大说明 applier 线程在磁盘 IO 上耗掉了大量时间。

看工人有没有报错

```sql
SELECT
    WORKER_ID,
    LAST_ERROR_NUMBER,
    LAST_ERROR_MESSAGE,
    SERVICE_STATE          -- 显示线程是 ON / OFF
FROM performance_schema.replication_applier_status_by_worker
WHERE LAST_ERROR_NUMBER <> 0;
```

只要这条 SQL 返回了任何一行，就说明至少有一个 applier 线程曾经或正在报错，需要立即处理。

## 常见故障及排查

### 脑裂问题

正常情况下同一时间只能有一个节点是主节点，由于网络分区、参数配置等原因导致出现多个主节点,这就是脑裂。

#### 症状识别

```sql
-- 检查是否存在多个PRIMARY
SELECT MEMBER_HOST, MEMBER_STATE, MEMBER_ROLE 
FROM performance_schema.replication_group_members 
WHERE MEMBER_ROLE = 'PRIMARY';
```

在一次网络分区后，节点可能会分成两派：

- 多数派：仍然能够凑齐 >50 % 组内成员的那一边。例如 5 节点集群，有 3 台还是 ONLINE 状态，这一边就是多数派。只有多数派才能继续对外提供写服务，并且它们的投票结果才会被 MGR 认可。
- 少数派：剩下的 ≤50 % 节点。这一侧因为凑不够“法定人数”，自动变为只读或离线，不再接受写请求。

#### 解决方案

1、立即隔离写流量，把应用 VIP、proxy、DNS 指向全部下线，避免继续写。

2、快速定位合法主节点，找到拥有最新 GTID 集合且处于多数派的节点：

```sql
SELECT @@global.gtid_executed;
```

- 在多数派中所有 ONLINE 节点上比较，选出 GTID 最大的那一个
- 如果两边 GTID 相同，就保留原 PRIMARY；如果不同，以多数派里最新的为准。

3、多数派中的节点什么都不用做，不需要重启，不需要 bootstrap，保持 ONLINE 即可。

4、处理少数派节点，对节点进行下面操作：

```sql
STOP GROUP_REPLICATION;
RESET SLAVE ALL;          -- 清掉旧的通道
SET GLOBAL gtid_purged = '';  -- 如果确定这些节点落后很多
START GROUP_REPLICATION;  -- 让它重新加入并自动追赶
```

- SET GLOBAL gtid_purged = '' 需要非常谨慎使用。这会清除节点的 GTID 执行历史，只有在确定节点数据已严重落后且准备重新同步全部数据时才应使用。在大多数情况下，不建议这样做，因为这可能导致数据丢失。更安全的做法是保留 GTID 历史，让节点基于现有数据追赶，或者如果数据差异太大，先备份后重建节点。

5、等所有节点回到 ONLINE 后，执行下面语句：

```sql
SELECT MEMBER_ID, MEMBER_STATE, MEMBER_ROLE
FROM performance_schema.replication_group_members;
```

确保只有 1 个 PRIMARY，且所有节点 GTID 完全一致。

### 节点无法加入集群

#### 常见原因

- GTID 不一致
- 网络连接问题
- 版本不兼容
- 配置错误

#### 排查步骤

1、检查 GTID 状态

```sql
SHOW GLOBAL VARIABLES LIKE 'gtid%';
SELECT @@GLOBAL.GTID_EXECUTED;
```

2、检查网络

```bash
# 在故障节点上，对任一 ONLINE 节点测试
telnet ONLINE_IP 33061   # group_replication_local_address 的端口
```

```sql
-- 在问题节点上测试
SELECT * FROM performance_schema.replication_connection_status;
```

- CHANNEL_NAME: `group_replication_recovery`（分布式恢复通道）和 `group_replication_applier`（正常应用通道）
- SERVICE_STATE：ON = 连接正常；OFF = 连接断开；CONNECTING = 正在握手/重连。
- LAST_ERROR_NUMBER / LAST_ERROR_MESSAGE：最近一次的 MySQL 错误号与文字描述。非 0 表示有问题。
- RECEIVED_TRANSACTION_SET：当前节点已经从集群收到的 GTID 集合，可与 `@@global.gtid_executed` 对比判断落后多少。
- COUNT_RECEIVED_HEARTBEATS：心跳计数，持续增加说明网络通；长时间不动可能丢包。
- LAST_HEARTBEAT_TIMESTAMP：最后心跳时间，离当前时间越近越健康。

3、检查错误日志

```sql
SHOW GLOBAL VARIABLES LIKE 'log_error';
```

#### 解决方案

修复问题也需要分场景：

1、问题节点 GTID 落后，直接 `START GROUP_REPLICATION;` 即可自动追平，无需 RESET。

2、问题节点 GTID 超前，不执行 RESET MASTER ，而是把多出来的事务导出、在主库重放、再让节点重新加入。

3、问题节点 GTID 分叉，备份本节点、做差异校验、选择保留哪份数据。

4、GTID 为空，用克隆插件或全量备份 + CHANGE REPLICATION SOURCE 重建数据，再启动 MGR，不要手工 `SET GTID_PURGED` 。

怎么判断 GTID 是否落后还是超前？

1、在任意一个正常的 ONLINE 节点查看集群最新 GTID

```sql
SELECT @@GLOBAL.GTID_EXECUTED;
-- 结果：aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:1-5
```

2、在故障节点查看 GTID

```sql
SELECT @@GLOBAL.GTID_EXECUTED;
-- 结果：aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:1-3  表示落后
-- 结果：aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:1-7  表示超前
```

