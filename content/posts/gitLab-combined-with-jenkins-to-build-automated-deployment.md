---
title: GitLab配合Jenkins打造自动化部署
date: 2018-07-14T11:20:31+08:00
categories: [技术]
tags: [GitLab,Jenkins,Docker]
---

`GitLab`有`CI`和`CD`功能模块，但我对`Jenkins`更熟悉些，所以先使用`Jenkins`将自动发布搭建起来，后面再继续研究`GitLab`的`CI`和`CD`功能。

<!--more-->

## 需求

* 程序使用`dotNET Core`编写，代码通过`GitLab`的`Merge Request`的方式推送到服务端
* 代码`Merge`后会合并到`master`分支
* 通过`Jenkins`对`master`分支监控，获取最新代码，部署到`CentOS`的`Docker`容器中

>有两种方式进行构建
>1、在安装`Jenkins`的服务器上安装`dotNET Core`环境，编译和发布在此服务器上进行，`Docker`中只需要运行环境的镜像即可
>2、在`Docker`中进行编译、发布，但需要下载编译环境的镜像
>
>本文采用第一种方式

## 环境

### Windows10

* 安装`jdk`
* 部署`Jenkins2.129`
* 安装`VS2017`
* 安装`Git`

### CentOS7.4

* 安装`GitLab10.6.4`
* 安装`docker-ce18.04`
* 下载镜像`dotnetcore`

## 安装Jenkins

在`Jenkins`的官网[https://jenkins.io/download/](https://jenkins.io/download/)进行`Jenkins`的下载，如使用`Windows`，下载`Windows`版本即可

![-w415](https://img.fwhyy.com/2022/202201262131794.webp)

因为`Jenkins`是基于`Java`的，所以在`Windows`上先安装好`JDK`的最新版本。然后根据安装向导进行安装，安装成功后会出现下面界面：

![](https://img.fwhyy.com/2022/202201262132348.webp)

根据向导安装所有的默认插件，这个步骤也可以手动根据需要来安装相应的插件

![](https://img.fwhyy.com/2022/202201262132933.webp)

## 安装插件

因为构建时需要通过`SSH`连接到`CentOS`，所以需要安装`SSH`的`publish over ssh`插件

![](https://img.fwhyy.com/2022/202201262132525.webp)

添加了`publish over ssh`插件后,在「系统管理/系统设置」中可以看到`Publish over SSH`的设置区域,将需要构建发布的`ContOS`的服务器信息添加进去

![](https://img.fwhyy.com/2022/202201262132121.webp)

## 设置Git路径

在「系统管理/全局工具配置」中设置`Git`路径`C:\Program Files (x86)\Git\bin\git.exe`，在构建时拉取代码需要用到`Git`工具

![](https://img.fwhyy.com/2022/202201262133119.webp)

## 配置Jenkins

首先需要创建一个任务，选择构建一个自由风格的软件项目

![](https://img.fwhyy.com/2022/202201262133709.webp)

配置分为五个步骤：

1. **源码管理**：设置源代码地址等相关信息
2. **构建触发器**：设置构建检查的时间间隔
3. **构建环境**：设置构建环境
4. **构建**：设置构建相关的命令
5. **构建后操作**：复制文件到`CentOS`中

### 源码管理

![](https://img.fwhyy.com/2022/202201262133686.webp)

* **Repositroy URL**：源码仓库地址
* **Credentials**：`GitLab`的账户密码设置
* **Branch**：设置分支，当监控到设置的分支有代码更新后，会自动进行构建
* **源码库浏览器**：选择`gitlab`
* **URL**：代码地址
* **Version**：10.6，因为我安装的`GitLab`为10.6的版本

代码拉到本地需要进行存储，在`General`中进行路径的设置

![](https://img.fwhyy.com/2022/202201262133442.webp)

### 构建触发器

![](https://img.fwhyy.com/2022/202201262134557.webp)

构建触发器有很多中，这里我们选择轮询`SCM`，意思是定时检查源码变更（根据SCM软件的版本号），如果有更新就`pull`最新`code`下来，然后执行构建动作。

表达式配置为`H/2 * * * *` 表示每两分钟检查一次。表达式规则如下：

```
* * * * *
(五颗星，中间用空格隔开）

第一颗*表示分钟，取值0~59
第二颗*表示小时，取值0~23
第三颗*表示一个月的第几天，取值1~31
第四颗*表示第几月，取值1~12
第五颗*表示一周中的第几天，取值0~7，其中0和7代表的都是周日
```

### 构建环境

![](https://img.fwhyy.com/2022/202201262135458.webp)

### 构建

![](https://img.fwhyy.com/2022/202201262136693.webp)

### 构建后操作

构建后的操作选择`Send build artifacts over SSH`

![](https://img.fwhyy.com/2022/202201262136696.webp)

进行SSH的相关配置

![](https://img.fwhyy.com/2022/202201262136130.webp)

* **SSH Server**：可以选择在「系统管理/系统设置」中全局设置的`SSH`服务器
* **Source files**：`dotNET Core`程序的发布目录
* **Remove reefix**：`dotNET Core`程序的发布目录
* **remote direcotry**：`CentOS`服务器的根目录中创建`webapi`目录，此处配置目录路径
* **Exec command**：在`CentOS`服务器的根目录中创建名称为`devops_webapi.sh`的脚本文件，此处配置文件路径

到此`Jenkins`配置完成，保存即可。

## CentOS相关设置

1、在根目录中创建`webapi`目录，`Jenkins`会将`dotNET Core`发布后的文件复制到该目录中，在该目录中创建`Dockerfile`文件，用来生成`Docker`镜像，`Dockerfile`文件内容如下：

```
FROM microsoft/aspnetcore
COPY . /app
WORKDIR /app
EXPOSE 80/tcp
ENTRYPOINT ["dotnet", "FW.WebAPI.dll"]
```

2、在根目录下创建`devops_webapi.sh`文件，用来构建镜像和创建容器，文件内容如下：

```
#!/bin/bash

echo "del none images"
docker ps -a | grep "Exited" | awk '{print $1 }'|xargs docker stop
docker ps -a | grep "Exited" | awk '{print $1 }'|xargs docker rm
docker images|grep none|awk '{print $3 }'|xargs docker rmi

echo "container del success"
docker stop $(docker ps -a | awk '/webapi:v1/ {print $1}')
docker rm $(docker ps -a | awk '/webapi:v1/ {print $1}')

echo "begin docker build"
cd webapi
docker build -t webapi:v1 .
echo "build end"

docker run -d -p 9011:5000 --restart=always --name webapitest webapi:v1
#echo "none image del start"
#docker rmi $(docker images -f "dangling=true" -q)
#echo "none image del success"
```

## 总结

程序自动发布的方式有很多种，先选一种自己熟悉的方式运行起来，再进行更深入的研究，和更优方式的选择。跟写代码一样，不能纸上谈兵，先运行起来，再逐步优化重构。

