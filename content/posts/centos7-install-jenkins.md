---
title: CentOS7 安装 Jenkins（ 构建 Vue 和 dotNET Core ）
date: 2020-02-04T13:36:57+08:00
categories: [技术]
tags: [Jenkins,CentOS7]
---

之前的自动构建工具 Jenkins 是部署在公司内网的 Windows 服务器上，现在武汉处于非常时期，兄弟们都在家自我隔离，为了远程提交的代码能自动构建，需要在外网的 CentOS 服务器上搭建 Jenkins 环境来进行构建工作。

<!--more-->

## 目的

产品采用前后端分离架构，前端使用 Vue，后端使用 dotNET Core ，当代码提交 GitLab后，需要自动构建前后端代码，并发布到测试环境的容器中，步骤如下：

* 安装 Jenkins
* 设置 Jenkins 权限
* 安装其他依赖
* 配置 Jenkins

## 环境

* CentOS：7.5
* Jenkins：2.204.2
* node：12.14.1
* dotNET Core：2.1

## 安装 Jenkins 

1、安装 wget

```
yum -y install wget
```

2、安装 jdk

```
yum install -y java-1.8.0-openjdk java-1.8.0-openjdk-devel
```

3、安装 Jenkins

```
#下载依赖
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo 
#导入秘钥
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
#安装
yum install jenkins
```

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290813109.jpg)

## 设置 Jenkins 权限

1、Jenkins 安装后，执行命令 `vim /etc/sysconfig/jenkins` 进行修改，将用户修改为`root`

```
#修改配置
$JENKINS_USER="root"
```

2、修改目录权限

```
chown -R root:root /var/lib/jenkins
chown -R root:root /var/cache/jenkins
chown -R root:root /var/log/jenkins
```

## 安装其他依赖

1、安装git

```
yum install git
```

2、安装 node

```
curl --silent --location https://rpm.nodesource.com/setup_10.x | sudo bash
yum -y install nodejs
```

3、安装vue

```
npm install -g @vue/cli
```

4、安装 netcore2.1

```
rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm
yum -y install dotnet-sdk-2.1
```

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290814665.jpg)

5、安装docker

```
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
sudo yum-config-manager --enable docker-ce-edge
sudo yum install docker-ce
#启动docker
systemctl start docker
#设置开机启动
chkconfig docker on
```

## 配置 Jenkins 

在之前的文章《 GitLab 配合 Jenkins 打造自动化部署》中介绍过在 Windows 环境下配置 Jenkins，可以作为参考，下面介绍在 CentOS 中的具体步骤：

### 创建相关目录和文件

在 CentOS 中创建相关的目录和文件，创建完后的目录结构如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290814320.jpg)

* build 目录：用来存放构建相关的目录和文件
	* conf.d
		* default.conf：nginx 的配置文件
	* web
		* devops.sh：vue 项目的构建批处理命令
		* Dockerfile：构建 vue 项目到 docker 容器的文件
	* webapi
		* devops.sh：api 项目的构建批处理命令
		* Dockerfile：构建 api 项目到 docker 容器的文件
* code 目录：用来存放 git 拉取的源代码的目录
	* web：vue 前端代码
	* webapi：api 接口代码

build/conf.d/default.conf：

```nginx
server {
    listen       80;
    server_name  10.10.10.10;
    client_max_body_size 100M;
   location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html; 

    }
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

build/web/devops.sh：

```shell
#!/bin/bash
echo "del none images"
docker ps -a | grep "Exited" | awk '{print $1 }'|xargs docker stop
docker ps -a | grep "Exited" | awk '{print $1 }'|xargs docker rm
docker images|grep none|awk '{print $3 }'|xargs docker rmi
echo "container del success"

docker stop web
docker rm web
echo "container web del success"

echo "begin docker build"

if [ ! -d web ]; then
  mkdir -p web
fi

cp /root/jenkins/build/web/Dockerfile ./web
cp -r /root/jenkins/code/web/dist/* ./web

echo "begin docker build"
cd web
docker build -t web .
echo "build end"

docker run -d -p 9001:80 --name web -v /root/jenkins/build/conf.d:/etc/nginx/conf.d:ro  --restart=always  web

cd ..
rm -rf web
```

build/web/Dockerfile：

```
FROM nginx:latest
COPY . /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

build/webapi/devops.sh：

```
#!/bin/bash
echo "del none images"
docker ps -a | grep "Exited" | awk '{print $1 }'|xargs docker stop
docker ps -a | grep "Exited" | awk '{print $1 }'|xargs docker rm
docker images|grep none|awk '{print $3 }'|xargs docker rmi
echo "container del success"

docker stop webapi
docker rm webapi
echo "container webapi del success"

echo "begin docker build"
if [ ! -d web ]; then
  mkdir -p web
fi
cp /root/jenkins/build/webapi/Dockerfile ./web
cp -r /root/code/webapi/myapi/bin/Debug/netcoreapp2.1/publish/* ./web

echo "begin docker build"
cd web
docker build -t webapi .
echo "build end"

docker run -d -p 5000:5000 --restart=always --name webapi webapi
```

build/webapi/Dockerfile：

```
FROM microsoft/dotnet:2.1-aspnetcore-runtime
COPY . /app
WORKDIR /app
EXPOSE 80/tcp
ENTRYPOINT ["dotnet", "myapi.dll"]
```

### 全局配置

配置 git 目录，可以先执行命令 `whereis git` 找到 git 的目录，然后进行设置，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290814181.jpg)

### Vue 项目的配置

1、设置运行目录

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290815398.jpg)

2、构建的命令设置

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290815012.jpg)

### WebAPI 项目的配置

1、设置运行目录

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290815974.jpg)

2、构建的命令设置

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290816363.jpg)



