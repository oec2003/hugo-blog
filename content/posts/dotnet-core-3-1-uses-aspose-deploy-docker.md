---
title: dotNet Core 3.1 使用 Aspose （部署 Docker）
date: 2020-10-19T07:48:55+08:00
categories: [技术]
tags: [dotNET Core,Aspose,Docker]
---

在之前的文章《Dotnet Core 中使用Aspose（部署Docker）》中介绍了在 dotNet Core2.1 中使用 Aspose ，并部署到 Docker 中，现在 dotNET Core 升级到了 3.1 ，Docker 镜像发生了变化，一些依赖的安装也有些变化。

<!--more-->

在 dotNet Core 2.1 中构建镜像可以使用下面的 Dockerfile：

```
[root@localhost core3.1_images_build]# vi Dockerfile
FROM microsoft/dotnet:2.1-aspnetcore-runtime
RUN apt-get update;
RUN apt-get install libfontconfig1 -y
RUN apt-get install libgdiplus -y
RUN ln -s /usr/lib/libgdiplus.so /lib/x86_64-linux-gnu/libgdiplus.so
RUN apt-get install -y libc6-dev

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
本来升级到 3.1 应该是很顺利的，由于一个简单的失误，导致绕了一个大圈子。

在 dotNET Core 3.1 的官方镜像中已经安装了 libgdiplus 和libc6 ，所以只用安装 libfontconfig1 就可以，所以 Dockerfile 如下：

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

dotNet Core 框架升级到了 3.1，其他很多中间件也做了同步升级，包括 Aspose，但后来因为一些原因，**Aspose 还是使用了原来的 18.7，对应的 libSkiaSharp.so  文件没有降级，最后发现，这个才是问题的所在。**

一开始，按照相同的方式在 3.1 的镜像中安装依赖，安装完成创建容器后，进入容器，使用 ldd libSkiaSharp.so 可以看看依赖是否安装完整，正常情况如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300631451.jpg)

libSkiaSharp.so 文件可以在这个地址中找到： https://github.com/mono/SkiaSharp/releases/tag/v1.60.3 

依赖是完整的，但转换的示例程序部署到容器后，依然报错，一开始没想到是 libSkiaSharp.so 文件的问题，思考方向是 3.1 和 2.1 的容器是不是有什么不一样，最终发现 3.1 使用的是 Debian GNU/Linux 10 发型版，而 2.1 是 9，尝试在 2.1 的镜像中安装 3.1 的运行时，以失败而告终。

另一个思路马上浮现出来，就是拉取 centos7 的基础镜像，在里面安装相关的依赖和运行时，先使用下面命令拉取基础镜像：

```
docker pull centos:7.4.1708
```

创建一个容器

```
docker run -itd --privileged -p 90:22 --name centos centos:7.4.1708 /usr/sbin/init
```

进入容器安装运行时

```
rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm
yum install aspnetcore-runtime-3.1
```

安装相关依赖

```
yum -y install fontconfig
yum -y install ttmkfdir
yum install libgdiplus-devel 
yum install glibc -y
```

如果发现安装时提示找不到组件包，可能需要切换源：

```
rpm -ivh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
```

重新构建容器运行示例程序，发现问题依然存在，这时就感觉不是 Core 3.1 镜像的原因了，然后找了一个干净的 centos 7 的服务器进行验证，装好运行时和相关依赖，将示例程序直接运行在 centos 7 中，出现和容器中同样的问题。基本可以排除是镜像的问题了。

将新的程序和之前 2.1 的程序进行对比，最终发现是 libSkiaSharp.so 文件不一致，替换 libSkiaSharp.so 文件后，centos 7 中运行正常，容器中也运行正常。

参考：

* https://stackoverflow.com/questions/59208166/skiasharp-skimageinfo-exception-in-aspose-word-v18-8-0
* https://www.cnblogs.com/xiaoxiaoqiye/p/13355344.html
* https://docs.microsoft.com/zh-cn/dotnet/core/install/linux-centos
* https://github.com/mono/SkiaSharp/releases/tag/v1.60.3
* https://q.cnblogs.com/q/109061/