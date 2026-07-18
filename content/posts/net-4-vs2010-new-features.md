---
title: Net4.0—VS2010新特性
date: 2010-05-27
categories: [技术]
tags: [DotNet4, vs2010]
---

VS2010在用户体验上有了很大提升，可以让我们更方便和快捷地来进行编码工作。早在VS2010Beta版的时候，我曾写过[一篇文章](http://blog.fwhyy.com/2009/10/experience-vs2010-improvements/)介绍VS2010的一些新特性，此文算是对那篇文章的补充吧。

## 1 方便地删除Recent Projects

如果用VS2010打开过项目，那么在启动VS2010后，在Start Page页面的Recent Projects列表中会有记录，之前的VS版本中如果想删除Recent Projects列表记录，需要修改注册表信息，参考[这里](http://blog.fwhyy.com/index.php/2007/12/delete-recently-opened-in-visual-studio-project-and-file-records/)。在VS2010中可以很方便做到对Recent Projects列表的管理，在某一个项目名称上右击，弹出菜单中会有Remove From List选项，点击后会将当前项目名从列表中删除，如下图：

![2010-05-26_155027](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300735497.png)

## 2 Navigate to

Navigate to搜索对话框可以让我们方便地查找内容，并且可以模糊匹配。输入[Ctrl+，] 快捷键便可以打开Nagigate to 对话框，如下图：

![2010-05-27_104536](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300735950.png)

在Search terms框中输入关键词就可以进行模糊匹配，比如输入PL 就可以匹配到Page_Load事件，如下图：

![2010-05-27_104755](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300736023.png)

双击结果中的方法名就可以导航到方法体中。

## 3 同名函数的高亮显示

在以前的VS版本中，要查找一个函数在页面中出现的次数或位置，有两种方法：Ctrl+F查找或是查找该函数的所有引用，这两种方法都不是很方便。在VS2010种新增了同名函数高亮显示功能，选中一个函数名，在同页中所有这个函数名出现的地方会高亮显示，如下图：

![2010-05-27_103031](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300736374.png)

## 4 View Call Hierarchy

在一个方法名上右击，会有View Call Hierarchy选项，如下图：

![2010-05-27_103504](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300736242.png)

点击后会打开一个试图，该试图可以方便看出该方法在那些地方被用到，传入的是什么参数，并且可以很快定位在引用的地方，对于一个代码行数比较多的文件，可以提高开发效率，如下图：

![2010-05-27_111025](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300736656.png)

当然在VS2010中好玩的好用的新的功能肯定不止这些，让我们慢慢去发现吧！

