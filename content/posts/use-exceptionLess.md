---
title: 使用ExceptionLess
date: 2016-09-13T23:03:26+08:00
categories: [技术]
tags: [ExceptionLess,日志,Asp.Net]
---

[ExceptionLess](http://exceptionless.com/)是一款免费开源的分布式日志收集框架，DotNet的几乎所有类型的程序都可以支持，并且还提供了接口，可以很方便的在js中进行日志的推送。
<!--more-->
## 来源

最近在[dotNet跨平台](http://mp.weixin.qq.com/mp/qrcode?scene=10000005&size=102&__biz=MzAwNTMxMzg1MA==)的微信公众号得知这个框架，并且连续两天推出了关于ExceptionLess的介绍及安装的文章。下面几篇文章就是关于ExceptionLess介绍及安装的文章：

[http://www.cnblogs.com/uptothesky/p/5864863.html](http://www.cnblogs.com/uptothesky/p/5864863.html)
[http://www.cnblogs.com/savorboard/p/exceptionless.html](http://www.cnblogs.com/savorboard/p/exceptionless.html)
[http://mp.weixin.qq.com/s?__biz=MzAwNTMxMzg1MA==&mid=2654067937&idx=1&sn=01e502d9ef5cf77817aa80db6903923d&scene=0#wechat_redirect](http://mp.weixin.qq.com/s?__biz=MzAwNTMxMzg1MA==&mid=2654067937&idx=1&sn=01e502d9ef5cf77817aa80db6903923d&scene=0#wechat_redirect)

## 安装说明

ExceptionLess的装分为两种：

1. 在github上下载clone源码编译安装；
2. 在github上下载release包进行安装。

## 安装环境

1. Window8.1
2. VS2015
3. IIS8.5
4. Java8
5. ElasticSearch1.7.5
6. [Exceptionless.3.4.2523](https://github.com/exceptionless/Exceptionless/releases/download/v3.4.1/Exceptionless.3.4.2523.zip)

## clone源码编译安装

首先尝试第一种，按照文章中的步骤很顺利的将前台门户和后台API部署成功。注册账号进入控制面板后，新建项目总是不能成功，常见提示成功，先还是显示无项目，如下图：

![iShot2022-01-30 21.48.11](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302152947.jpg)

后来F12调试发现提示APIKey没设置，如下图：

![iShot2022-01-30 21.48.42](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302151498.jpg)

这个脚本错误导致很多的操作都无效，网上找了很多的资料，也在群里问过安装成功的朋友，也都没能解决此问题，最终不得不放弃编译的方式部署。

## release包进行安装

1、 下载release包[Exceptionless.3.4.2523.zip](https://github.com/exceptionless/Exceptionless/releases/download/v3.4.1/Exceptionless.3.4.2523.zip)，该包包含前端UI和后端API；
2、解压zip包，包含文件如下图：

![iShot2022-01-30 21.49.00](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302151748.jpg)

3、在IIS中创建站点指向wwwroot目录，站点端口号9001；
4、右键“Start-ElasticSearch.ps1“，选择"使用powershell运行“，第一次执行会从网上下载
ElasticSearch，这个过程可能会花几分钟时间，执行完后如下图：

![iShot2022-01-30 21.49.18](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302151316.jpg)

5、ElasticSearch的默认端口为9200，在浏览器中访问http://localhost:9200 ，出现如下图界面说明安装成功：

![iShot2022-01-30 21.49.37](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302151174.jpg)

6、修改`wwwroot`目录下的web.config文件：

![iShot2022-01-30 21.49.54](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302151944.jpg)

* ElasticSearchConnectionString:http://localhost:9200
* BaseURL:http://localhost:9001/#

7、修改`wwwroot`下的app.config文件：

![iShot2022-01-30 21.50.09](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302151415.jpg)

8、在浏览器中输入 http://localhost:9001 就可以进行访问了。

## ExceptionLess使用

1、详细的使用方法在上面的链接[文章](http://www.cnblogs.com/savorboard/p/exceptionless.html)以及官方文档中有详细介绍；
2、当使用NuGet安装了ExceptionLess后会在Web.config文件中创建exceptionless节点，除了apikey需要添加serverUrl属性，该属性配置ExceptionLess的WebAPI的地址，因为本例中UI和API都在9011端口下，所以配置为:http://localhost:9001 ，如下图：

![iShot2022-01-30 21.50.27](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302151208.jpg)

3、在JS中使用也是一样，需要配置serverUrl地址，否则就会推送到默认地址了：

![iShot2022-01-30 21.50.44](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302151414.jpg)

