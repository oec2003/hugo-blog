---
title: CentOS7 中使用 Supervisor 部署 dotNET Core 程序
date: 2020-12-28T09:43:34+08:00
categories: [技术]
tags: [dotNET Core,CentOS7,Supervisor]
---

在 CentOS 中部署 dotNET Core 程序，我们通常会使用 Docker ，方便快捷，版本更新也非常方便，但有时客户要求直接在服务器上进行 dotNET Core 程序的部署，这时就需要使用守护进程，本文就介绍使用守护进程 Supervisor 进行 dotNET Core 程序的部署。

<!--more-->

## Supervisor 安装

在 CentOS 中安装 Supervisor 非常简单，执行下面命令：

```jsx
yum install supervisor
```

安装成功后，会生成 `/etc/supervisord.conf` 配置文件和 `/etc/supervisord.d/` 目录。我们也可以使用下面命令查看 supervisor  是否安装成功：

```jsx
ps aux | grep supervisord
```

正常如下图：

![](http://fwhyy.com/img/post/2020/Xnip2021-10-13_07-48-28.png)

## 编辑配置文件

使用命令 `vi /etc/supervisord.conf` 进行配置文件的编辑，主要修改下面两处：

1、修改 inet_http_server  节点，该节点配置好后，可以有图形化界面来对进程进行维护。

![](https://img.fwhyy.com/2022/202201290620382.webp)

- 去掉每行前面的分号，分号表示注释；
- port：服务器的 ip 和访问的端口；
- username：web 界面的登录用户名；
- password：web 界面的登录密码。

配置完成后，启动启动 服务

```jsx
supervisord -c /etc/supervisord.conf
```

启动后访问的界面如下图：

![](https://img.fwhyy.com/2022/202201290620396.webp)

2、修改配置文件最后的 [include] 节点，默认情况下为 ini 文件，修改为 conf

```jsx
[include]
files = supervisord.d/*.conf
```

## 添加需要被守护的程序

编写一个 dotNET Core 程序，将发布后的目录复制到服务器上，比如目录为：/home/fengwei/supervisordemo 

在 `/etc/supervisord.d/` 目录中添加 `demo.conf` 文件，内容如下：

```jsx
[program:demoserver]
command=dotnet /home/fengwei/supervisordemo/SupervisorDemo.dll 
autostart=true
autorestart=true
stderr_logfile=/home/fengwei/supervisordemo/supererrorlog/demo.err.log
stdout_logfile=/home/fengwei/supervisordemo/superlog/demo.out.log
environment=ASPNETCORE_ENVIRONMENT=Production
user=root
```

- command：启动程序执行的命令
- autostart：supervisord 启动时是否启动程序
- autorestart：程序异常退出后是否自动重启
- stderr_logfile：错误日志
- stdout_logfile：正常执行中的日志
- environment：指定环境变量
- user：以什么用户运行

配置好 `demo.conf` 文件后，执行 `supervisorctl reload` 进行重启就可以生效了。当修改了程序重新发布后，可以执行 `supervisorctl restart demoserver` 进行重启， `demoserver`为 `demo.conf` 文件中指定的 `program` 的名称。

## 守护多个进程

在 Supervisor 中，也可以通过配置的方式将一个程序以多进程的方式启动，比如需要部署 MQ 的消费者时就非常有用，具体配置如下：

![](https://img.fwhyy.com/2022/202201290620275.webp)

- process_name：定义进程的名称
- numprocs：启动的进程的数量

启动后的效果如下：

![](https://img.fwhyy.com/2022/202201290620749.webp)

## 常用命令

```bash
# 启动Supervisor服务
supervisord -c /etc/supervisord.conf
# 查看进程启动情况
ps aux | grep supervisord
# 查看所有服务的状态
supervisorctl status
# 重新加载配置文件，新加的服务会启动，原服务会重启
supervisorctl reload
# 重新加载配置文件，新加的服务会启动，原服务不会重启
supervisorctl update
# 启动指定的服务 demoserver
supervisorctl start demoserver
# 重启指定的服务 demoserver
supervisorctl restart demoserver
# 停用指定的服务 demoserver
supervisorctl stop demoserver
# 启动所有服务
supervisorctl start all
# 重启所有服务
supervisorctl restart all
# 停用所有服务
supervisorctl stop all
```

希望本文对您有所帮助！