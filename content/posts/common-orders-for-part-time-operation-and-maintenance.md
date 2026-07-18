---
title: “兼职”运维的常用命令
date: 2019-11-18T23:49:54+08:00
categories: [技术]
tags: [Docker,运维]
---

自从产品转到了 dotNET Core 之后，更深入的接触 Linux和 Docker ，而我每天的工作中，有一部分时间相当于在“兼职”做一些运维的事情。下面是一些在日常中常用的命令，算是个备忘吧。

<!--more-->

## 环境

* 操作系统：CentOS7
* Docker：18.05.0-ce
* MySQL: 8

测试环境的服务器部署很简单，一台公网服务器，后面有若干台内网服务器，程序部署在内网服务器，通过公网服务器反向代理进行访问。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280643303.jpg)

## 场景一：将外网数据库备份到内网进行排错

```
ssh root@221.221.221.1 #进入外网服务器
ssh root@10.10.10.1 #进入内网服务器
docker exec -it mysql容器id bash #进入mysql容器
mysqldump -uroot -pPassword -R dbname > db.sql #备份数据库
exit #退出容器
docker cp mysql容器id:/db.sql /root/  #将备份文件从容器拷贝到虚拟机的root目录
exit #从内网服务器退出到外网服务器
scp root@10.10.10.1:/root/db.sql /root/  #将备份文件从内网拷贝到外网服务器的root目录

ssh root@192.168.16.110 # 进入内网服务器
scp root@221.221.221.1:/root/db.sql /root/ #将外网服务器的备份文件拷贝到内网服务器
docker cp db.sql mysql容器id:/ #将备份文件拷贝到mysql容器内
docker exec -it mysql容器id bash #进入mysql容器内
mysql -uroot -pPassword dbname < db.sql #还原数据库
exit #退出容器
```

## 场景二：CentOS 防火墙相关

```
systemctl status firewalld.service #查看防火墙状态
systemctl start firewalld.service #启用防火墙
systemctl stop firewalld #停用防火墙
systemctl disable firewalld #开机禁用
systemctl enable firewalld #开机启用

firewall-cmd --permanent --list-port #查看已开放端口列表

firewall-cmd --zone=public --add-port=80/tcp --permanent #开放80端口
firewall-cmd --zone= public --remove-port=80/tcp --permanent #关闭80端口

firewall-cmd --reload #重新状态防火墙
```

## 场景三：CentOS 系统常用

```
ls #查看目录文件
cp app.json /root/app # 赋值文件app.jsond到app目录
cp -r  #赋值目录
vi #编辑文件
chmod 777 /root/app.json #设置文件权限
top  #查看cup 内存
df -h  #查看硬盘
du -sh *  #查看当前目录文件大小的详细列表
systemctl restart network #重启网络
rm #删除文件
```

## 场景四：CentOS 安装 vsftpd（特定用户访问特定目录）

1、安装vsftpd

```
yum -y install vsftpd
```

2、启动ftp服务

```
systemctl start vsftpd.service
```

3、禁用匿名用户访问,执行`vi /etc/vsftpd/vsftpd.conf`,修改配置文件

```
anonymous_enable=NO
```

4、添加用户

```
useradd -d /home/oec2003 oec2003 #增加用户oec2003，并指定oec2003用户的主目录为/home/oec2003
 
passwd oec2003 #为用户oec2003设置密码，运行后输入两次相同密码
```

5、修改配置文件 /etc/vsftpd/vsftpd.conf

```
chroot_local_user=YES
allow_writeable_chroot=YES
chroot_list_enable=YES
chroot_list_file=/etc/vsftpd/chroot_list
```

在`/etc/vsftpd/chroot_list`这个配置文件中添加用户，每个用户写在一行，则在这个文件里的用户登录ftp后，可以访问上级目录，而不在这个配置文件中的用户只能访问添加用户时指定的home目录。

## 场景五：CentOS 服务器之间免密码登录

假设现在有两条服务器 10.10.10.1 和 10.10.10.2 ，现在想在 10.10.10.1 服务器上免密码登录 10.10.10.2 ，步骤如下：

1、在 10.10.10.1 上创建秘钥

```
ssh-keygen -t rsa -C "oec2003@qq.com"
```

创建完成后，在 .ssh 的隐藏目录中会有两个文件 id_rsa (私钥)、id_rsa.pub (公钥)文件

2、用 ssh-copy-id 把公钥复制到 10.10.10.2

```
ssh-copy-id -i /root/.ssh/id_rsa.pub root@10.10.10.2
```

3、修改 10.10.10.2 的配置文件 /etc/ssh/sshd_config

```
AuthorizedKeysFile	.ssh/authorized_keys
PubkeyAuthentication yes #打开免密码设置
```

4、重启 sshd 服务

```
service sshd restart
```

## 场景六：使用 Nginx 代理 MySQL

MySQL 的容器部署在内网服务器，有时我们需要在本地能直接连接 MySQL ，这时就需要使用 Nginx 来做反向代理。

现在在 10.10.10.1 服务器上部署有 MySQL 容器，端口为 3306 ，代理的配置方式如下：

1、在外网服务器的 221.221.221.1 服务器的 root 目录创建配置文件 nginx.conf，内容如下

```
# 上面部分的内容就是nginx.conf文件的内容，在http节点同级添加stream节点，如下
...
stream {
    upstream mysql {
        hash $remote_addr consistent;
        server 10.10.10.1:3306 max_fails=3 fail_timeout=30s;
    }
    server {
        listen 33306;
        proxy_connect_timeout 30s;
        proxy_timeout 600s;
        proxy_pass mysql;
    }
}
```

2、创建代理容器

```
docker run -d -p 33306:33306 --name mysql  -v /root/nginx.conf:/etc/nginx/nginx.conf --restart=always  nginx:latest
```

现在就可以在客户端通过IP 221.221.221.1 和端口 33306 来进行数据库连接了。

## 场景七：空间清理

服务器运行一段时间后，空间会越来越小，可以通过下面的一些命令来辅助清理空间

### Docker

```
docker system df -v #可用于查询镜像（Images）、容器（Containers）和本地卷（Local Volumes）等空间使用大户的空间占用情况
docker system prune #自动清理容器

```

### ContOS 文件

```
du -sh * | sort -nr #查看当前目录文件大小，有排序
du -s * | sort -nr | head
du -s * | sort -nr | tail
```

### MySQL

```
show binary logs; #查看日志占用
reset master; #清理日志
```

