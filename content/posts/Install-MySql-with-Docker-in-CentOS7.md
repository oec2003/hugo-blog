---
title: 在CentOS7中使用Docker安装MySql
date: 2018-05-18T22:31:14+08:00
categories: [技术]
tags: [MySql, Docker]
---

## 环境

 * CentOS：7.4
 * Docker: 1.13.1
 * MySql: 8.0.11

 <!--more-->

## 下载镜像

在[https://hub.docker.com](https://hub.docker.com)，搜索mysql，结果如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201260656388.jpg)

选择上图红框的镜像，执行下面命令进行镜像的安装

```
docker pull mysql/mysql-server
```

## 启动MySql容器

执行下面命令来启动容器

```
docker run -d -p:3307:3306 --name mysqltest mysql/mysql-server
```

容器启动成功后，这时还不能通过工具连接到MySql，需要进入到MySql中进行相关的设置。

## 设置MySql

首先执行下面命令查看容器日志，找到MySql的root账户的密码

```
docker logs mysqltest
```

找到下图红框部分就是root账户的密码

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201260656301.jpg)

执行下面命令进入到容器中，进入容器又很多中方法，参考[https://www.cnblogs.com/xhyan/p/6593075.html
](https://www.cnblogs.com/xhyan/p/6593075.html)

```
docker exec -it mysqltest bash
```

再执行命令进入到MySql中

```
mysql -uroot -p
```

会提示输入密码，密码为上图中的红框部分的密码，如果看到下图欢迎界面表示密码正确，已经进入到MySql的环境中了
![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201260656930.jpg)

修改root账户密码，网上有不少修改密码的Sql语句如下

```
SET PASSWORD FOR 'root'@'localhost' = PASSWORD('password123');
```

但上面的语句在MySql8.0.11版本中会报错

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201260657966.jpg)

如果您的版本和我一样，请执行下面代码来修改root密码

```
alter user 'root'@'localhost' identified by 'password123';
```

修改完root密码后，可以使用下面代码切换到mysql数据库

```
use mysql
```

查看下用户信息

```
select user,host from user
```

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201260657312.jpg)

可以看到root的host为localhost，说明root账户不能被外部连接，现在来创建一个新的用户，并赋相关的权限让外部可以连接，一次执行下面语句

```
CREATE USER 'fengwei'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON *.* TO 'fengwei'@'localhost' WITH GRANT OPTION;
CREATE USER 'fengwei'@'%' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON *.* TO 'fengwei'@'%' WITH GRANT OPTION;
```

执行两次`exit`命令回到CentOS中，执行下面命令重启MySql容器，在容器重启的过程中MySql也就重启了

```
docker restart mysqltest
```

此刻我们使用Sqlyog来连接该容器了测试下，发现会报如下错误

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201260657671.jpg)

执行命令进入到容器中的MySql中，执行下面的Sql语句

```
ALTER USER 'fengwei'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password123';
```

再用SQLyog测试下

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201260657774.jpg)

## 总结

本文介绍的方法虽然最终可以连接成功，但MySql的配置文件和数据都在容器内，如果由于配置原因导致容器无法启动，数据内容将会丢失，所以更好的做法是将配置文件和数据存储挂接到宿主机中，下一篇讲介绍怎样在MySql的容器中讲配置文件和数据目录挂接到宿主机中。

