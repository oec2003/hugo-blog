---
title: CentOS 7 安装 Greenplum6 （附 dotNET Core 示例）
date: 2021-04-12T08:05:00+08:00
categories: [技术]
tags: [CentOS7,Greenplum,数据库]
---

Mysql 在面对大数据量的时候，还是表现有些吃力，所以产品中需要扩展能支持海量数据的数据库，这里选择的数据库为 Greenplum6 ，Greenplum 底层使用的是开源数据库 PostgreSQL 。本文会介绍怎样在 CentOS 7 中安装 Greenplum6，并使用 dotNET Core 程序进行连接访问。

<!--more-->

## 环境

- CentOS：7.6
- Greenplum：6.15
- dotNET Core：3.1
- NpgSql：5.0.4

## 安装 Greenplum

1、执行命令 `vi /etc/selinux/config` 修改配置文件来禁用 SELinux ，如下图：

![iShot2022-02-02 06.11.08](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020611012.jpg)

修改配置文件后，需要重启服务器生效。

2、执行命令 `vi /etc/sysctl.conf` 修改 OS 参数，在配置文件最后累加下面内容：

```
# kernel.shmall = _PHYS_PAGES / 2 # See Note 1
kernel.shmall = 4000000000
# kernel.shmmax = kernel.shmall * PAGE_SIZE # See Note 1
kernel.shmmax = 500000000
kernel.shmmni = 4096
vm.overcommit_memory = 2
vm.overcommit_ratio = 95 # See Note 2
net.ipv4.ip_local_port_range = 10000 65535 # See Note 3
# kernel.sem = 500 1024000 200 4096
kernel.sysrq = 1
kernel.core_uses_pid = 1
kernel.msgmnb = 65536
kernel.msgmax = 65536
kernel.msgmni = 2048
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.tcp_max_syn_backlog = 4096
net.ipv4.conf.all.arp_filter = 1
net.core.netdev_max_backlog = 10000
net.core.rmem_max = 2097152
net.core.wmem_max = 2097152
vm.swappiness = 10
vm.zone_reclaim_mode = 0
vm.dirty_expire_centisecs = 500
vm.dirty_writeback_centisecs = 100
vm.dirty_background_ratio = 0 # See Note 5
vm.dirty_ratio = 0
vm.dirty_background_bytes = 1610612736
vm.dirty_bytes = 4294967296
net.ipv4.ip_forward = 0
net.ipv4.tcp_tw_recycle = 1
kernel.sem = 500 1024000 200 4096
```

修改配置文件后，执行 `sysctl -p` 使其生效。

3、执行命令  `vi /etc/security/limits.conf` 修改配置，内容如下：

```
* soft nofile 524288
* hard nofile 524288
* soft nproc 131072
* hard nproc 131072
```

4、执行命令 `vi /etc/security/limits.d/20-nproc.conf` 修改配置，内容如下：

```
* soft nofile 524288
* hard nofile 524288
* soft nproc 131072
* hard nproc 131072
```

修改完成后，重启系统使其生效。执行 `ulimit -u` 查看每个用户可用的最大进程数，如果返回值为 131072 说明正确。

5、执行下面的命令来设置预读块、I/O调度程序：

```
/sbin/blockdev --setra 16384 /dev/sda*
echo deadline > /sys/block/sda/queue/scheduler
echo deadline > /sys/block/sr0/queue/scheduler
```

6、修改配置文件 `/etc/systemd/logind.conf` ，将 `RemoveIPC` 设置为 `no` ，如下图：

![iShot2022-02-02 06.11.47](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020612364.jpg)

修改完后，执行命令 `service systemd-logind restart` 重启服务。

7、执行下面命令添加用户 gpadmin ：

```
groupadd gpadmin
useradd gpadmin -r -m -g gpadmin
passwd gpadmin # 修改gpadmin账户的密码
```

8、修改配置文件 `/etc/sudoers` ，允许 `gpadmin` 用户无密码使用 `sudo` 命令，添加内容如下图：

![iShot2022-02-02 06.12.15](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020612597.jpg)

```
gpadmin ALL=(ALL) NOPASSWD:ALL
```

9、安装 Greenplum

从 https://github.com/greenplum-db/gpdb/releases 下载对应的 rpm 文件， 如下图：

![iShot2022-02-02 06.12.44](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020612417.jpg)

在目录 `/usr/local` 目录中创建 `greenplum` 目录，将下载好的 rpm 文件复制到该目录中。

执行 `rpm -ivh /usr/local/greenplum/open-source-greenplum-db-6.15.0-rhel7-x86_64.rpm` 进行 Greenplum 6 的安装。执行命令时可能会出现下面的错误提示：

![iShot2022-02-02 06.13.20](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020613422.jpg)

原因是有些依赖项没有被安装，依次执行下面的命令进行依赖项的安装：

```
yum install -y apr
yum install -y apr-util
yum install -y bzip2
yum install -y krb5-devel
yum install -y libyaml
yum install -y perl
yum install -y rsync
yum install -y zip
yum install -y net-tools
yum install -y ibevent
```

依赖安装成功后，重新执行 `rpm -ivh /usr/local/greenplum/open-source-greenplum-db-6.15.0-rhel7-x86_64.rpm` 进行安装。成功安装后执行 `chown -R gpadmin:gpadmin /usr/local/greenplum-db*` 进行账户 gpadmin 的权限的设置。

10、执行命令 `hostnamectl set-hostname gpdb` 将主机名修改为 gpdb 。

11、修改 hosts 文件

执行 `vi /etc/hosts` 进行 hosts 文件的修改，如下图：

![iShot2022-02-02 06.13.49](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020614118.jpg)

11、设置 gpadmin 账户的 ssh 免密登录

首先执行命令 `su - gpadmin` 切换到 gpadmin 账户。

在 `/home/gpadmin` 目录中创建文件 all_hosts ，内容为上面修改的主机名 gpdb ，然后执行下面命令：

```
source /usr/local/greenplum-db/greenplum_path.sh
gpssh-exkeys -f /home/gpadmin/all_hosts
```

12、执行下面命令使变量生效，在 gpadmin 账户下执行：

```
su - gpadmin
source /usr/local/greenplum-db/greenplum_path.sh 
```

13、执行命令 `vi /home/gpadmin/.bashrc` 编辑该文件进行环境变量的配置，下面内容追加在文件最后：

```
source /usr/local/greenplum-db/greenplum_path.sh
export MASTER_DATA_DIRECTORY=/home/gpadmin/master/gpseg-1
export PGPORT=5432
export PGUSER=gpadmin
export PGDATABASE=postgres
```

14、执行下面命令进行数据目录的创建：

```
mkdir -p /home/gpadmin/master
mkdir -p /home/gpadmin/data/gp1
mkdir -p /home/gpadmin/data/gp2
mkdir -p /home/gpadmin/data/gp3
mkdir -p /home/gpadmin/data/gp4
```

执行命令 `chown -R gpadmin:gpadmin /home/gpadmin/*` 进行目录的授权。

15、初始化 Greenplum

首先复制配置文件到 /home/gpadmin 目录中：

```
su - gpadmin # 切换到 gpadmin 账户
mkdir /home/gpadmin/gpconfigs  # 创建配置文件目录
cp $GPHOME/docs/cli_help/gpconfigs/gpinitsystem_config /home/gpadmin/gpconfigs/gpinitsystem_config # 复制配置文件
```

修改所需参数，执行命令 `vi /home/gpadmin/gpconfigs/gpinitsystem_config` 修改配置文件，在文件最后追加下面内容：

```
declare -a DATA_DIRECTORY=(/home/gpadmin/data/gp1 /home/gpadmin/data/gp2 /home/gpadmin/data/gp3 /home/gpadmin/data/gp4)
MASTER_HOSTNAME=gpdb  #gpdb 为上面设置的主机名称
MASTER_DIRECTORY=/home/gpadmin/master
```

执行下面命令进行初始化操作：

```
gpinitsystem -c /home/gpadmin/gpconfigs/gpinitsystem_config -h all_hosts
```

执行过程中会出现交互，输入 y 继续即可，正常如下图：

![iShot2022-02-02 06.14.21](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020614917.jpg)

16、设置远程连接配置

执行命令 `vi /home/gpadmin/master/gpseg-1/postgresql.conf` 修改配置，将 #listen_addresses = '*' 前面的 # 取消，如下图：

![iShot2022-02-02 06.14.49](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020615210.jpg)

执行命令 `vi /home/gpadmin/master/gpseg-1/pg_hba.conf` 修改配置，在文件最后追加下面内容：

```
host all gpadmin  0.0.0.0/0  md5
```

17、修改密码和测试连接，在 gpadmin 账户下执行 

```
su - gpadmin # 切换到 gpadmin 账户
psql -d postgres # 进入到数据库命令行模式
alter user gpadmin with password '123456'； # 修改gpadmin 账户的密码为 123456
```

使用 Navicat 进行连接测试：

![iShot2022-02-02 06.15.14](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020615173.jpg)

## dotNET Core 示例

1、使用 VS2019 创建控制台项目  GreenplumDemo 。

2、安装 NuGet 包 NpgSql 。

![iShot2022-02-02 06.16.03](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020616943.jpg)

3、使用 Navicat 连接上数据库，执行下面的 SQL 脚本进行表和数据的创建：

```
CREATE TABLE user_test(user_name varchar(100));
insert into user_test(user_name) values('oec2003')
```

4、GreenplumDemo 控制台项目添加如下代码：

```
using System;
using Npgsql;
namespace PostgreSqlDemo
{
    class Program
    {
        static void Main(string[] args)
        {

            var connString = "Host=10.15.3.111;Username=gpadmin;Password=123456;Database=postgres;Port=5432";

            using (var conn = new NpgsqlConnection(connString))
            {
                conn.Open();

                using (var cmd = new NpgsqlCommand("select * from user_test", conn))
                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                        Console.WriteLine(reader["user_name"]);
            }

            Console.ReadKey();
        }
    }
}
```

只要你会使用 ADO.NET ，那么使用 Npgsql 就不存问题。

希望本文对您有所帮助。
