---
title: 开源上传组件stream的.Net后台实现
date: 2015-08-13
categories: [技术]
tags: [C#, DotNet, stream]
---

stream是一款功能很强大的上传组件，支持Html5和Flash两种方式，Html5可以支持断点续传，进度、剩余时间等的显示。但后台代码实现目前只有Java和PHP的版本，参考PHP的版本我实现了一个.Net的版本，目前只支持Html5的方式，代码已经放到了Github上：
<!--more-->

1. .Net版本实现：[https://github.com/oec2003/StreamAspNet](https://github.com/oec2003/StreamAspNet)
2. stream上传组件主页：[http://www.twinkling.cn/](http://www.twinkling.cn/)
3. stream上传组件项目地址：[http://git.oschina.net/jiangdx/stream](http://git.oschina.net/jiangdx/stream)

## 项目结构图如下：

![项目结构图](/Users/fengwei/Documents/my/typora-img/stream-aspnet/3cefded1gw1ev09rbskuoj20880eeab8.jpg)

* common： 一些公共的帮助类和实体类
* css： stream的css文件和图片
* js： stream的js文件
* lib： 第三方dll
* swf： stream的flash文件
* upload： 存放上传的文件和tokens
* FileUpload： 一般处理程序，用来进行文件的操作

## 运行

* 使用VS2012或VS2013打开项目，直接运行
* 将程序部署在IIS中进行访问

## 运行效果

![运行效果](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302000823.jpg)

