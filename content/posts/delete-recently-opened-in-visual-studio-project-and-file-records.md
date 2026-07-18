---
title: 在visual studio中删除最近打开的项目和文件记录的方法
date: 2007-12-05
categories: [技术]
tags: [visual studio]
---

在打开visual studio时有一个最近打开的项目列表，但是当我们将某个项目在本地磁盘上删除后，那个项目列表依然存在，下面的方法可以让删除的项目在列表中不出现。
<!--more-->
下面是一vs2005为例，其中8.0代表的是版本号，vs03为7.1,vs2008为9.0

1.删除最近打开的文件
HKEY_CURRENT_USER\Software\Microsoft\VisualStudio\8.0\FileMRUList ，在右边删除相应键值。
2.删除最近打开的项目
HKEY_CURRENT_USER\Software\Microsoft\VisualStudio\8.0\ProjectMRUList，在右边删除相应键值。

