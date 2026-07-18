---
title: 在Linode上的Ubuntu12.04中搭建Hexo
date: 2016-09-02T06:42:53+08:00
categories: [成长]
tags: [Linode,Hexo,Ubuntu,博客]
---

自从接触了Markdown后就喜欢上了，写博客自然也就想使用Markdown，但Wordpress中的Markdown插件都不怎么好用。找了很久终于找了一个在当时感觉还不错的方法，使用马克飞象写然后导出成Html在Wordpress的后台进行发布，具体参见《[WordPress使用Markdown](http://fwhyy.com/2015/06/use-markdown-in-wordpress/)》。虽然效果还不错但操作起来比较繁琐，所以经过一番折腾，使用Hexo代替了Wordpress，本文主要讲下怎样在Linode中搭建Hexo。

如果您还不知道Linode和Hexo是什么，自行Google之，本文不做介绍。

2015年初在Linode购买了VPS，机房自然选择了亚洲的东京机房。安装的Ubuntu12.04的操作系统，因为对Linx系统不熟，选择了最省事的[lnmp](http://lnmp.org/) 。lnmp中自带nginx，所以Hexo的部署也就使用nginx做为服务器。
<!--more-->
## 服务器安装Nodejs

Hexo是使用Nodejs写的，运行Hexo需要Nodejs环境，安装最新版Nodejs执行如下命令：

```
apt-get update  
apt-get install -y python-software-properties software-properties-common  
add-apt-repository ppa:chris-lea/node.js  
apt-get update  
apt-get install nodejs  
```

## 服务器安装Git

Git是用来在服务端配置Git Hook，以便在客户端可以实现文章一键发布。Git安装命令如下：

```
sudo apt-get install git

```

### 添加git账户

```
sudo adduser git
```

### 公钥绑定

在本地使用git命令创建公钥，我使用的是Mac，公钥的路径为`~/.ssh/id_rsa.pub`，将公钥的内容添加到服务器上的`/home/git/.ssh/authorized_keys`文件中。关于生成公钥文件`id_rsa.pub`可以[参考](http://my.oschina.net/gal/blog/141442)

### 服务器端创建Git仓库

服务端端Git仓库目录为`/var/repo/hexoblog.git`，先创建目录，然后使用Git命令来初始化库，代码如下：

```
$ sudo mkdir /var/repo
$ cd /var/repo
$ sudo git init --bare hexoblog.git
```

### 配置Git Hook

Git Hook简单理解就是当代码Push到服务器上后会自动执行一个自定义的脚本，详细请[参考](https://git-scm.com/book/zh/v2/%E8%87%AA%E5%AE%9A%E4%B9%89-Git-Git-%E9%92%A9%E5%AD%90)

在这里要使用的是post-receive，post-receive的详细解释：
> post-receive 挂钩在整个过程完结以后运行，可以用来更新其他系统服务或者通知用户。 它接受与 pre-receive 相同的标准输入数据。 它的用途包括给某个邮件列表发信，通知持续集成（continous integration）的服务器，或者更新问题追踪系统（ticket-tracking system） —— 甚至可以通过分析提交信息来决定某个问题（ticket）是否应该被开启，修改或者关闭。 该脚本无法终止推送进程，不过客户端在它结束运行之前将保持连接状态，所以如果你想做其他操作需谨慎使用它，因为它将耗费你很长的一段时间。

在上面创建的hexoblog.git目录中创建post-receive文件，代码如下：

```
$ cd /var/repo/hexoblog.git/hooks
$ vim post-receive
```

post-receive文件的内容如下：

```
#!/bin/bash -l
GIT_REPO=/var/repo/hexoblog.git
TMP_GIT_CLONE=/var/tmp/hexoblog
PUBLIC_WWW=/home/wwwroot/home.fwhyy.com
rm -rf ${TMP_GIT_CLONE}
git clone $GIT_REPO $TMP_GIT_CLONE
rm -rf ${PUBLIC_WWW}/*
cp -rf ${TMP_GIT_CLONE}/* ${PUBLIC_WWW}
```

上面的代码有对服务器目录的写操作，需要给相关的权限才能正常写入：

```
sudo chmod 777 home.fwhyy.com
```

关于权限详细参考：[http://blog.csdn.net/mzy202/article/details/7178586](http://blog.csdn.net/mzy202/article/details/7178586)

## 创建虚拟主机

lnmp创建的配置文件路径为：`/usr/local/nginx/conf/vhost`
在该路径下创建文件`home.fwhyy.com.conf`，该文件内容如下：

```
server {                                                                               
    listen 80 ;                                                                                               
    root /home/wwwroot/home.fwhyy.com;                                                        
    server_name home.fwhyy.com;                                                 
    access_log  /var/log/nginx/blog_access.log;                                    
    error_log   /var/log/nginx/blog_error.log;                                            
    location ~* ^.+\.(ico|gif|jpg|jpeg|png)$ {                            
            root /home/wwwroot/home.fwhyy.com;                                    
            access_log   off;                 
            expires      1d;                            
        }                                                                              
    location ~* ^.+\.(css|js|txt|xml|swf|wav)$ {                                   
        root /home/wwwroot/home.fwhyy.com;                                                        
        access_log   off;                                                          
        expires      10m;                                                          
    }                                                                              
    location / {                                                                   
        root /home/wwwroot/home.fwhyy.com;                                                
        if (-f $request_filename) {                                            
            rewrite ^/(.*)$  /$1 break;                                    
        }                                                                      
    }                                                                              
}
```

### 重启lnmp

```
/root/lnmp restart
```

## 本地配置

1. 安装Nodejs
2. 安装Hexo

```
npm install hexo-deployer-git --save
```

3. Hexo根目录下的_config.yml文件的配置如下：

![](http://blog.fwhyy.com/img/post/14727700421219.jpg)

repo格式：git@服务器IP:服务器git库地址

## 写博客流程

1. 在iTerm中使用`hexo n 'new post name'`来创建一篇博客；
2. 使用[MWeb](http://zh.mweb.im/)外部文档进行博客的编写，关于MWeb后面会单独开篇来介绍；
3. 在iTerm中使用`hexo g`来生成博客；
4. 在iTerm中使用`hexo s`来启动服务，可以在本地使用http://localhost:4000预览博客；
5. 在iTerm中使用`hexo d`部署到服务器。

## 参考

[http://www.swiftyper.com/2016/04/17/deploy-hexo-with-git-hook/](http://www.swiftyper.com/2016/04/17/deploy-hexo-with-git-hook/)
[http://www.baseproapp.com/2016/02/01/%E5%9C%A8VPS%E4%B8%8A%E9%85%8D%E7%BD%AEhexo%E5%8D%9A%E5%AE%A2/](http://www.baseproapp.com/2016/02/01/%E5%9C%A8VPS%E4%B8%8A%E9%85%8D%E7%BD%AEhexo%E5%8D%9A%E5%AE%A2/)
[http://ibruce.info/2013/11/22/hexo-your-blog/](http://ibruce.info/2013/11/22/hexo-your-blog/)
[http://blog.csdn.net/mzy202/article/details/7178586](http://blog.csdn.net/mzy202/article/details/7178586)
[https://git-scm.com/book/zh/v2/%E8%87%AA%E5%AE%9A%E4%B9%89-Git-Git-%E9%92%A9%E5%AD%90](https://git-scm.com/book/zh/v2/%E8%87%AA%E5%AE%9A%E4%B9%89-Git-Git-%E9%92%A9%E5%AD%90)

