---
title: CentOS7安装GitLab
date: 2018-05-27T22:18:21+08:00
categories: [技术]
tags: [CentOS, GitLab]
---

一直以来源代码一直都放在码云上，但最近码云开始收费了，免费版本的私有项目的成员限制在5个，这远远不够用了。所以需要搭建自己的Git服务器，下面内容为安装经过，记录一下：

<!--more-->

## 环境

* CentOS：7.4
* GitLab：10.6.4

## 安装CentOS7

1、从[http://isoredirect.centos.org/centos/7/isos/x86_64/CentOS-7-x86_64-DVD-1708.iso](http://isoredirect.centos.org/centos/7/isos/x86_64/CentOS-7-x86_64-DVD-1708.iso)下载CentOS的ios镜像文件。

2、在Windows Server 2012的Hypter-v中安装CentOS，参考[https://blog.csdn.net/chris_111x/article/details/52313797](https://blog.csdn.net/chris_111x/article/details/52313797)

3、新安装好的系统是不能上网的，需要对/etc/sysconfig/network-scripts/目录下的相关文件进行配置：
![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201260831421.jpg)

4、执行`vi ifcfg-eth0`编辑该文件，如下图：
![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201260831741.jpg)

* BOOTPROTO的值由dhcp修改为static
* ONBOOT如果为no，就修改为yes
* IPADDR：外网IP地址
* GATEWAY：默认网关
* NETMASK：子网掩码
* DNS1:DNS地址1
* DNS2:DNS地址2

5、修改完后执行`:wq`进行保存退出，执行`systemctl restart network`重新启动网络服务，这时再ping下百度，如果出现下图内容表示网络已经通了。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201260831119.jpg)

6、如果是初次接触Linux，可能会出现各种状况，根据提示信息进行Google，总会找到答案。

## 安装Gitlab

> GitLab 是一个利用Ruby on Rails 开发的开源版本控制系统，实现一个自托管的Git项目仓库，可通过Web界面进行访问公开的或者私人项目。
> 它拥有与GitHub类似的功能，能够浏览源代码，管理缺陷和注释。可以管理团队对仓库的访问，它非常易于浏览提交过的版本并提供一个文件历史库。团队成员可以利用内置的简单聊天程序（Wall）进行交流。它还提供一个代码片段收集功能可以轻松实现代码复用，便于日后有需要的时候进行查找。

1、根据GitLab官网提供的步骤一步一步执行命令即可，[https://www.gitlab.com.cn/installation/#centos-7](https://www.gitlab.com.cn/installation/#centos-7)

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201260831375.jpg)

2、上图中红框部分是一个指定的是gitlab-ee的版本，gitlab有两个版本：gitlab-ce和gitlab-ee，分别是社区版和企业版，企业版是收费的，社区版是开源的，通常我们安装社区版就可以，所以此处需要将gitlab-ee修改为gitlab-ce。

3、在执行`yum install -y gitlab-ce`前，先修改下镜像地址，默认为国外的镜像地址，下载会非常慢，修改镜像地址方法如下：

3.1、创建/etc/yum.repos.d/gitlab-ce.repo文件，文件内容如下：

```
[gitlab-ce]
name=Gitlab CE Repository
baseurl=https://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/yum/el$releasever/
gpgcheck=0
enabled=1
```

3.2、执行下面命令进行安装

```
yum makecache   # 更新本地YUM缓存
yum install gitlab-ce    # 自动安装最新版本
```

4、安装完成后修改`/etc/gitlab/gitlab.rb`文件进行域名绑定

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201260832305.jpg)

5、重新配置GitLab使之生效

```
gitlab-ctl reconfigure
```

6、如果您之前根据官方的命令不小心安装了gitlab-ee的版本，想要换成gitlab-ce，就需要将装好的gitlab-ee进行卸载，卸载方法如下：

6.1、首先停止gitlab

```
gitlab-ctl stop
```

6.2、卸载gitlab-ee

```
rpm -e gitlab-ee
```

6.3、查看gitlab进程

```
ps aux | grep gitlab
```

6.4、杀掉进程（应该为列表的第一个，带很多......的gitlab进程）

```
kill -9 1278
```

6.5、删除所有包含gitlab文件

```
find / -name gitlab | xargs rm -rf
```

7、卸载完成重新安装了gitlab-ce后，执行`gitlab-ctl reconfigure`命令时，会出现`ruby_block[supervise_redis_sleep] action run`，会一直卡无法往下进行，此时需要按`Ctrl+c`强制退出，然后依次执行如下命令可以解决：

```
sudo systemctl restart gitlab-runsvdir
sudo gitlab-ctl reconfigure
```



