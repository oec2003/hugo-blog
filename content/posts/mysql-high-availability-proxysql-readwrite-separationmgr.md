---
title: MySQL高可用：ProxySQL读写分离+MGR
date: 2025-09-03T16:46:00+08:00
categories: [技术]
tags: [MySQL,ProxySQL,MGR]
---
MGR 解决了高可用的问题，但如果数据库访问量大，特别是读多写少的场景，就需要读写分离架构了了，在 MGR 的基础上，前面加上 ProxSQL 就可以实现读写分离。

<!-- more -->

![](https://img.fwhyy.com/2025/202509030651178.webp)

- 应用程序只和 ProxySQL 打交道
- ProxySQL 做为应用和 MGR 集群中间的一个桥梁，让应用对 MGR 的变化没有感知

## 组件说明

### MGR

- mysql-master: 主节点 (Primary)，处理写操作
- mysql-slave-1: 从节点 (Secondary)，处理读操作
- mysql-slave-2: 从节点 (Secondary)，处理读操作
- 配置为单主模式 (Single-Primary Mode)
- 实现自动故障转移和数据同步

### ProxySQL

- 端口 6033: MySQL 协议接口，应用连接端口
- 端口 6032: 管理接口，用于配置和监控
- 端口 6080: Web 管理界面 (可选)
- 提供读写分离、连接池、查询路由功能，可以对 mysql 的每个节点进行健康检查，进行故障转移，发现主节点出现故障，会将新的强求转移到新的主

## ProxySQL 安装和配置

在《MySQL高可用-使用Docker部署MGR》中介绍了 MGR 的安装部署，在此基础之上继续来安装 ProxySQL。

1、修改 docker-compose.yml 文件，添加 proxysql 节点。

```yml
proxysql:
   image: proxysql/proxysql:2.6.1
   container_name: proxysql
   hostname: proxysql
   volumes:
     - proxysql-data:/var/lib/proxysql
     - ./proxysql-config/proxysql.cnf:/etc/proxysql.cnf
     - ./proxysql-init-scripts:/etc/proxysql
   ports:
     - "6033:6033"
     - "6032:6032"
   networks:
     - mysql-mgr-network
   depends_on:
     - mysql-master
     - mysql-slave-1
     - mysql-slave-2
   healthcheck:
     test: ["CMD", "mysql", "-h", "127.0.0.1", "-P", "6032", "-u", "admin", "-padmin", "-e", "SELECT 1"]
     interval: 10s
     timeout: 5s
     retries: 5
```

- /proxysql-config/proxysql.cnf：proxysql 的配置文件
- /proxysql-config/proxysql.cnf：proxysql 初始化脚本所在的目录，可以直接配置为 ./proxysql-init-scripts:/docker-entrypoint-initdb.d ，则会在容器启动时执行。上面是将目录中的文件映射到容器内部，后续需要手动执行。

2、volumes 中映射的文件和目录内容，点击查看原文查看。

3、执行下面命令进行 proxysql 的初始化。

```shell
docker exec -it proxysql bash
mysql -h127.0.0.1 -P6032 -uradmin -pradmin < /etc/proxysql/init-proxysql.sql
```
![](https://img.fwhyy.com/2025/202509030651027.webp)

4、配置 ProxySQL MGR 监控，依然是在 proxysql 容器内，执行下面命令：

```shell
mysql -h127.0.0.1 -P6032 -uradmin -pradmin < /etc/proxysql/setup-mgr-monitoring.sql
```

## 检查

1、检查 MGR 集群的状态。

```shell
docker exec mysql-master mysql -uroot -prootpassword -e "SELECT member_id, member_host, member_port, member_state, member_role FROM performance_schema.replication_group_members;"
```

![](https://img.fwhyy.com/2025/202509030651656.webp)

2、检查 ProxySQL 的状态。

```shell
docker exec proxysql mysql -h127.0.0.1 -P6032 -uradmin -pradmin -e "SELECT hostgroup_id, hostname, port, status, weight FROM mysql_servers ORDER BY hostgroup_id, hostname;"
```

![](https://img.fwhyy.com/2025/202509030652835.webp)

3、检查 ProxySQL 连接池状态。

```shell
docker exec proxysql mysql -h127.0.0.1 -P6032 -uradmin -pradmin -e "SELECT * FROM stats_mysql_connection_pool ORDER BY hostgroup, srv_host;"
```

![](https://img.fwhyy.com/2025/202509030652304.webp)

4、通过 ProxySQL 创建测试数据库和表。

```shell
docker exec proxysql mysql -h127.0.0.1 -P6033 -uroot -prootpassword -e "
CREATE DATABASE IF NOT EXISTS testdb;
USE testdb;
CREATE TABLE IF NOT EXISTS test_table (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    operation_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO test_table (name, operation_type) VALUES ('Test Record 1', 'INSERT via ProxySQL');
INSERT INTO test_table (name, operation_type) VALUES ('Test Record 2', 'INSERT via ProxySQL');"

```

也可以使用 navicat 等客户端工具连接进行测试，连接配置如下：

![](https://img.fwhyy.com/2025/202509030652783.webp)

5、测试读操作路由。

```shell
docker exec proxysql mysql -h127.0.0.1 -P6033 -uroot -prootpassword -e "USE testdb; SELECT * FROM test_table;"
```

使用下面 sql 语句查询连接池使用情况：

```sql
docker exec proxysql mysql -h127.0.0.1 -P6032 -uradmin -pradmin -e "
    SELECT 
        CASE 
            WHEN hostgroup = 0 THEN 'WRITE'
            WHEN hostgroup = 1 THEN 'READ'
            ELSE 'OTHER'
        END as 'Type',
        srv_host as 'Server',
        ConnUsed as 'Used',
        ConnFree as 'Free',
        Queries as 'Queries'
    FROM stats_mysql_connection_pool 
    WHERE (ConnUsed + ConnFree) > 0
    ORDER BY hostgroup, srv_host;"
```

使用下面 sql 语句检查。

```sql
docker exec proxysql mysql -h127.0.0.1 -P6032 -uradmin -pradmin -e "
SELECT rule_id, hits FROM stats_mysql_query_rules WHERE hits > 0;"
```

## ProxySQL 管理

```sql
# 连接到 ProxySQL 管理接口（先进入 proxysql 容器再执行）
mysql -h127.0.0.1 -P6032 -uradmin -pradmin

# 查看服务器状态
SELECT * FROM mysql_servers;

# 查看连接池状态  
SELECT * FROM stats_mysql_connection_pool;

# 查看查询统计
SELECT * FROM stats_mysql_query_rules;

# 重新加载配置
LOAD MYSQL SERVERS TO RUNTIME;
SAVE MYSQL SERVERS TO DISK;
```

## 常见问题

### ProxySQL 连接问题

```shell
docker exec proxysql mysql -h127.0.0.1 -P6032 -uradmin -pradmin -e "
SELECT * FROM monitor.mysql_server_connect_log ORDER BY time_start_us DESC LIMIT 10;"
```

connect_error 字段出现 `Access denied for user 'monitor'@'%'` 或 ` Can't connect to MySQL server ` 说明连接有问题。

- `Access denied`: 监控用户权限问题
- `Can't connect`: 网络连接问题或服务器宕机
- `timeout`: 连接超时，可能是网络延迟或服务器负载过高

通过检查用户配置的方式来进行排查。

```shell
docker exec proxysql mysql -h127.0.0.1 -P6032 -uradmin -pradmin -e "
SELECT * FROM mysql_users;"
```

- `active = 0`: 用户被禁用
- `backend = 0`: 用户无法连接后端数据库
- `frontend = 0`: 用户无法从前端连接
- `max_connections = 0`: 用户连接数限制为0

### 读写分离问题

1、检查查询路由规则：

```shell
docker exec proxysql mysql -h127.0.0.1 -P6032 -uradmin -pradmin -e "
SELECT * FROM mysql_query_rules WHERE active=1;"
```

异常情况分析:

- 没有规则: `Empty set` - 路由规则未配置
- `active = 0`: 规则被禁用
- `apply = 0`: 规则不会被应用
- `destination_hostgroup` 错误: 路由到错误的主机组

2、查看查询执行计划：

```shell
docker exec proxysql mysql -h127.0.0.1 -P6032 -uradmin -pradmin -e "
SELECT rule_id, hits FROM stats_mysql_query_rules WHERE hits > 0;"
```

![](https://img.fwhyy.com/2025/202509030652974.webp)

- SELECT 命中 42 次 (路由到读节点)
- INSERT/UPDATE/DELETE 命中 5 次

如果没有数据统计或者全部命中读节点说明有问题。