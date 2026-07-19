---
title: MySQL高可用-使用Docker部署MGR
date: 2025-07-22T21:57:00+08:00
categories: [技术]
tags: [MySQL,MGR]
---
MySql 的高可用方案很多，有 MHA、MGR、MySQL InnoDB Cluster 等。起初想学习下 MHA，了解后发现 MHA 在 Github 上的仓库已经没有更新了。不过 MHA 的兼容性比较好，有老版本的 MySQL 需要做高可用，还是值得一试的。

<!-- more -->

本文介绍下 MGR 的部署。

MGR (MySQL Group Replication) 是 MySQL 5.7.17 提出的，既可以很好的保证数据一致性又可以自动切换，具备故障检测功能、支持多节点写入。是以插件的形式提供，可以灵活部署。

MySQL MGR 集群是多个 MysQL Server 节点共同组成的分布式集群，每个 Server 都有完整的副本，它是基于 ROW 格式的二进制日志文件和 GTID 特性来实现的。

## MGR 的优点

1、强一致性：基于原生复制及 Paxos 协议的组复制技术（以插件形式提供），确保数据的严格一致性。

2、高容错性：在少数节点故障时仍可正常运行，具备自动故障检测机制。节点间资源冲突采用无锁设计（如先到者优先）处理，避免错误。

3、高扩展性：支持节点动态自动加入与移除。新节点加入后自动同步数据至一致状态；节点移除后，集群自动更新并维护组配置信息。

4、高灵活性：支持单主模式与多主模式。单主模式下自动选举主节点，所有写操作路由至主节点；多主模式下，所有节点均可并发处理写操作。

## MGR 的一些限制

1、仅支持 InnoDB 表，并旦每个表一定要有一个主键。

2、必须打开 GTID 特性，二进制日志格式必须设置为 ROW 。

3、MGR 不支持大事务。

4、仅支持 IPv4 网络，组大小限制为最少3个节点、最多9个节点。

5、不支持外键。

6、二进制日志不支持 Binlog Event Checksum 。

7、所有节点 server_id 和 server_uuid 需唯一。

## 部署前准备

- 为了方便，mysql 的主节点和从节点在一台虚拟机中进行测试
- docker 版本：20.10.0
- docker compose 版本：2.26.2
- mysql 版本：8.0.39

## 开始部署

1、采用 docker-compose 的方式进行部署，部署目录 mysql-mgr 的文件结构如下图：

![](https://img.fwhyy.com/2025/202507221805817.webp)

- docker-compose.yml：容器编排文件，配置一个主和两个从的 mysql 节点。
- mysql-config：此目录中是主和从的 mysql 配置文件
- mysql-init-srcipts：此目录中是 mysql 启动时需要创建复制账号以及安装 mgr 插件
- start-mgr.sh：三个 mysql 节点启动后，执行该文件进行 mgr 集群的启动。

2、将 mysql-mgr 拷贝到服务器，进入 mysql-mgr 目录执行 `docker-compose up -d` 。

3、等三个 mysql 节点的状态正常，执行 `./start-mgr.sh` ,成功执行如下图所示。

![](https://img.fwhyy.com/2025/202507221806726.webp)

4、进入任意一个 mysql 中，执行 `SELECT * FROM performance_schema.replication_group_members;` ,三个节点的 MEMBER_STATE 为 ONLINE 说明部署成功。

![](https://img.fwhyy.com/2025/202507221806010.webp)

5、现在可以连上主节点，进行库表和数据的创建，来验证是否正常同步到从节点。

## 关键点说明

### docker-compose 配置

docker-compose.yml 文件定义了三个 MySQL 节点，分别是一个主节点和两个从节点：

```yml
version: '3.8'

services:
  mysql-master:
    image: mysql:8.0.39
    container_name: mysql-master
    hostname: mysql-master
    command: ["mysqld"]
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: mydb
    volumes:
      - mysql-master-data:/var/lib/mysql
      - ./mysql-init-scripts:/docker-entrypoint-initdb.d
      - ./mysql-config/mysql-master.cnf:/etc/mysql/conf.d/mysql-master.cnf
    ports:
      - "3306:3306"
      - "33061:33061"
    networks:
      - mysql-mgr-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p$$MYSQL_ROOT_PASSWORD"]
      interval: 10s
      timeout: 5s
      retries: 5

  mysql-slave-1:
    image: mysql:8.0.39
    container_name: mysql-slave-1
    hostname: mysql-slave-1
    command: ["mysqld"]
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: mydb
    volumes:
      - mysql-slave-1-data:/var/lib/mysql
      - ./mysql-init-scripts:/docker-entrypoint-initdb.d
      - ./mysql-config/mysql-slave-1.cnf:/etc/mysql/conf.d/mysql-slave-1.cnf
    ports:
      - "3307:3306"
      - "33062:33061"
    networks:
      - mysql-mgr-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p$$MYSQL_ROOT_PASSWORD"]
      interval: 10s
      timeout: 5s
      retries: 5
    depends_on:
      - mysql-master

  mysql-slave-2:
    image: mysql:8.0.39
    container_name: mysql-slave-2
    hostname: mysql-slave-2
    command: ["mysqld"]
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: mydb
    volumes:
      - mysql-slave-2-data:/var/lib/mysql
      - ./mysql-init-scripts:/docker-entrypoint-initdb.d
      - ./mysql-config/mysql-slave-2.cnf:/etc/mysql/conf.d/mysql-slave-2.cnf
    ports:
      - "3308:3306"
      - "33063:33061"
    networks:
      - mysql-mgr-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p$$MYSQL_ROOT_PASSWORD"]
      interval: 10s
      timeout: 5s
      retries: 5
    depends_on:
      - mysql-master

networks:
  mysql-mgr-network:
    driver: bridge

volumes:
  mysql-master-data:
  mysql-slave-1-data:
  mysql-slave-2-data:
```

1、卷挂载，以主节点为例：

- 数据持久化：`mysql-master-data:/var/lib/mysql`
- 初始化脚本：`./mysql-init-scripts:/docker-entrypoint-initdb.d`
- 配置文件：`./mysql-config/mysql-master.cnf:/etc/mysql/conf.d/mysql-master.cnf`

2、端口映射：

- MySQL 节点端口：`3306:3306`（主节点），`3307:3306`（从节点1），`3308:3306`（从节点2）
- MGR 通信端口：`33061:33061`（主节点），`33062:33061`（从节点1），`33063:33061`（从节点2）

3、网络配置

- 所有节点都连接到同一个网络 `mysql-mgr-network`，确保节点间可以相互通信

### mysql 的配置文件

```shell
[mysqld]
server-id=1
log-bin=mysql-bin-1.log
binlog-format=ROW
gtid-mode=ON
enforce-gtid-consistency=ON
log-slave-updates=ON
binlog-checksum=NONE
master-info-repository=TABLE
relay-log-info-repository=TABLE
transaction-write-set-extraction=XXHASH64
```

- server-id：每个节点的必须唯一
- binglog-format：行级 binlog，MGR 硬性要求 ROW 格式
- gtid-mode：启用 GTID（全局事务标识），MGR 内部完全基于 GTID 做事务认证和冲突检测。
- enforce-gtid-consistency：禁止任何会破坏 GTID 一致性的语句（如 `CREATE TEMPORARY TABLE` 与 `CREATE TABLE ... SELECT`），MGR 强制要求打开，否则无法启动组复制。
- binlog-checksum：MySQL 8.0.20 之前的 MGR 要求关闭 binlog 校验和（因为早期组通信层不支持），8.0.20 及以后可以改为 `CRC32`，保持默认即可，但旧版本必须显式设置为 `NONE`。

这些参数共同确保节点开启 binlog、使用 ROW + GTID、写入复制元数据到 InnoDB 表，并为 MGR 提供事务写集合，从而满足组复制的所有前置条件。

除此之外，还需要进行 MGR 的组复制配置，如下：

``` shell
loose-group-replication-group-name=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
loose-group-replication-start-on-boot=OFF
loose-group-replication-local-address=mysql-master:33061
loose-group-replication-group-seeds=mysql-master:33061,mysql-slave-1:33061,mysql-slave-2:33061
loose-group-replication-bootstrap-group=OFF
loose-group-replication-single-primary-mode=ON
loose-group-replication-enforce-update-everywhere-checks=OFF
```

- 给整个 MGR 组起一个全局唯一的名字（UUID 格式），三个节点相同
- MySQL 实例启动时不自动启动 Group Replication 插件，这个参数如果设置为 OFF，当坏掉的节点修复后，不会自动加入集群。
- 本节点在组内通信时使用的本地监听地址（IP 或主机名:端口）
- 种子列表，告诉当前节点“初次加入组时可以去找谁”。只要列表中的任意一个节点在线，新节点就能拿到完整的成员信息并加入组。通常把所有成员都写上，方便任何顺序启动。
- 只在第一个节点第一次启动时设为 ON，用来创建组；之后必须立即改回 OFF 并重启，否则会出现“脑裂”或成员冲突。
- 打开单主模式（Single-Primary），组内只有一台节点可写（primary），其余为只读（secondaries），主节点故障时自动重新选举。
- 在多主模式下才生效；单主模式可保持 OFF。

### 初始化脚本

```sql
-- 01-create-replication-user.sql
-- 创建复制用户
CREATE USER 'repl'@'%' IDENTIFIED WITH mysql_native_password BY 'replpass';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
GRANT BACKUP_ADMIN ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;

reset master;
```

上面的脚本有两个点需要注意：

- 1、WITH mysql_native_password 必须要加上
- 2、最后的 reset master 不要忘记了

```sql
-- 02-install-plugin.sql
INSTALL PLUGIN group_replication SONAME 'group_replication.so';
```

这些脚本在容器首次启动时自动执行：

- 创建具有复制权限的用户 repl
- 安装 Group Replication 插件

### 启动 MGR 集群

启动 MGR 集群的过程由 `start-mgr.sh` 脚本完成：

```bash
#!/bin/bash

# 等待所有MySQL实例启动完成
sleep 30

# 在主节点上引导组并启动组复制
docker exec mysql-master mysql -uroot -prootpassword -e "
  CHANGE MASTER TO MASTER_USER='repl', MASTER_PASSWORD='replpass' FOR CHANNEL 'group_replication_recovery';
  SET GLOBAL group_replication_bootstrap_group=ON;
  START GROUP_REPLICATION;
  SET GLOBAL group_replication_bootstrap_group=OFF;
  SELECT * FROM performance_schema.replication_group_members;"

# 等待主节点组复制启动完成
sleep 20

# 在从节点上启动组复制
docker exec mysql-slave-1 mysql -uroot -prootpassword -e "
  CHANGE MASTER TO MASTER_USER='repl', MASTER_PASSWORD='replpass' FOR CHANNEL 'group_replication_recovery';
  START GROUP_REPLICATION;
  SELECT * FROM performance_schema.replication_group_members;"

docker exec mysql-slave-2 mysql -uroot -prootpassword -e "
  CHANGE MASTER TO MASTER_USER='repl', MASTER_PASSWORD='replpass' FOR CHANNEL 'group_replication_recovery';
  START GROUP_REPLICATION;
  SELECT * FROM performance_schema.replication_group_members;"

# 检查MGR状态
sleep 5
echo "检查MGR集群状态:"
docker exec mysql-master mysql -uroot -prootpassword -e "SELECT * FROM performance_schema.replication_group_members;"

```

1、主节点

- 配置复制恢复通道的用户名和密码
- 设置 group_replication_bootstrap_group=ON 引导组
- 启动组复制 START GROUP_REPLICATION
- 关闭引导模式 group_replication_bootstrap_group=OFF
- 只有第一个节点需要引导组，其他节点只需加入

2、从节点

- 配置相同的复制恢复通道
- 直接启动组复制，自动加入已存在的组

## 常见问题

遇到问题很正常，出现任何错误优先查看 mysql 节点的日志，根据错误信息让 AI 分析并给出解决方案，通常都是可以解决的。

我部署过程中就遇到执行 `./start-mgr.sh` 后，查询状态如下图：

![](https://img.fwhyy.com/2025/202507221806174.webp)

只有主节点是 ONLINE。我对主从节尝试手动停止和启用组复制后解决。

```sql
STOP GROUP_REPLICATION; 
START GROUP_REPLICATION;
```

在学习过程中出现问题其实是好事，可以从解决问题的过程中去提高。之前碰到有同事遇到问题就重置服务器，其实是在走捷径，能力得不到提升，而且不是所有的环境都能重置的。搞懂所有细枝末节才能以不变应万变。

希望本文对您有所帮助！

