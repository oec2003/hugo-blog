---
title: Linode VPS之旅
date: 2015-01-12
categories: [成长]
tags: [Linode, VPS, 博客]
---

2010年申请域名[fwhyy.com](http://fwhyy.com/)，开始搭建独立博客，考虑到VPS的费用过高，当时选择的是易网库的香港主机。这一用就是4年，期间也出现过一些问题、客户响应速度和态度都还算可以，总体评价中规中矩吧。直到最近想把女儿的站点搭起来的时候，才发现我主机空间只支持2个MySql的数据库，跟客服交涉过几次，想将空间中我没有用到的MSSql减少一个，将MySql添加一个，得到的反馈都是要么花钱购买一个MySql，要么升级套餐。无奈之下只好选择搬家了。在朋友推荐下，果断选择了Linode VPS，按我那位朋友的说法，Linode是他用过的最好的VPS，没有之一。

## 更换IP

使用VPS就意味着一切都得自己来折腾，从安装系统（当然是Linux）、安装软件、部署WordPress等等。在Linode中注册、安装都很顺利，成功安装ubuntu系统后，发现只能在翻墙的状态下才能SSH连接到系统中。肯定是之前使用此IP的朋友做过一些和谐的事情，在朋友的指导下得知需要在系统后台中提交ticket申请更换ip，使用蹩脚的英文经过几番交涉之后终于换ip成功。

## 安装软件

VPS就像是一个毛坯房，就只有一个空间，什么东西都得靠自己来装，Linux系统之前也接触的很少，所以说没有一颗折腾的心还是不要玩VPS。因为第一次玩VPS，为了降低难度，系统选择的是Ubuntu，这个是在Linode上使用的最多的Linux发行版。架构选择的是LNMP一键安装包，没别的原因就是因为省事。LNMP的使用可以参考下面链接：

[http://lnmp.org/install.html](http://lnmp.org/install.html)

接下来就是做一些基本的配置：

1. 更新源

```
sudo apt-get update
```

2. 生成语言包

```
sudo locale-gen --lang zh_CN.UTF-8
```

3. 校正时区

```
sudo dpkg-reconfigure tzdataWordpress 
```

4. 设置权限

```
chmod -R 777 /home/wwwroot/www.fengzihan.me/
chown -R www /home/wwwroot/www.fengzihan.me/
```

5. 添加虚拟主机

[http://lnmp.org/faq/lnmp-vhost-add-howto.html](http://lnmp.org/faq/lnmp-vhost-add-howto.html)

6. Nginx下Wordpress只显示一个主题

```
# 编辑php.ini文件，找到disable_functions ，将其后面的函数列表中的scandir删除
vi /usr/local/php/etc/php.ini
# 重启php服务，执行下面命令
/etc/init.d/php-fpm restart
http://www.weisay.com/blog/nginx-wordpress-scandir.html
```

7. 修改root密码

```
sudo passwd root
```

8. 安装FTP

```
1. 安装vsftpd
sudo apt-get install vsftpd

2. 启动、停止、重启服务
service vsftpd start | stop | restart

3. 添加用户为fengwei的账户，可以方位home目录
useradd fengwei -g ftp -d /home

4. 为fengwei这个账户设置密码
passwd fengwei

5. 修改配置文件
vi /etc/vsftpd.conf
```

[http://blog.csdn.net/shuimuzhiyuan/article/details/8548927](http://lnmp.org/faq/lnmp-vhost-add-howto.html)
[http://www.blogjava.net/stonestyle/articles/369104.html](http://www.blogjava.net/stonestyle/articles/369104.html)

9. 修改mysql上传文件大小

```
find / -name php.ini
usr/local/php/etc/php.ini
vi /usr/local/php/etc/php.ini
```

## 后记

最后说明下，本文不是一篇入门级教程，只是我初玩VPS的一点记录，一些相关的步骤也在文中给出了参考链接。在一切都安装妥当后的某一天早晨，突然发现博客不能访问了，首先ping了下ip，发现还能ping通，心里石头落下了一半，马上登录到Linode后台准备提交ticket，没想到在后台已经收到了一条客服发来的ticket，大概意思就是发现我VPS的硬盘有故障，正在排查，几分钟后网站恢复正常，对Linode的及时响应速度和处理问题的能力点个赞。

