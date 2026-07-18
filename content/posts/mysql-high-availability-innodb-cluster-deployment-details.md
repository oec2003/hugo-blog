---
title: MySQL高可用：InnoDB Cluster 部署详解
date: 2025-09-15T09:07:00+08:00
categories: [技术]
tags: [MySQL,高可用,Cluster]
---
最近公众号有人留言：为啥使用 ProxySQL 而不使用 InnoDB Cluster ？

<!-- more -->

其实使用什么方案，根据实际情况进行权衡利弊即可，如果先部署了 MGR ，想在此基础之上完善高可用，添加 ProxySQL 比较方便。如果新部署一个高可用环境，直接使用 InnoDB Cluster 也可以，InnoDB Cluster 也是依赖 MGR 。

下面将从零开始，来讲解怎么通过 Docker Compose 来部署 MySQL InnoDB Cluster，让你能够快速搭建一套完整的高可用数据库系统。

## 什么是 MySQL InnoDB Cluster

### 核心概念

MySQL InnoDB Cluster是 MySQL 官方提供的高可用解决方案，它基于以下三个核心组件：

- MySQL Group Replication：提供数据复制和故障检测，这个就是前面文章中提到的 MGR
- MySQL Router：提供透明的路由和负载均衡
- MySQL Shell：提供集群管理和监控功能

### 架构优势

- 自动故障检测和转移
- 强一致性数据复制
- 透明的读写分离
- 简化的管理操作

## 架构图

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202509150900083.webp)

## 开始部署

为了测试方便，在一台服务器上使用 docker compose 部署多个服务节点。

### 启动 mysql 节点

1、在服务器上创建一个目录 mysql-innodb-cluster ，目录中按照下图进行目录和文件的创建。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202509150901491.webp)

2、docker-compose.yml 文件内容如下：

```yml
version: '3.8'

services:
  mysql1:
    image: mysql:8.0.39
    container_name: mysql1
    hostname: mysql1
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpass123
      TZ: Asia/Shanghai
    networks:
      - mysql-cluster-net
    volumes:
      - ./node1/conf:/etc/mysql/conf.d:ro
      - ./node1/data:/var/lib/mysql
      - ./node1/log:/var/log/mysql
    ports:
      - "3310:3306"

  mysql2:
    image: mysql:8.0.39
    container_name: mysql2
    hostname: mysql2
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpass123
      TZ: Asia/Shanghai
    networks:
      - mysql-cluster-net
    volumes:
      - ./node2/conf:/etc/mysql/conf.d:ro
      - ./node2/data:/var/lib/mysql
      - ./node2/log:/var/log/mysql
    ports:
      - "3311:3306"

  mysql3:
    image: mysql:8.0.39
    container_name: mysql3
    hostname: mysql3
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpass123
      TZ: Asia/Shanghai
    networks:
      - mysql-cluster-net
    volumes:
      - ./node3/conf:/etc/mysql/conf.d:ro
      - ./node3/data:/var/lib/mysql
      - ./node3/log:/var/log/mysql
    ports:
      - "3312:3306"

  mysql-router:
    image: mysql/mysql-router:8.0
    container_name: mysql-router
    restart: unless-stopped
    depends_on:
      - mysql1
      - mysql2
      - mysql3
    networks:
      - mysql-cluster-net
    volumes:
      - ./router/data:/tmp/mysqlrouter
    ports:
      - "6446:6446" # 读写端口 (RW)
      - "6447:6447" # 只读端口 (RO)
      - "6448:6448" # 管理端口 (X Protocol RW)
      - "6449:6449" # 管理端口 (X Protocol RO)
    environment:                     
      MYSQL_HOST: mysql1
      MYSQL_PORT: 3306
      MYSQL_USER: clusteradmin
      MYSQL_PASSWORD: clusterpass123
      MYSQL_CREATE_ROUTER_USER: 0
      MYSQL_ROUTER_BOOTSTRAP_EXTRA_OPTIONS: >
        --conf-use-sockets
        --conf-bind-address 0.0.0.0
        --conf-base-port 6446
networks:
  mysql-cluster-net:
    driver: bridge
    name: mysql-cluster-net
```

router 节点说明：

- 检测 `/tmp/mysqlrouter/mysqlrouter.conf` 是否存在，如果不存在则执行  
`mysqlrouter --bootstrap clusteradmin@mysql1:3306 ... --directory /tmp/mysqlrouter` ，密码从 `MYSQL_PASSWORD` 变量读入，非交互（不用手动输入）。
- bootstrap 成功后，以后每次容器重启直接 `mysqlrouter -c /tmp/mysqlrouter/mysqlrouter.conf` 不再重新扫描集群，配置持久化。
- Router 根据集群实时角色，把 6446 流量转发到 PRIMARY，6447 转发到 SECONDARY，应用只需连固定端口即可。

3、mysql 节点 1 的配置文件 mysql1.cnf 内容如下：

```c
[mysqld]
# 网络和连接
bind-address = 0.0.0.0

# 复制基础
server_id = 1
log_bin = mysql-bin
binlog_format = ROW
enforce_gtid_consistency = ON
gtid_mode = ON

# Group Replication 特定配置
transaction_write_set_extraction = XXHASH64
loose-group_replication_group_name = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" # 请替换为一个有效的UUID，可使用 `uuidgen` 命令生成
loose-group_replication_start_on_boot = OFF
loose-group_replication_local_address = "mysql1:33061" # 内部组通信地址和端口，通常为 33061
loose-group_replication_group_seeds = "mysql1:33061, mysql2:33061, mysql3:33061"
loose-group_replication_single_primary_mode = ON # 单主模式
loose-group_replication_bootstrap_group = OFF # 切勿随意开启引导

#  Innodb Cluster 元数据存储
disabled_storage_engines = MyISAM,BLACKHOLE,FEDERATED,ARCHIVE

# 性能与可靠性
binlog_transaction_dependency_tracking = WRITESET
```

4、mysql 节点 2 的配置文件 mysql2.cnf 内容如下：

```c
[mysqld]
bind-address = 0.0.0.0
server_id = 2
log_bin = mysql-bin
binlog_format = ROW
enforce_gtid_consistency = ON
gtid_mode = ON
transaction_write_set_extraction = XXHASH64
loose-group_replication_group_name = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" # 必须与node1相同
loose-group_replication_start_on_boot = OFF
loose-group_replication_local_address = "mysql2:33061"
loose-group_replication_group_seeds = "mysql1:33061, mysql2:33061, mysql3:33061"
loose-group_replication_single_primary_mode = ON
loose-group_replication_bootstrap_group = OFF
disabled_storage_engines = MyISAM,BLACKHOLE,FEDERATED,ARCHIVE
binlog_transaction_dependency_tracking = WRITESET
```

5、mysql 节点 3 的配置文件 mysql3.cnf 内容如下：

```c
[mysqld]
bind-address = 0.0.0.0
server_id = 3
log_bin = mysql-bin
binlog_format = ROW
enforce_gtid_consistency = ON
gtid_mode = ON
transaction_write_set_extraction = XXHASH64
loose-group_replication_group_name = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" # 必须与node1相同
loose-group_replication_start_on_boot = OFF
loose-group_replication_local_address = "mysql3:33061"
loose-group_replication_group_seeds = "mysql1:33061, mysql2:33061, mysql3:33061"
loose-group_replication_single_primary_mode = ON
loose-group_replication_bootstrap_group = OFF
disabled_storage_engines = MyISAM,BLACKHOLE,FEDERATED,ARCHIVE
binlog_transaction_dependency_tracking = WRITESET
```

节点 3 内容与节点 2 类似，但 `server_id` 必须改为 `3`，`loose-group_replication_local_address` 改为 `mysql3:33061`。`loose-group_replication_group_name` 必须与其它节点相同。

关于配置文件中 mgr 相关的部分可以参考之前的文章《MySQL高可用-使用Docker部署MGR》。

6、执行下面的命令，先启动三个 mysql 节点。

```
docker-compose up -d mysql1 mysql2 mysql3
```

等三个 mysql 节点都启动成功后，再执行下面的操作。

### 添加集群管理账户

在三个 MySQL 节点上，都需要创建一个用于集群管理和 Router 引导的管理员用户（需要 `SYSTEM_VARIABLES_ADMIN`, `REPLICATION_SLAVE_ADMIN`, `GROUP_REPLICATION_ADMIN` 权限）。

先使用下面命令连接到节点 1 的 shell：

```shell
# 连接到 mysql1 容器并登录 MySQL
docker-compose exec mysql1 mysql -uroot -prootpass123
```

然后执行下面的语句进行 clusteradmin 账户的创建和权限设置：

```sql
CREATE USER IF NOT EXISTS 'clusteradmin'@'%' IDENTIFIED WITH mysql_native_password BY 'clusterpass123';
GRANT ALL PRIVILEGES ON *.* TO 'clusteradmin'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

在节点 2 和节点 3 上执行相同的操作。

### 使用 mysql shell 构建集群

配置和启动 InnoDB Cluster，可以使用 MySQL Shell (`mysqlsh`) 来创建集群。临时启动一个 MySQL Shell 容器。

```shell
docker run --rm -it --network=mysql-cluster-net mysql/mysql-server:8.0 mysqlsh
```

执行成后会进入到 MySQL JS 的 shell 界面，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202509150906284.webp)

在 shell 模式下逐步执行下面的代码：

```javascript
// 连接到第一个节点（将成为初始主节点）
\connect clusteradmin@mysql1:3306
// 提供密码：clusterpass123

// 检查实例配置是否符合集群要求
dba.checkInstanceConfiguration('clusteradmin@mysql1:3306');
dba.checkInstanceConfiguration('clusteradmin@mysql2:3306');
dba.checkInstanceConfiguration('clusteradmin@mysql3:3306');

// 创建集群，命名为 'myCluster'
var cluster = dba.createCluster('myCluster');

// 添加其他实例到集群中
cluster.addInstance('clusteradmin@mysql2:3306', {password: 'your_strong_clusteradmin_password', recoveryMethod: 'clone'}); // 使用 clone 方式进行恢复
cluster.addInstance('clusteradmin@mysql3:3306', {password: 'your_strong_clusteradmin_password', recoveryMethod: 'clone'});

// 检查集群状态
cluster.status();
```

节点成功添加到集群中如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202509150906048.webp)

最后查看集群状态：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202509150906467.webp)

输出应显示三个实例都是 `ONLINE`，其中一个角色是 `PRIMARY`，另外两个是 `SECONDARY`。

### 启动并配置 MySQL Router

执行下面命令启动 router 容器

```shell
docker-compose up -d mysql-router
```

router 启动成功的日志如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202509150907912.webp)

到这 MySQL InnoDB Cluster 已经部署完成，可以使用 Navicat 之类的工具进行连接进行测试：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202509150907280.webp)

使用 Navicat 时需要注意，SSL 中的使用 SSL 必须勾选。

## 最后

一开始想使用 AI 来生成所有的配置，尝试了很多次，没有能一次性成功的，根据日志中的错误信息让 AI 修改，越改越混乱。因为整个过程中我没有参与，给不出更多有价值的信息，最后放弃了让 AI 直接来操作。

从这个过程我体会到更好使用 AI 的方式应该是：

1、先让 AI 总结出部署 MySQL InnoDB Cluster 的关键步骤。

2、从这个步骤中了解到一些基本的原理，然后分步骤让 AI 搞定配置，实操的过程中也是分步骤进行，这样即便出现问题也比较容易排查。

3、手动一步一步去操作，有助于更好的理解和理清逻辑关系。

4、学习任何技术，我们自己懂的越多，就越能让 AI 发挥更大的能力。