---
title: Docker学习-安装镜像
date: 2017-08-31T10:47:45+08:00
categories: [技术]
tags: [Docker, Redis]
---

Docker现在已不是什么新鲜事物了，Windows Server2016已经内置了Docker，对于我来说，我只想让Docker来帮我解决运行环境的问题。

我们的产品部署起来会依赖很多的第三方产品：SqlServer、MongoDB、Redis、RabbitMQ等，各种软件等安装，数据库的还原，每次部署都会耗费大量的时间。为了能使部署更加的方便，我们的设想是这样的：

* 在Docker中安装这些工具软件
* 打包Docker，拷贝到客户环境中导入
* 在Web界面中进行简单的向导配置

本文主要介绍在Docker中安装这些工具软件。
<!--more-->

## 环境

* CentOS: 7.0, CentOS是安装在Windows Server2012 Hyper-v上的虚拟机
* Docker: 1.12.6
* Mac: 10.12.5，在Mac上用iTerm通过SSH登录到CentOS中进行安装

## 常用Docker命令

```
docker version：查看docker版本
docker pull：拉取docker进行安装
docker ps -a：列表的形式展示所有安装的docker容器
docker images：查看已经下载的docker镜像
docker run：
docker rm -f 容器id：强制删除docker容器
docker inspect --format='{{.NetworkSettings.IPAddress}}' 容器id：查看容器内部ip
```

## SqlServer

```
docker pull microsoft/mssql-server-linux
docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=Aa123456' -p 192.168.16.90:1433:1433  -d microsoft/mssql-server-linux
```

1. 使用docker pull命令拉取SqlServer进行安装，安装过程可能会有点慢，耐心等待
2. 使用docker run 命令运行一个docker容器
3. -e 后面的设置sa密码，网上查到的示例命令如下图：

![](http://fwhyy.com/img/post/15041945829250.jpg)

请注意：红框部分的左右尖括号也是属于密码的一部分

参考：[https://docs.microsoft.com/zh-cn/sql/linux/quickstart-install-connect-docker](https://docs.microsoft.com/zh-cn/sql/linux/quickstart-install-connect-docker)

## MongoDB

```
docker pull mongo:3.2
docker run  -p 192.168.16.90:27017:27017 -v $PWD/mongo:/data/mongodb -d mongo:3.2
```

1. -p 192.168.16.90:1433:1433：表示将容器的1433端口映射到192.168.16.90这个ip的1433端口上，192.168.16.90是CentOS的ip
2. -v $PWD/mongo:/data/mongodb :将主机中当前目录下的mongo目录挂载到容器的/data/mongodb，作为mongo数据存储目录

## Redis

```
docker pull  redis:3.2
docker run -p 192.168.16.90:6379:6379 -v $PWD/data/redis:/data/redisdb  -d redis:3.2 redis-server --appendonly yes
```

## RabbitMQ

```
docker pull rabbitmq:management
docker run -d --name myrabbitmq -p 192.168.16.90:5673:5672 -p 192.168.16.90:15673:15672 docker.io/rabbitmq:management
```

1. pull时加上`:management` 是拉取带管理界面的镜像
2. 默认会创建用户名和密码都为guest的账号，登录后如下图：

![](http://fwhyy.com/img/post/15041946022264.jpg)

所有容器都安装完成后，可以执行`docker ps -a` 来查看容器列表，如下图：

![](http://fwhyy.com/img/post/15041946165209.jpg)

## 常见问题解决

### docker run起一个容器后，status一直都是Exited

1. 使用`docker logs -f 容器id` 查出错误信息为Fatal error, can't open config file '-p' ，由此可以判断为权限问题
2. 使用命令`chcon -Rt svirt_sandbox_file_t /data` 来设置权限

## 思考

* 上面`docker run` 命令带的参数-p中使用的是宿主机器的`ip`和端口来映射容器的内部端口，如果容器打包导入到另一个环境中，怎样解决ip的映射关系？
* 如果想要备份还原到容器的`SqlServer`中，怎样拷贝备份文件到容器中？
* 上面安装了`SqlServer`、`MongoDB`、`Redis`和`RabbitMQ`四个容器，是否可以导出到一个包中？
* 在`CentOS`中导出的包是否可以导入到`Widnwos`的`Docker`中？
* 在学习过程中，每次运行不成功，就执行`docker rm -f 容器id`命令将其删除，重新run一个，如果是已经正式在跑的容器，怎样修改其配置参数？

