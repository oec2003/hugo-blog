---
title: 银河麒麟V10使用Docker方式部署应用
date: 2024-04-16T08:28:08+08:00
categories: [技术]
tags: [中间件,国产化,银河麒麟V10]
---

现在越来越多的企业级应用需要运行在国产化环境中，而银河麒麟 V10 是目前我碰到的最常用的服务器，在银河麒麟上部署应用有两种方式：使用二进制文件编译部署和使用 Docker 。

<!--more-->

关于使用二进制文件的方式，在《银河麒麟系统安装中间件》中有相关介绍。如果客户允许使用 Docker，那可以更方便和快速进行部署了。

本文将介绍使用 Docker 的方式在银河麒麟 V10 服务器进行应用的部署。

可以使用下面命令查看服务器环境：

```
uname -a
hostnamectl
```

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202409302331534.webp)

## 需要安装的组件

1、服务器已经安装 Docker ，还需要安装 docker-compose

2、中间件包括 Nginx、Redis、Mysql、Rabbitmq、MongoDB

3、.NET 8 的相关处理

## docker-compose

在下面地址下载相应的安装包：

https://github.com/docker/compose/releases

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202409302331260.webp)

将安装包放到服务器 /root 目录，然后执行下面命令进行安装：

```
cp docker-compose-linux-aarch64  /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

安装完后，执行 `docker-compose -v` 查看版本号，能正常显示说明安装成功。

## Redis、MySql、RabbitMQ

根据验证发现中间件的 Docker 镜像有的可以直接拉取就可以，有的需要使用 arm64 版本的镜像，比如：

* Redis、MySql、RabbitMQ 可以直接拉取
* MongoDB、Nginx 需要用 arm64 版本

Redis、MySql、RabbitMQ 在 docker-compose.yml 文件中的配置如下：

```yaml
 s2mysql:
  restart: always
  image: mysql:8.0
  ports:
    - "13306:3306"
  environment:
    - TZ=Asia/Shanghai
    - MYSQL_ROOT_PASSWORD=xxxxxx
  volumes:
    - ./config/mysql:/docker-entrypoint-initdb.d/
  command: mysqld --character-set-server=utf8mb4 --collation-server=utf8mb4_general_ci --default-authentication-plugin=mysql_native_password
  networks:
   s2_net:
    ipv4_address: 172.66.9.2
    
 s2redis:
  restart: always
  image: redis:6.2.14
  environment:
    - TZ=Asia/Shanghai
  volumes:
    - ./config/redis/redis.conf:/etc/redis/redis.conf
  command: redis-server /etc/redis/redis.conf
  networks:
   s2_net:
    ipv4_address: 172.66.9.9

 s2mq:
  restart: always
  image: rabbitmq:3.8.2-management
  environment:
    - TZ=Asia/Shanghai
  networks:
   s2_net:
    ipv4_address: 172.66.9.8
```

奇怪的是，这些中间件的镜像中都有提供 arm 的版本，拿 Redis 来说，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202409302332493.webp)

可能直接使用 `docker pull redis:6.2.14` 拉取到的镜像是兼容版本，因为看镜像大小，直接拉取的又 146MB ，特定版本只有几十MB 。

## MongoDB、Nginx

### Nginx

以 Nginx 为例来看如何进行特定版本的拉取。

1、访问 https://hub.docker.com/_/nginx/tags?page=&page_size=&ordering=&name=1.25.4 ,进入到 Nginx 的 1.25.4 版本的页面。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202409302332631.webp)

2、点击前面的链接进入详细页面。

![](../../attachmenent/image-20240412172214604.png)

3、复制 index digest ,拼接到 docker pull 的后面，最终的拉取镜像的命令如下：

```shell
docker pull nginx:1.25.4@sha256:b72dad1d013c5e4c4fb817f884aa163287bf147482562f12c56368ca1c2a3705
```

4、拉取下来的镜像是没有 tag 的。

![](../../attachmenent/image-20240412172718249.png)

可以使用 docker tag 命令进行 tag 设置或直接使用镜像 ID ，前端构建的 Dockerfile 文件内容如下：

```dockerfile
FROM 070027a3cbe0
COPY . /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### MongoDB

1、拉取特定版本镜像的方式和上面 Nginx 一样。

2、需要主要的是在银河麒麟V10 系统中，对 MongoDB 的版本是有要求的 ，一开始使用 MongoDB 5.0 镜像，容器运行失败，错误日志如下：

>WARNING: MongoDB requires ARMv8.2-A or higher, and your current system does not appear to implement any of the common features for that!
>applies to all versions ≥5.0, any of 4.4 ≥4.4.19
>see https://jira.mongodb.org/browse/SERVER-71772
>see https://jira.mongodb.org/browse/SERVER-55178
>see also https://en.wikichip.org/wiki/arm/armv8#ARMv8_Extensions_and_Processor_Features
>see also https://github.com/docker-library/mongo/issues/485#issuecomment-970864306

上面的意思指的是不能使用大于等于 5.0 的版本，如果是使用 版本 4 ，不能大于 4.4.19 。

3、最后拉取了 4.2.24 ，终于运行成功了。

```
docker pull mongo:4.2.24@sha256:699d652ed67423d689258bad7b316cf005dfbb82b334118ec306f049042f3717
```

4、MongoDB 的 docker-compose.yml 配置如下：

```yaml
 mongo:
  restart: always
  image: 97e328c342e0
  environment: 
    - TZ=Asia/Shanghai
  networks:
   s2_net:
    ipv4_address: 172.66.9.7
```

## .NET 8

正常情况下，拉取 .NET 8 对应的镜像用来做应用的基础镜像即可。.NET 8 的镜像地址如下：

 https://hub.docker.com/_/microsoft-dotnet-aspnet/

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202409302332511.webp)

通过上图可以发现，.NET 6 和 .NET 7 都有支持 Debian 11 的版本，但 .NET 8 只有 Debian 12。银河麒麟 V10 的内核是 Debian 11 ,而你恰巧又用的是  .NET 8 ，那暂时还没有办法使用 Docker 的方式部署，只能直接在服务器上安装 .NET 8 环境。

1、安装依赖

```
yum install gmp-devel mpfr-devel libmpc-devel -y
```

2、执行下面命令安装

```
wget https://download.visualstudio.microsoft.com/download/pr/1e449990-2934-47ee-97fb-b78f0e587c98/1c92c33593932f7a86efa5aff18960ed/dotnet-sdk-8.0.204-linux-arm64.tar.gz

mkdir -p /opt/dotnet
tar -zxvf dotnet-sdk-8.0.204-linux-arm64.tar.gz -C /opt/dotnet

ln -s /opt/dotnet/dotnet /usr/bin
export DOTNET_ROOT=/opt/dotnet
export PATH=$PATH:/opt/dotnet
```

3、执行命令  dotnet --info 进行验证，出现下面结果表示安装成功：

```
.NET SDK:
 Version:           8.0.204
 Commit:            c338c7548c
 Workload version:  8.0.200-manifests.9f663350

运行时环境:
 OS Name:     kylin
 OS Version:  V10
 OS Platform: Linux
 RID:         linux-arm64
 Base Path:   /opt/dotnet/sdk/8.0.204/

已安装 .NET 工作负载:
没有要显示的已安装工作负载。

Host:
  Version:      8.0.4
  Architecture: arm64
  Commit:       2d7eea2529

.NET SDKs installed:
  8.0.204 [/opt/dotnet/sdk]

.NET runtimes installed:
  Microsoft.AspNetCore.App 8.0.4 [/opt/dotnet/shared/Microsoft.AspNetCore.App]
  Microsoft.NETCore.App 8.0.4 [/opt/dotnet/shared/Microsoft.NETCore.App]

Other architectures found:
  None

Environment variables:
  Not set

global.json file:
  Not found

Learn more:
  https://aka.ms/dotnet/info

Download .NET:
  https://aka.ms/dotnet/download
```

