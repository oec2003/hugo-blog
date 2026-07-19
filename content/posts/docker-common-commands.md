---
title: Docker 常用命令
date: 2018-06-09T07:49:07+08:00
categories: [技术]
tags: [Docker]
---

学习`Docker`有段时间了，所有的操作都是在命令行下，如果不是每天都在使用，很容易忘记命令。本文将以学习`Docker`的角度，从前到后，将一些常用的`Docker`命令记录下来，算是个备忘。

<!--more-->

## 环境

操作系统：CentOS7
Docker：18.04

## 安装Docker

`Docker`有两个版本，`docker-ce`和`docker-ee`，我们通常使用的`docker-ce`，但直接使用命令`yum install docker`，安装的是`docker-ee`，如果一不小心安装了`docker-ee`，想要再安装`docker-ce`，需要先执行下面命令进行卸载

```
sudo yum remove docker docker-common docker-selinux docker-engine
```

安装一些依赖

```
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```

设置仓库源

```
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

如果是国内网络，在这一步可能会出现下图中的错误：
![](https://img.fwhyy.com/15282084065440.webp)

将镜像地址修改为阿里云解决此问题

```
sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

安装`docker-ce`

```
sudo yum install docker-ce
```

下面地址是Docker官方在CentOS中安装docker-ce的方法：
[https://docs.docker.com/install/linux/docker-ce/centos/#install-docker-ce](https://docs.docker.com/install/linux/docker-ce/centos/#install-docker-ce)

## 设置镜像源

为了提升下载镜像的速度，可以将Docker的镜像源设置在国内，修改 `/etc/docker/daemon.json` 文件并添加上 `registry-mirrors` 键值

```
{
    "registry-mirrors": ["https://registry.docker-cn.com"]
}
```

## Docker启动

```
#启动
sudo service docker start
#重启
sudo service docker restart
#设置开机启动
systemctl enable docker
```

## 查看相关信息

```
#查看docker详细信息
docker info
#查看docker版本
docker version
```

## 镜像相关操作

### 搜索镜像

要下载镜像，先要知道镜像的名称，可以进入[https://hub.docker.com/](https://hub.docker.com/)网站进行搜索，或是使用`docker search`命令进行搜索

```
#搜索有关mysql的镜像
docker search mysql
```

### 下载镜像

```
#下载指定tag版本的镜像，tag为版本号
docker pull mysql/mysql-server:tag
#下载最新版本镜像
docker pull mysql/mysql-server
```

### 查看镜像

```
#查看所有已下载到本地的镜像
docker images
```

### 删除镜像

```
#使用镜像id进行删除
docker rmi imagesid
#使用镜像名称删除
docker rmi imagename:tag
#删除dangling镜像（无名称无标签的镜像）
docker rmi $(docker images -q -f dangling=true)
#根据名称过滤删除，删除所有名称为redis的镜像
docker rmi $(docker images -q redis)
```

## 容器相关操作

### 启动容器

使用`docker run`命令可以根据镜像来创建容器，最简单的起一个容器命令如下

```
#如果没有先下载hello-world镜像，该命令会同时下载镜像然后再创建容器
docker run hello-world
```

![-w576](https://img.fwhyy.com/15284961225360.webp)

通常我们启动容器时会添加一些常用参数

```
docker run -d -p:3307:3306 --name mysqltest -h mysql mysql/mysql-server
```

* -d：后台运行容器，并返回容器ID
* -p：将容器中的3306端口映射到宿主机的3307端口
* --name：给容器指定一个名字
* --h：给容器设置一个hostname，我之前有一个使用场景是，在创建容器时指定了hostname，在netcore中取到该hostname，可以做一些业务逻辑的判断

如果我们创建的容器有数据和配置，一定要将数据和配置挂接到宿主机，在《[Docker安装MySql-挂载外部数据和配置](http://fwhyy.com/2018/05/docker-installs-mysql-to-mount-external-data-and-configuration/)》中有详细描述，命令如下

```
docker run -d -p 4306:3306 
--restart always 
--privileged=true
--name mysql001
-e MYSQL_USER="fengwei" 
-e MYSQL_PASSWORD="pwd123" 
-e MYSQL_ROOT_PASSWORD="rootpwd123"
-v=/mysqltest/config/my.cnf:/etc/my.cnf 
-v=/mysqltest/data:/var/lib/mysql 
mysql/mysql-server
```

### 查看容器

```
#查看启动的容器
docker ps
#查看所有容器
docker ps -a
#查看指定容器的日志，经常需要通过查看日志的方式来进行错误排查
docker logs [容器ID]
#查看容器内详细信息
docker inspect [容器ID]
```

### 进入容器

进入容器的方式有很多中，我通常使用下面这一种

```
docker exec -it [容器ID] bash
```

### 删除容器

```
#删除所有容器
docker rm $(docker ps -a -q)
#删除已经停止的容器
docker rm `docker ps -a |awk '{print $1}' | grep [0-9a-z]`
#删除指定容器
docker rm [容器ID]
```

注意：在删除容器时，如果容器是启动状态是无法删除的，先要用`docker stop [容器ID]`将容器停止再进行删除。

## 拷贝文件

### 从容器中拷贝文件到宿主机

```
sudo docker cp [容器ID]:容器路径 宿主机路径
```

### 从宿主机拷贝文件到容器

```
sudo docker cp 宿主机路径 [容器ID]:容器路径
```

## 制作镜像

有时候我们需要修改容器内的一些配置或是其他内容，然后将修改后的容器打包成镜像，这样通过新的镜像创建的容器就包含我们的修改了。

```
sudo docker commit [容器ID] mynginx
```

## 镜像的导入导出

### 导出
```
#导出指定镜像ID的镜像到本地目录，导出的名称为nginx.tar
sudo docker save -o nginx.tar [镜像ID] 
```

### 导入

```
#将nginx.tar拷贝到目标机器上执行下面命令导入
docker load -i nginx.tar
```

## 总结

以上就是我在一段时间的学习中记录下来的一些常用命令，希望对您有所帮助。

