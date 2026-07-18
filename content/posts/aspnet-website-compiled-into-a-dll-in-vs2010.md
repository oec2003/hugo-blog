---
title: 在VS2010中将AspNet网站编译成一个DLL
date: 2011-04-06
categories: [技术]
tags: [AspNet, vs2010, 部署]
---

在VS2010中创建一个网站，部署时网站的dll是动态生成的，每次编译产生的dll的名称都不一样，这样会导致在部署时必须将aspx页面和dll一起部署，尽管有时你可能只修改了后台代码。这样就变得很不方便，在VS2010中可以借助一个插件是网站生成一个固定名称的dll。

1 从下面的链接地址中下载 Visual Studio® 2010 Web Deployment Projects

[http://www.microsoft.com/downloads/en/confirmation.aspx?FamilyID=711a2eef-b107-4784-9063-c978edc498cd&displaylang=en](http://www.microsoft.com/downloads/en/confirmation.aspx?FamilyID=711a2eef-b107-4784-9063-c978edc498cd&displaylang=en)

2 安装Visual Studio® 2010 Web Deployment Projects插件，然后再网站项目上点击右键，可以看到多了一项Add Web Deployment Project

![2011-04-06_113023](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290807175.png)

3 点击Add Web Deployment Project，弹出如下对话框

![2011-04-06_113422](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290807160.png)

4 名称和路径可以修改，一般默认就好，点击OK，在解决方案中会生成一个部署项目

5 在部署项目点击右键，点击“生成”

![2011-04-06_113814](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290807093.png)

6 生成成功后，在部署项目的目录中会产生一个Release目录，Release目录中就是项目发布的所有文件，在bin目录中可以看到并没有之前那样有很多不规则命名的dll，生成的dll的名称和前面添加部署项目时所填写的名称相同，为EduAppWeb_deploy



