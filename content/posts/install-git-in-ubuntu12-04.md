---
title: Ubuntu12.04中安装Git
date: 2014-02-23
categories: [技术]
tags: [Git, Linux, Ubuntu]
---

Git是一个分布式源码管工具，在之前的[文章](http://blog.fwhyy.com/category/jishu/git/)中有讲到过怎样在Windows下使用Git和在VS中使用Git，最近在尝试在Ubuntu中搭建Gitlab环境，Linux系统也是初次接触，属于摸索中前进，先说说在Ubuntu中怎样安装Git

1、首先可以通Ctrl+Alt+T快捷键打开终端；

2、输入命令sudo apt-get git，使用该命令安装的git是比较老的版本；

3、安装了老的版本的git后，可以使用git clone git://git.kernel.org/pub/scm/git/git.git将获取到git的源码，默认会签出最近的版本；

4、使用git tag可以查看所有的历史版本，可以用git checkout version来签出指定版本进行安装，例如：git checkout v1.9.0；

5、在编译安装前先要安装ssl编译开发包，使用sudo apt-get install libssl-dev；

6、用cd命令进入到git目录，执行make prefix=/usr/local all doc进行编译；

7、使用sudo make prefix=/usr/local install install-doc install-html进行安装；

8、安装完后，重新打开终端，使用git –version来查看安装是否成功。

