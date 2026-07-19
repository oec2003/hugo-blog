---
title: .NET中操作哨兵模式的Redis（哨兵和Redis示例配置密码）
date: 2023-12-25T17:03:06+08:00
categories: [技术]
tags: [DotNet,Redis,哨兵模式]
---

Redis 的高可用有一种方式是部署成哨兵模式。在哨兵模式中哨兵和每个节点都可以设置密码，如果都设置密码了，在 .NET 中用 CSRedisCore 进行调用时会遇到点问题。

本文就介绍怎样用 CSRedisCore 来调用设置了密码的哨兵模式 Redis。
<!--more-->

## 环境

* CentOS：7.9
* Redis：6.2.14
* dotNetCore：3.1
* CSRedisCore：3.8.802

## CentOS 部署 Redis

### 单机部署

1、执行下面命令安装 wget ，用于后面下载 Redis 安装包：

```shell
yum -y install wget
```

2、安装 gcc ，编译和安装 Redis 时需要：

```shell
yum -y install gcc
```

3、下载 Redis 并安装：

```shell
cd /usr/local  #进入到usr/local目录
tar xzf redis-6.2.14.tar.gz  #解压Redis
cd redis-6.2.14 #进入到解压到Redis目录
make MALLOC=libc #编译
make install #安装
```

4、修改 Redis 配置文件并启动：

```shell
cd /usr/local/6.2.14  #进入redis目录
vi redis.conf #编辑配置文件
```

编辑内容如下：

```shell
daemonize yes #修改配置文件中的daemonize为yes，为后台启动
```

执行命令 `redis-server redis.conf` 进行 Redis 服务的启动。

5、检查并连接：

```
ps -ef | grep redis #检查是否启动成功
```

![](https://img.fwhyy.com/2023/202312241956024.webp)

6、设置密码：

```shell
vi redis.conf #编辑配置文件进行密码设置
```

修改文件内容，去掉requirepass前面的#号：

```shell
requirepass Aa123456
redis-server redis.conf #修改完配置文件，重启redis
```

### 配置主从(哨兵模式)

正式的生产环境会使用多台服务器来配置主从，本文为了演示方便，在一台服务器上通过多端口的方式来配置主从，端口分配规则如下，一个主节点、三个从节点、五个哨兵：

* master：6380
* slave1：6382
* slave2：6383
* slave3：6383
* sentinel1：26379
* sentinel2：26380
* Sentinel3：26381
* sentinel4：26382
* Sentinel5：26383

1、在 /usr/local/redis-6.2.14 目录中创建 config 目录，在该目录中创建相应的目录存放配置文件和数据：

```shell
cd /usr/local/redis-6.2.14
mkdir config  #创建config目录
cd config
mkdir master-6380 #创建master-6380目录
cd master-6380
mkdir data #创建data目录用来存放数据
cp /usr/local/redis-6.2.14/redis.conf . #将配置文件复制到当前目录
cd .. #回退到config目录
cp -r master-6380/ slave-6381 
cp -r master-6380/ slave-6382
cp -r master-6380/ slave-6383

mkdir sentinel-26379  #创建哨兵1配置目录
cp /usr/local/redis-6.2.14/sentinel.conf /usr/local/redis-6.2.14/config/sentinel-26379/ 
cd sentinel-26379
mkdir data
cd ..
cp -r sentinel-26379/ sentinel-26380
```

创建完成后目录结构如下：

![](https://img.fwhyy.com/2023/202312241956329.webp)

2、配置 master 的 redis.conf 文件：

```shell
bind 10.211.55.14 #修改成自己的IP地址
port 6380 #主服务器的端口号
daemonize yes #设置后台启动
requirepass Aa123456
pidfile /var/run/redis_6380.pid #redis 后台启动的时候会在/var/run/默认生成一个pid文件
protected-mode no #保护模式关闭
dir /usr/local/redis-6.2.14/config/master-6380/data #数据保存目录
```

3、配置 slave 的 redis.conf 文件：

```shell
bind 10.211.55.14 #修改成自己的IP地址
port 6381 #从服务器的端口号
daemonize yes #设置后台启动
requirepass Aa123456
pidfile /var/run/redis_6381.pid 
protected-mode no #保护模式关闭
dir /usr/local/redis-6.2.14/config/slave-6381/data #数据保存目录
replicaof 10.211.55.14 6380 #主服务器的IP 主服务器端口号
masterauth Aa123456
```

4、将端口 6382、6383 对应的从服务器的配置文件对照第三步进行修改。

5、配置哨兵 1 的配置文件：

```shell
port 26379  #指定哨兵1端口号
daemonize yes #设置后台启动
protected-mode no #关闭保护模式
requirepass "Aa123456"
sentinel auth-pass mymaster Aa123456
sentinel monitor mymaster 10.211.55.14 6380 5 #监听主的端口，后面的数字2为哨兵的个数
logfile "/usr/local/redis-6.2.14/config/sentinel-26379/sentinel-26379.log"
dir "/usr/local/redis-6.2.14/config/sentinel-26379/data"
```

6、配置哨兵 2 的配置文件，其他的几个哨兵配置类似：

```shell
port 26380  #指定哨兵2端口号
daemonize yes #设置后台启动
protected-mode no #关闭保护模式
requirepass "Aa123456"
sentinel auth-pass mymaster Aa123456
sentinel monitor mymaster 10.211.55.14 6380 5 #监听主的端口，后面的数字2为哨兵的个数
logfile "/usr/local/redis-6.2.14/config/sentinel-26380/sentinel-26380.log"
dir "/usr/local/redis-6.2.14/config/sentinel-26380/data"
```

**注意** ：mymaster 为主的名称，默认为 mymaster，如果要修改，该配置文件中所有涉及的地方都需要调整。

7、启动服务：

```shell
cd /usr/local/redis-6.2.14 
redis-server ./config/master-6380/redis.conf 
redis-server ./config/slave-6381/redis.conf 
redis-server ./config/slave-6382/redis.conf 
redis-server ./config/slave-6383/redis.conf 
redis-sentinel ./config/sentinel-26379/sentinel.conf 
redis-sentinel ./config/sentinel-26380/sentinel.conf 
redis-sentinel ./config/sentinel-26381/sentinel.conf 
redis-sentinel ./config/sentinel-26382/sentinel.conf 
redis-sentinel ./config/sentinel-26383/sentinel.conf 

```

8、查看主从状态：

```shell
redis-cli -h 10.211.55.14 -p 6380 #连接到主库
>auth Aa123456
>info  #使用info命令查看信息，如下图
```

![](https://img.fwhyy.com/2023/202312241956692.webp)

9、测试哨兵是否正常工作：

```shell
redis-cli -h 10.211.55.14 -p 6380 #连接到主库
>auth Aa123456
>shutdown  #停掉主库
>quit  #退出

redis-cli -h 10.211.55.14 -p 6383 #连接到其中一个从库
>auth Aa123456
>info  #查看状态，如下图：
```

![](https://img.fwhyy.com/2023/202312241956833.webp)

可以看出 6383 的从库已经升级为主库，这时将 6380 启动起来，查看服务器状态,可以发现 6380 已经变成从库，说明哨兵在正常工作。

![](https://img.fwhyy.com/2023/202312241956813.webp)

## .NET Core 中连接 Redis

在 .NET Core 中操作 Redis ，最常用的就是使用 CSRedisCore ，因为这个库中的 API 和 Redis 原生的 API 几乎一致，但不支持哨兵设置密码（也可能是我还没找到使用方法）。

但 .NET Core 中的另一个库 StackExchangeRedis 是可以支持哨兵密码的，所以可以使用 StackExchangeRedis 进行哨兵的验证，并获取到主库的连接。

然后使用 CSRedisCore 来对主库进行操作。

1、使用 StackExchangeRedis 完成验证和获取主节点的连接：

```c#
redisServerIP = "10.211.55.14,10.211.55.14,10.211.55.14,10.211.55.14,10.211.55.14"; //哨兵IP列表
redisServerPort = "26379,26380,26381,26382,26383";
List<string> connectionList = GetRedisConnectionList(redisServerIP, redisServerPort);

ConfigurationOptions sentinelOptions = new ConfigurationOptions();

foreach (var connection in connectionList)
{
    sentinelOptions.EndPoints.Add(connection);
}

sentinelOptions.Password = "Aa123456";  //哨兵访问密码
sentinelOptions.TieBreaker = "";
sentinelOptions.CommandMap = CommandMap.Sentinel;
sentinelOptions.AbortOnConnectFail = true;

// Connect
ConnectionMultiplexer sentinelConnection = ConnectionMultiplexer.Connect(sentinelOptions);
ISubscriber subscriber = sentinelConnection.GetSubscriber();

ConfigurationOptions redisServiceOptions = new ConfigurationOptions();
redisServiceOptions.ServiceName = "mymaster";  //master名称
redisServiceOptions.Password = "Aa123456";  //master访问密码
redisServiceOptions.AbortOnConnectFail = true;
redisServiceOptions.AllowAdmin = true;

ConnectionMultiplexer masterConnection = sentinelConnection.GetSentinelMasterConnection(redisServiceOptions);
```

2、使用 CSRedisCore 操作主连接：

```c#
if (masterConnection.IsConnected)
{
    var servers = masterConnection.GetServers();
    if (servers?.Length > 0)
    {
        //获取主库配置
        var masterService = servers.Where(x => !x.IsReplica).FirstOrDefault();
        if (masterService == null) return;
        var endPoint = masterService.EndPoint as System.Net.IPEndPoint;
        
        redisServerIP = endPoint.Address.ToString();
        redisServerPort = endPoint.Port.ToString();

        CSRedisClient csredis = GetClient(redisServerIP, redisServerPort);
        RedisHelper.Initialization(csredis);//初始化
    }
}
```

虽然有点绕，但暂时可以解决问题，希望 CSRedisCore 未来可以支持 Redis 节点和哨兵都设置密码的场景。

希望本文对您有所帮助。