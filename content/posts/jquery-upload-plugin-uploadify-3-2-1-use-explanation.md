---
title: jQuery上传插件Uploadify使用详解(3.2.1)
date: 2016-09-25T18:57:49+08:00
categories: [技术]
tags: [JQuery, Uploadify]
---

六年前，因为工作中使用到 jQuery 的上传组件 Uploadify ，写了一篇《[JQuery上传插件Uploadify使用详解](http://fwhyy.com/2010/01/jquery-upload-plugin-uploadify-use-explanation/)》的博客来介绍 [Uploadify](http://www.uploadify.com/) ，其实只是将官方文档简单翻译了下。几年下来居然有50多万的访问量，而且每天通过各种搜索引擎有大几百的朋友会访问到这篇文章。六年时间 Uploadify 从当时的2.1.0到了现在的3.2.1，变化还是挺大，为了对访问到之前那篇博客的朋友还有点价值，特写此篇。
<!--more-->
Uploadify 的使用分为属性配置，事件和方法三大块，根据[官方文档](http://www.uploadify.com/documentation/)，我将这三部分内容写了一个示例项目放在 Github 上，不抵触英文的建议直接看[官方文档](http://www.uploadify.com/documentation/)，下面是示例的一些截图：

## 示例

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300720149.jpg)

## Option

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300721579.jpg)

## Event

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300721125.jpg)

## Method

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300721967.jpg)

好吧，我承认上面几张图就是凑篇幅的，大家可以 clone 或 fork 我 Github 上的项目，自行运行调试。

* Github 地址：[https://github.com/oec2003/jQueryUploadifySample](https://github.com/oec2003/jQueryUploadifySample)

先别急着去下载示例代码，在这里推荐一个上传组件 [Stream](http://www.twinkling.cn/) ：

* 官方网站：[http://www.twinkling.cn/](http://www.twinkling.cn/)
* 项目地址：[http://git.oschina.net/jiangdx/stream](http://git.oschina.net/jiangdx/stream)

该组件是纯 js 组件，理论上可以支持任何的服务端语言，目前可以支持 Java 、Perl 、PHP 和 Asp.Net ，其中 Asp.Net 的实现是我写的，之前也写了篇博客《[开源上传组件stream的.Net后台实现](http://fwhyy.com/2015/08/stream-aspnet/)》来介绍，代码实现也放在了 Github上：

* StreamAsp.Net项目地址：[https://github.com/oec2003/StreamAspNet](https://github.com/oec2003/StreamAspNet)

如果觉得对您有所帮助，请帮忙在 Github 上 Star 下。

