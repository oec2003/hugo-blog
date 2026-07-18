---
title: Windows 下使用Git管理Github项目
date: 2012-02-06
categories: [技术]
tags: [Git, Github]
---

## Git

Git是一个开源的分布式版本控制系统，用以有效、高速的处理从很小到非常大的项目版本管理。最初由Linus Torvalds编写，用作Linux内核代码的管理。在推出后，Git在其它项目中也取得了很大成功，尤其是在Ruby社区中。

## Github

Github是一个面向开源及私有软件项目的托管平台，因为只支持Git作为唯一的版本库格式进行托管，故名GitHub。GitHub可以托管各种git库，并提供一个web界面，但与其它像 [SourceForge](http://www.oschina.net/p/sourceforge)或[Google Code](http://www.oschina.net/p/googlecode)这样的服务不同，GitHub的独特卖点在于从另外一个项目进行分支的简易性。为一个项目贡献代码非常简单：首先点击项目站点的“fork”的按 钮，然后将代码检出并将修改加入到刚才分出的代码库中，最后通过内建的“pull request”机制向项目负责人申请代码合并。

上面的介绍摘自oschina.net ,下面就开始介绍在windows下怎样用Git管理Github的项目

1 在[Github](https://github.com/)上创建账号，这个很简单就不再赘述。

2 下载安装Git

下载地址：[http://code.google.com/p/msysgit/downloads/list](http://code.google.com/p/msysgit/downloads/list)

安装很简单，一路Next就可以了。

3 登陆GitHbu后创建一个新的仓库（New repository），命名为HelloWorld，创建成功后如下图：

![2012-02-06_220858](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290716529.jpg)

4 上面只是创建了一个空的代码仓库，下面就在本地创建一个HelloWorld的项目，并将其推送到Github中。创建D:\GitProject\HelloWorld的目录结构。

5 打开Git的命令行Git base，输入如下命令来提供身份标示，主要是用户名和邮箱：

![2012-02-06_221545](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290716745.jpg)

6 同过cd命令进入到刚才创建的HelloWorld目录中，然后使用git init来初始化当前目录，该目录中会生成一个.git的隐藏目录:

![2012-02-06_222338](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290717696.jpg)

7 在D:\GitProject\HelloWorld目录中添加一个readme.txt文件，文件中写入“my first hello world project!”，然后用git add 命令以及git commit命令将其添加到库中。

![2012-02-06_223250](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290717852.jpg)

8 下面就是最关键的步骤了，将本地的代码库提交到Github中，首先要使用命令来创建密匙，该密匙会在Github的设置中用到。

![2012-02-06_223734](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290717747.jpg)

9 我系统是windows server 2008R2 ，生成的密匙在C:\Users\Administrator\.ssh目录下，打开id_rsa.pub文件，复制里面所有内容。

10 在Github中点击“Account Settings”进入到设置界面，选择“SSH Public Keys”,然后点击”add another public key“

![2012-02-06_224654](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290717142.jpg)
![2012-02-06_224737](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290717518.jpg)

11 将刚才复制的密匙内容粘贴到对应的框中。

![2012-02-06_225104](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290718778.jpg)

12 用命令来检验下是否设置成功

![2012-02-06_230129](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290718000.jpg)

13 现在一切就绪，在Git base 中使用命令就可以将本地代码推送到Github

![2012-02-06_230614](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290718820.jpg)

14 现在刷新下在Github中的项目页面，如下所示：

![2012-02-06_230744](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290718295.jpg)

## 学习资料

[http://www.worldhello.net/gotgithub/index.html](http://www.worldhello.net/gotgithub/index.html)
[http://www.cnblogs.com/wojilu/](http://www.cnblogs.com/wojilu/)
[Pro Git中文版下载](http://download.csdn.net/detail/oec2003/4048166)
[一个还不错的Git ppt介绍](http://www.slideshare.net/josephj/git-the-social-coding-system)

