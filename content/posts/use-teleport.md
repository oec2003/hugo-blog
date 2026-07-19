---
title: Teleport 开源堡垒机的使用
date: 2021-03-08T21:45:52+08:00
categories: [技术]
tags: [Nexus,包管理]
---

公司的服务器可能会存在这样一种情况，具体的应用是部署在很多的内网服务器上，然后由一台外网服务器通过代理的方式对外提供服务，例如下图：

<!--more-->

![iShot2022-02-01 21.57.48](https://img.fwhyy.com/2022/20220201215748.webp)

我们如果需要进入到内网服务器进行操作就必须先要进入外网服务器，然后再远程到内网服务器，这样会比较麻烦，而且当需要使用的操作服务器的人变多时，也不是很安全。所以我们期望的是能通过某种方式直接进入到内网服务器进行操作。

使用 Teleport 堡垒机可以很轻松达到这个目的。

## 安装

安装直接按照官方文档一步步操作就可以了，文档地址如下：

https://docs.tp4a.com/install/

安装成功如下图：

![iShot2022-02-01 21.59.17](https://img.fwhyy.com/2022/202202012159728.webp)

特别注意，如果您的服务器有开防火墙，需要使用下面命令进行相关端口的开放，这个是官方文档中没有提到的：

```bash
firewall-cmd --zone=public --add-port=7190/tcp --permanent
firewall-cmd --zone=public --add-port=52080/tcp --permanent
firewall-cmd --zone=public --add-port=52089/tcp --permanent
firewall-cmd --zone=public --add-port=52189/tcp --permanent
firewall-cmd --reload
```

进入系统进行简单配置就可以使用了：

![iShot2022-02-01 21.59.46](https://img.fwhyy.com/2022/202202012200059.webp)

## 添加资源和分配权限

1、在主机及账号模块添加主机和账号

![iShot2022-02-01 22.00.15](https://img.fwhyy.com/2022/202202012200787.webp)

- 远程主机地址：填写内网服务器的 IP
- 连接模式：选择直接连接

2、点击列表中「账号数」来进行服务器账号的设置

![iShot2022-02-01 22.00.49](https://img.fwhyy.com/2022/202202012201466.webp)

3、在用户管理模块进行使用人员账户的添加。

4、在「运维授权」模块创建授权策略。

![iShot2022-02-01 22.01.14](https://img.fwhyy.com/2022/202202012201617.webp)

## 运维人员使用

1、管理员添加账号后，会填写邮箱地址，系统会给邮箱发送初始密码，登录后在「主机运维」模块可以看到被授权的资源：

![iShot2022-02-01 22.01.45](https://img.fwhyy.com/2022/202202012201201.webp)

- SSH：命令行的方式进入系统
- SFTP：通常用于传输文件等

首次点击 SSH 或 SFTP 时会弹出如下提示，是因为还没有安装客户端助手：

![iShot2022-02-01 22.02.07](https://img.fwhyy.com/2022/202202012202422.webp)

根据提示中的链接下载客户端助手，进行安装，安装完点击「助手设置」进行设置。

2、Windows 系统中我们常用的 SSH 和 SFTP 工具是 putty 和 Winscp ，在 Teleport 提供了默认支持：

![iShot2022-02-01 22.02.28](https://img.fwhyy.com/2022/202202012202028.webp)

3、在 Mac 系统中我常用的是 Termius 和 Transmit 但这两个的配置参数暂时还没搞明白怎么配置，所以，还是得用默认支持的 iTerm2 和 FileZilla 。

![iShot2022-02-01 22.03.02](https://img.fwhyy.com/2022/202202012203486.webp)

4、设置完成后，在点击「主机运维」模块中主机的  SSH  和 SFTP，出现下面界面说明登录成功：

![iShot2022-02-01 22.03.45](https://img.fwhyy.com/2022/202202012203705.webp)

## 常用命令

```bash
sudo /etc/init.d/teleport start(启动)
sudo /etc/init.d/teleport stop(暂停)
sudo /etc/init.d/teleport restart(重启)
sudo /etc/init.d/teleport status(查看运行状态)
```

希望文本对您有所帮助！
