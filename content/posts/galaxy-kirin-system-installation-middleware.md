---
title: 银河麒麟系统安装中间件
date: 2023-06-12T09:24:01+08:00
categories: [技术]
tags: [中间件,国产化]
---

现在越来越多的企业级应用需要运行在国产化环境中，本文介绍下我们产品使用的中间件在国产操作系统银河麒麟的安装（不一定是最优方式，但能用）。
<!--more-->
包含；Nginx、Redis、RabbitMQ、MongoDB、dotNETCore。

下图是银河麒麟服务器的信息：

![](https://img.fwhyy.com/2023/202306191424224.webp)

想要顺利安装需要确保：

1、服务器能访问网络，完全离线的方式安装会更复杂，需要进一步研究；

2、修改  yum  源。

使用  `vi  /etc/yum.repos.d/kylin_aarch64.repo` 来设置  yum  源，文件内容如下：

```shell
###Kylin Linux Advanced Server 10 - os repo###

[ks10-adv-os]
name = Kylin Linux Advanced Server 10 - Os
baseurl = https://update.cs2c.com.cn/NS/V10/V10SP3/os/adv/lic/base/$basearch/
gpgcheck = 1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-kylin
enabled = 1

[ks10-adv-updates]
name = Kylin Linux Advanced Server 10 - Updates
baseurl = https://update.cs2c.com.cn/NS/V10/V10SP3/os/adv/lic/updates/$basearch/
gpgcheck = 1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-kylin
enabled = 1

[ks10-adv-addons]
name = Kylin Linux Advanced Server 10 - Addons
baseurl = https://update.cs2c.com.cn/NS/V10/V10SP3/os/adv/lic/addons/$basearch/
gpgcheck = 1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-kylin
enabled = 0

```


## Nginx

先执行下面命令安装依赖：

```shell
yum install gcc gcc-c++ make unzip pcre pcre-devel zlib zlib-devel libxml2 libxml2-devel  readline readline-devel ncurses ncurses-devel perl-devel perl-ExtUtils-Embed openssl-devel -y
```

下载源码：

```
wget -c http://nginx.org/download/nginx-1.20.1.tar.gz
tar -zxvf  nginx-1.20.1.tar.gz -C /opt
cd  /opt/nginx-1.20.1/
```

配置：

```
./configure \
--with-http_ssl_module \
--with-http_flv_module \
--with-http_stub_status_module \
--with-http_gzip_static_module \
--with-pcre
```

安装：

```
make -j2 && make install
```

进入 /usr/local/nginx/sbin/ 目录，执行下面命令启动服务： 

```
./nginx -c /usr/local/nginx/conf/nginx.conf
```

执行`ps -ef | grep nginx` 查看 nginx 进程：

![](https://img.fwhyy.com/2023/202306191424692.webp)

## redis

安装依赖：

```
yum install cpp binutils glibc glibc-kernheaders glibc-common glibc-devel -y
```

下载源码和：

```shell
cd /usr/local/src
wget http://download.redis.io/releases/redis-6.0.2.tar.gz
tar -zxvf redis-6.0.2.tar.gz -C /opt
```

编译安装：

```shell
cd /opt/redis-6.0.2
make
```

运行：

```shell
mkdir logs 
nohup /opt/redis-6.0.2/src/redis-server /opt/redis-6.0.2/redis.conf >> /opt/redis-6.0.2/logs/redis.log  2>&1 &
```

## RabbitMQ

RabbitMQ  的安装比较简单，执行几个命令就行。

安装：

```shell
yum install socat logrotate -y
yum -y install erlang -y
yum -y install rabbitmq-server
```

启动服务：

```
systemctl enable rabbitmq-server
systemctl start rabbitmq-server
```

如果想要使用浏览器访问  RabbitMQ 的管理界面，需要启用插件：

```shell
rabbitmq-plugins enable rabbitmq_management
```

插件启用后，就可以在浏览器中输入：htp://ip:15672 进行访问了，15672  端口需要在防火墙进行开放。

## MongoDB

因为上面的中间件已经安装了部分依赖，所以执行下面命令安装剩余依赖即可：

```shell
sudo yum -y install libcurl-devel openssl libxml2-devel libxml2 glibc-static libstdc++-static libffi-devel
```

### 安装  Python

Python  安装的是  2.x  版本，因为这里  MongoDB  使用的是  3.6.19  版本。

```shell
cd /usr/local/src
wget https://www.python.org/ftp/python/2.7.17/Python-2.7.17.tgz
tar -zxvf Python-2.7.17.tgz
cd Python-2.7.17
./configure --prefix=/usr/local/python2
make -j64
make install
ln -s /usr/local/python2/bin/python2.7 /usr/local/bin/python2.7
```

### 安装 setuptools 工具

```shell
cd /usr/local/src
wget https://github.com/pypa/setuptools/archive/v41.0.1.zip
unzip setuptools-v41.0.1.zip
cd setuptools-41.0.1
/usr/local/bin/python2.7 bootstrap.py
/usr/local/bin/python2.7 setup.py install
```

### 安装 pip  工具

```shell
cd /usr/local/src
wget https://github.com/pypa/pip/archive/19.2.2.tar.gz
tar zxvf pip-19.2.2.tar.gz
cd pip-19.2.2
/usr/local/bin/python2.7 setup.py install
```

### 安装  mongo

```shell
cd /usr/local/src
wget https://github.com/mongodb/mongo/archive/r3.6.19.tar.gz
tar -zxvf mongo-r3.6.19.tar.gz
cd mongo-r3.6.19
#构建编译环境
/usr/local/python2/bin/pip2 install -r buildscripts/requirements.txt

#创建数据目录
mkdir -p /data/db

#安装
/usr/local/bin/python2.7 buildscripts/scons.py --prefix=/opt/mongo install MONGO_VERSION=3.6.19 CCFLAGS="-march=armv8-a+crc" --disable-warnings-as-errors --variables-files=etc/scons/propagate_shell_environment.vars

#创建软连接
ln -s /opt/mongo/bin/mongo /usr/local/bin/mongo
ln -s /opt/mongo/bin/mongod /usr/local/bin/mongod
```

* --prefix=/opt/mongo 为安装目录

执行上面命令如果没有出现任何错误，就安装成功了，执行下面命令进行服务端的后端启动：

```
nohup mongod >> /opt/mongo/logs/mongolog 2>&1 &
```

## dotNETCore 3.1

安装依赖

```
yum install gmp-devel mpfr-devel libmpc-devel -y
```

执行下面命令安装

```
wget https://download.visualstudio.microsoft.com/download/pr/186257d9-bca2-4dda-be74-006205965ec9/b2b63d45482701473d9731abc41ecc2a/dotnet-sdk-3.1.426-linux-arm64.tar.gz

mkdir -p /opt/dotnet
tar -zxvf dotnet-sdk-3.1.426-linux-arm64.tar.gz -C /opt/dotnet

ln -s /opt/dotnet/dotnet /usr/bin
export DOTNET_ROOT=/opt/dotnet
export PATH=$PATH:/opt/dotnet
```

 执行命令  dotnet --info 进行验证，出现下面结果表示安装成功：

```shell
.NET Core SDK (reflecting any global.json):
 Version:   3.1.426
 Commit:    e81f6c8565

Runtime Environment:
 OS Name:     kylin
 OS Version:  V10
 OS Platform: Linux
 RID:         linux-arm64
 Base Path:   /opt/dotnet/sdk/3.1.426/

Host (useful for support):
  Version: 3.1.32
  Commit:  f94bb2c3ff

.NET Core SDKs installed:
  3.1.426 [/opt/dotnet/sdk]

.NET Core runtimes installed:
  Microsoft.AspNetCore.App 3.1.32 [/opt/dotnet/shared/Microsoft.AspNetCore.App]
  Microsoft.NETCore.App 3.1.32 [/opt/dotnet/shared/Microsoft.NETCore.App]

To install additional .NET Core runtimes or SDKs:
  https://aka.ms/dotnet-download

```
