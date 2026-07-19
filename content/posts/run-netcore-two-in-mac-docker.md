---
title: 在Mac的Docker中运行DotNetCore2.0
date: 2017-09-09T23:37:32+08:00
categories: [技术]
tags: [DotNetCore, Docker]
---

最近学习`Angular4`，服务端准备使用`DotNetCore API`来实现，本文简单介绍下在`Mac`中怎样将`DotNetCore`程序部署在`Docker`中，并使用`Nginx`做反向代理让程序可以跑起来。

## 具体步骤如下

1. 安装`Docker`
2. 拉取`DotNetCore`镜像
3. 使用`VS For Mac`创建`DotNetCore`应用
4. 发布应用到`Docker`
5. 安装`Nginx`
6. 配置`Nginx`代理`Docker`中的`DotNetCore`应用

<!--more-->
## 常用命令

```
docker pull 镜像名称 #拉取镜像
docker rm -f 容器id #强制删除容器
docker rmi imageid #删除镜像
docker logs -f 容器ID #查看容器日志
docker ps -a #查看所有的容器
docker attach 容器id #进入到容器
docker build -t s2appadmin . #使用Dockerfile文件编译Docker
dotnet publish #发布dotnetcore应用
dotnet run #启动dotnetcore应用
dotnet *.dll #在发布后的目录中执行dotnet 程序集的dll文件名，启动应用
nginx -v #查看nginx版本
nginx -s reload #重新加载nginx
nginx -s stop #停止nginx
```

## Mac中安装Docker

在下面链接中下载`Mac`版的`Docker`安装文件进行`Docker`的安装
[https://docs.docker.com/docker-for-mac/install/](https://docs.docker.com/docker-for-mac/install/)

安装成功后，在系统的顶栏中可以看到下图代表安装成功：

![](https://img.fwhyy.com/2022/202201301929760.webp)

在终端中执行`docker --version` 查看下`Doker`的版本

```
fengwei@localhost:~$ docker --version
Docker version 17.06.2-ce, build cec0b72
```

## 在Docker中拉取NetCore镜像

直接执行下面命令，拉取最新版本的`microsoft/dotnet`镜像

```
docker pull microsoft/dotnet:latest
```

启动一个容器实例

```
docker run -itd -p 5000:5000 microsoft/dotnet
```

因为`DotNetCore`的默认端口监听为`5000`，所以将容器的`5000`端口映射到宿主机到`5000`端口。启动成功后执行`docker ps -a` ，如一切顺利，可以看到如下图所示：

![](https://img.fwhyy.com/2022/202201301929723.webp)

主要关注`STATUS`，状态为up表示是正常启动，否则通过`docker logs -f 容器id`来查看相关日志，通常可以看到容器没有启动成功的错误日志，然后`Google`之。

## 创建DotNetCore应用

在创建应用之前先将`VS For Mac`升级到最新版本，因为稍微老一点的版本不支持`NetCore 2.0`，即便是安装了最新的`dotnet-sdk-2.0.0`，最后发布的程序运行在`Docker`中时会遇到各种问题。所以为了避免麻烦，先升级`VS`。

在VS中创建新项目，选择API项目：

![](https://img.fwhyy.com/2022/202201301929197.webp)

我的`API`项目的名称为`S2AppAdmin`，在终端中进入到项目的目录中，执行`dotnet publish`，如下图：

![](https://img.fwhyy.com/2022/202201301934345.webp)

在终端中进入到`publish`目录中，执行`dotnet S2AppAdmin.dll`，如下图：

![](https://img.fwhyy.com/2022/202201301934798.webp)

可以看出已经监听了`5000`端，现在在浏览器中输入`http://localhost:5000/api/values/get`，可以看到`API`接口的返回值已经在界面显示了。

![](https://img.fwhyy.com/2022/202201301934756.webp)

## 发布应用到Docker

在网上找了很多资料，都是使用`Dockerfile`来发布应用到`Docker`中，用此方法试过很多次，但没有运行成功，后面找到原因再单独开篇来介绍，下面介绍另一种方法。

前面已经使用`docker run` 命令运行起一个`Docker`实例来，容器id为：`3be4cfc30126`，执行下面命令进入到容器中：

```
docker attach 3be4cfc30126
```

进入到`home`目录后，使用`mkdir s2app`命令创建`s2app`目录，如下图：

![](https://img.fwhyy.com/2022/202201301935395.webp)

执行`exit`，退出容器回到宿主环境，进入到`S2AppAdmin`项目的目录中，执行下面命令将`publish`的文件复制到容器中

```
docker cp bin/Debug/netcoreapp2.0/publish/ hardcore_leavitt:/home/s2app/
```

注意：上面的`hardcore_leavitt`为容器的名称。

再次执行`docker attach 3be4cfc30126`进入容器，在`publish`目录中执行`dotnet S2AppAdmin.dll`，如下图：

![](https://img.fwhyy.com/2022/202201301935972.webp)

这时在宿主环境中访问`http://localhost:5000/api/values/get`，发现无法访问，说明容器和宿主没有打通。

在VS中打开`Program.cs`文件，添加`.UseUrls("http://*:5000")`，如下图：

![](https://img.fwhyy.com/2022/202201301937790.webp)

在项目目录下执行下面命令：

```
dotnet publish
docker cp bin/Debug/netcoreapp2.0/publish/ hardcore_leavitt:/home/s2app/
```

在容器内执行：

```
dotnet S2APPAdmin.dll
```

再在浏览器中访问`http://localhost:5000/api/values/get`，发现结果已经可以正常显示了。


## Nginx安装

使用`brew`来安装`Nginx`，至于什么是`brew`，自行去`Google`。下面先看几个`brew`的常用命令

```
brew search nginx #brew 搜索软件
brew install nginx #brew 安装软件
brew uninstall nginx #brew 卸载软件
sudo brew info nginx #查看安装信息
brew list #查看已经安装的软件
```

安装成功后，输入`nginx -v`，可以看到`nginx`的版本信息

在`/usr/local/etc/nginx`目录中找到并打开`nginx.conf`文件，添加如下代码：

```
    server {
        listen       8000;
        #listen       somename:8080;
        server_name  localhost;

        location / {
          proxy_pass http://localhost:5000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection keep-alive;
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
        }
    }
```

如下图：

![](https://img.fwhyy.com/2022/202201301938605.webp)

正常情况下，在浏览器中输入`http://localhost:8000/api/values/get`，可以看到`API`的输出结果。

## 常见问题

问题：nginx-1.8.0 already installed, it's just not linked

```
解决：执行命令：brew link nginx
```

问题：出现如下错误信息：

```
Error: The `brew link` step did not complete successfully
The formula built, but is not symlinked into /usr/local
Could not symlink share/man/man8/nginx.8
/usr/local/share/man/man8 is not writable.
```

```
解决: /usr/local/share/man/man8  设置权限
```



