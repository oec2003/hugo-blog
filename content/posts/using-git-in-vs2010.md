---
title: 在VS2010中使用Git【图文】
date: 2012-11-13
categories: [技术]
tags: [Git, Github, vs2010, 源码管理]
---

## 前言

在之前的一片博客《[Windows 下使用Git管理Github项目](http://blog.fwhyy.com/2012/02/use-git-manage-github-project-on-windows/)》中简单介绍了在Windows环境中使用Git管理Github项目，但是是使用命令行来进行操作的，本文将简单介绍下在VS2010中怎样使用Git，并来管理Github上的项目。

## 准备

* 安装Git命令行，下载地址：[http://code.google.com/p/msysgit/downloads/list](http://code.google.com/p/msysgit/downloads/list)，其实如果没有安装Git命令行，在安装Git Extensions时会有两个勾选项，其中一个就是Git命令行（msysGit ）

* 安装Git Extensions，下载地址：[http://sourceforge.net/projects/gitextensions/](http://sourceforge.net/projects/gitextensions/) ，安装过程中会有两个勾选项msysGit 和 KDiff3，如果已经安装了Git命令行可以不勾选msysGit，KDiff3 是一个文件对比工具，在分支合并时会用到，建议勾选，安装完后也可以设置成其他的对比工具，比如：BCompare

* 安装VS的插件Git Source Control Provider，在VS2010的扩展管理中可以找到

* 在VS中设置源代码控制位Git Source Control Provider。

## 创建项目并添加到Git

使用VS2010创建一个名为GitHelloWorld的项目，在解决方案上点击右键，点击“Git –New Repository”：

![20130513_210905](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290706491.jpg)

这时看项目所在的目录，会添加一个名为.git的隐藏目录和一个名为.gitignore的文件，除此外不会有任何多余的文件，相比VSS和SVN等源码管理工具要“干净”很多：

![20130513_212332](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290706471.jpg)

这时会发现解决方案中的文件上并没有出现源码管理的图标，在解决方案上右击，点击Git菜单中的Refresh就OK了：

![20130513_214629](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290706765.jpg)
![20130513_215023_thumb](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290706673.jpg)

上面右图中的文件前的图标为加号，表示文件还没有被添加到版本库中，可以使用Git菜单中的Commit来进行提交：

![20130513_221212](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290706012.jpg)

现在就可以对代码进行编辑了，当我们在文件中添加自己的代码后，文件的状态并不会改变，当保存文件后，文件就显示为签出状态。通常第一次通过Commit将代码加入到源码库后，建议重启VS，否则有时文件的签入签出状态得不到及时更新，如果发现状态没有及时更新也可以用Git菜单下的Refresh来进行更新。

Git菜单上的Browse命令可以查看各个提交版本的信息：

![20130513_230857](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290707331.jpg)

或是在解决方案上右击，选择“Git -History”也可以查看版本信息，是在VS中的标签页中以图形化展示：

![20130514_064929](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290707672.jpg)

通过上面的介绍我们可以简单的使用Git来管理代码了，下面接着来说怎样将代码推送到Github中

首先需要在Github中创建一个新的repository，命名为GitHelloWorld，创建完成后如下图所示：

![20130514_065931](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290707307.jpg)

上图中红色框中的就是新建的GitHelloWorld的地址，通过这个地址我们就可以将本地代码推送到GitHub中，在VS中点击Git菜单下的Push命令：

![20130514_073305](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290707811.jpg)

如果推送成功会看到如下提示框：

![20130514_073354_thumb](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290707684.jpg)

这时刷新GitHub中的页面可以看到项目已经添加到GitHub中了：

![20130514_194240_thumb](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290708761.jpg)

到这儿就介绍完怎样在VS中将代码放入到Git库，并将代码推送到GitHub。下面介绍下已知一个GitHub的源码地址，怎样把代码拉到本地，比如刚刚推送到GitHub中的GtiHelloWorld的地址是`git://github.com/oec2003/GitHelloWorld.git`，现在使用这个地址将代码拉到本地。

## 从GitHub拉代码到本地

打开VS2010，点击Git菜单的Clone repository：

![20130515_212658_thumb](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290708283.jpg)

在弹出的克隆对话框中输入相应的信息：

![20130515_214044](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290708972.jpg)

点击“克隆”按钮，如果成功克隆的话会弹出如下信息框：

![20130515_214127_thumb](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290708621.jpg)

就这么简单，现在代码已经被拉到E盘的GitHelloWorld目录中了。还有一种方法就是直接打开Git Extensions，点击“克隆档案库”可以达到同样的效果。现在就可以使用VS2010开始我们的Git之旅了，关于分支、标签等深入一点的内容在后面的博文中会介绍。

