---
title: 连接RTX服务器出现“应用SDK:连接SDK服务器错误”问题解决
date: 2014-01-09
categories: [技术]
tags: [RTX, 错误解决]
---

腾讯通的官方有个示例可以使用程序来进行腾讯通客户端的登录，大致原理是这样：

* 从服务端验证用户名是否存在；
* 根据用户名从服务端生成key；
* 根据key值调用脚本启动腾讯通客户端。

在本机安装好腾讯通的客户端和服务器，运行实例程序，可以正常跑起来，将服务器安装在虚机中，就会报“(0xFFFFBA9E): 应用SDK:连接SDK服务器错误”的错误，原因是服务器端对IP地址有限制，修改配置文件，重启腾讯通的所有服务即可，具体方法如下：

![3cefded1gw1eccx0b95c2j20fl0d9myt](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290800352.jpg)

将示例部署到IIS中，运行后出现如下错误：

![3cefded1gw1eccx0aqp3hj20mq06i41k](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290800607.jpg)

## 网上查到的一些解决方法

* 注册腾讯通的dll（Interop.RTXSAPILib.dll），试过发现无法注册；
* 修改项目的编译平台为x86，发现也不能解决；

## 最终解决方法

* 在对应的应用程序池上点击右键；
* 选择高级设置；
* 常规选项卡上将“启用32位应用程序”修改为true。

![3cefded1gw1eccxc5i01nj20cf0f1q5i](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290801459.jpg)

## 测试环境

* 系统：Windows 7
* 开发工具：VS2012
* 腾讯通版本：2012
* IIS版本：IIS7

