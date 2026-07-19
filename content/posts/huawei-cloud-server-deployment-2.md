---
title: 华为云服务器初探二（完结）
date: 2022-01-14T08:05:00+08:00
categories: [技术]
tags: [华为云,部署,运维]
---

在上一篇《[华为云服务器初探](http://mp.weixin.qq.com/s?__biz=MzU0NjgzNzQyMw==&mid=2247484822&idx=1&sn=9712c1cc0a7efa7e5938021c7c088c6a&chksm=fb56c356cc214a406ee70fa7ae6908822871892855c1602db1ccc2cd8119f54f7f5dc30acb17&scene=21#wechat_redirect)》 中介绍了在使用华为云服务器部署时的一些关键点，本篇继续，内容涉及如下:

<!--more-->

- 中间件的部署问题解决
- NAT 网关使用
- 数据库服务的访问
- dotNET Core 程序的构建

## Redis

首先更正上一篇中的一个错误，在运行参数中进行密码设置，是不能生效的，而且还会导致配置文件加载出错：

![iShot2022-02-04 17.42.04](https://img.fwhyy.com/2022/202202041742324.webp)

在日志中可以看到下面的错误：

```
** FATAL CONFIG FILE ERROR (Redis 6.2.6) ***

Bad directive or wrong number of arguments

>>> 'requirepass=123456’
```

如果想要给 Redis 设置密码，只需要修改 Redis 的配置文件即可，将 requirepass 的注释放开：

![iShot2022-02-04 17.42.35](https://img.fwhyy.com/2022/202202041742688.webp)

都设置好了，Redis 的工作负载运行状态是正常的，但使用客户端工具连接时不能正常连接，继续查看日志发现：

```
Warning: Could not create server TCP listening socket ::1:6379: bind: Cannot assign requested address
```

看似是个警告，但其实是个错误，意思是地址不能分配，肯定就访问不了。修改 Redis 的配置文件：

- 注释掉 bind 所在行
- protected-moe 由 yes 修改为 no

![iShot2022-02-04 17.47.14](https://img.fwhyy.com/2022/202202041747669.webp)

## RabbitMQ

默认情况下，RabbitMQ 的 UI 插件是没有自动开启的，所以在安装了 RabbitMQ 之后，需要进入容器进行开启：

```
docker exec -it  mq容器id bash
rabbitmq-plugins enable rabbitmq_management
```

出现下图，说明开启成功：

![iShot2022-02-04 17.47.59](https://img.fwhyy.com/2022/202202041748663.webp)

现在的问题是如果 RabbitMQ 的配置升级重新构建后，需要重新进入容器进行开启。

## NAT 网关

一开始，将弹性公网 IP 直接绑定在 ECS 服务器上，可以满足 CCE 中对外发布应用，本地 SSH 也能连接到服务器，但是公网 IP 只能绑定到一个地方，华为云的 GaussDB(for MySQL) 想要在本地用客户端工具连接，一种方式就是绑定公网 IP 。但公网 IP 已经被 ECS 服务器占用了，所以如果想要多个不同的应用同时提供服务，就需要使用 NAT 网关了。

1、首先在弹性公网 IP 的列表界面中进行解绑；

2、在 NAT 网关中添加 SNAT 规则，规则中绑定公网 IP：

![iShot2022-02-04 17.48.37](https://img.fwhyy.com/2022/202202041748644.webp)

3、添加 DNAT 规则，将数据库映射到外网访问：

![iShot2022-02-04 17.49.37](https://img.fwhyy.com/2022/202202041749689.webp)

4、这样数据库就既能内网访问也能外网访问了，如果想要远程连接服务器，也是同样的设置，添加 DNAT 规则，将自定义的端口映射到某台 ECS 服务器的 22 端口即可；

5、将公网 IP 和 ECS 服务器解绑后，CCE 中的工作负载便不能进行访问了，外部访问地址一列也被清空，需要重新在访问方式中添加 Service，访问类型选择 DNAT 网关：

![iShot2022-02-04 17.50.11](https://img.fwhyy.com/2022/202202041750720.webp)

## dotNET Core 程序的构建

因为购买的是鲲鹏服务器，需要在鲲鹏服务器上进行基础镜像的构建，然后程序构建时依赖构建好的基础镜像，具体步骤如下：

1、在任意的 ECS 服务器的根目录创建目录 core3.1_images_build ，里面添加 Dockerfile 文件和常用字体文件，Dockerfile 内容如下：

```
FROM mcr.microsoft.com/dotnet/core/aspnet:3.1

RUN apt-get update;
RUN apt-get install libfontconfig1 -y

COPY . /app
COPY simhei.ttf /usr/share/fonts/
COPY simsunb.ttf /usr/share/fonts/
COPY simsun.ttc /usr/share/fonts/
COPY BSONGSJ.TTF /usr/share/fonts/
COPY cybsongsj.ttf /usr/share/fonts/
COPY hyktjn.ttf /usr/share/fonts/

COPY ./font/WINGDNG3.TTF /usr/share/fonts/
COPY ./font/WINGDNG2.TTF /usr/share/fonts/
COPY ./font/BSSYM7.TTF /usr/share/fonts/
COPY ./font/symbol.ttf /usr/share/fonts/
COPY ./font/wingding.ttf /usr/share/fonts/
COPY ./font/webdings.ttf /usr/share/fonts/
COPY ./font/segmdl2.ttf /usr/share/fonts/

WORKDIR /app

EXPOSE 80/tcp
```

2、构建镜像并推送到华为云的私有镜像仓库；

3、创建名为 test 的 dotNET Core 示例程序，程序根目录中添加 Dockerfile 文件，内容如下：

```
FROM swr.cn-north-4.myhuaweicloud.com/xxxx/s2netcore3.1-runtime:latest
COPY . /app
WORKDIR /app
EXPOSE 5000/tcp
ENTRYPOINT ["dotnet", "test.dll"]
```

4、华为云的编译构建中创建 netcore-test 的构建任务，基本信息中的主机类型选择鲲鹏：

![iShot2022-02-04 17.50.53](https://img.fwhyy.com/2022/202202041751232.webp)

5、构建步骤中添加两个步骤：mono 和制作镜像并推送到 SWR 仓库：

![iShot2022-02-04 17.51.40](https://img.fwhyy.com/2022/202202041751771.webp)

6、制作镜像并推送到 SWR 仓库的配置如下：

![iShot2022-02-04 17.52.19](https://img.fwhyy.com/2022/202202041752925.webp)

7、创建无状态工作负载，选择构建好的镜像，运行成功如下图：

![iShot2022-02-04 17.52.49](https://img.fwhyy.com/2022/202202041753052.webp)

希望对您有所帮助！
