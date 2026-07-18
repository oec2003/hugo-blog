---
title: SharePoint2007安装图文详解一：IIS安装
date: 2011-01-10
categories: [技术]
tags: [IIS, SharePoint]
---

由于工作需要最近准备研究下SharePoint，SharePoint的最新版本为2010，但由于硬件环境所致我打算从2007开始学。首先准备详细介绍下SharePoint2007的安装过程。

本次安装是在Windows2003 sp2的虚拟机上进行，安装SharePoint2007 先后分为以下几个步骤

* 安装IIS等一些组件
* 安装AD（活动目录）及DNS
* 安装SqlServer2005
* 安装.NET Framework 3.0
* 安装SharePoint 2007

由于安装介绍大部分为图片，为了博文的访问速度我将上面的几个步骤分为4篇来介绍，本文只介绍安装IIS及一些相关组件。下面就正式开始安装了。

现在假设我们已经在Virtual PC中安装好了Win2003 SP2，从控制面板中打开“添加或删除程序”

![2011-01-09_014134](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300703827.gif)

在弹出窗口左侧选择“添加/删除Windows组件”来启动组件向导

![2011-01-09_014211](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300703310.gif)

在“Windows组件向导”窗口中选中“应用程序服务器”

![2011-01-09_014929](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300703687.gif)

点击“详细信息”，在弹出窗口中选择如下图的选项

![2011-01-09_015116](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300703615.gif)

在上图中选中“Internet信息服务（IIS）”点击详细信息，选中下图中的红色框标识的选项

![2011-01-09_015414](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300704962.gif)

将所选配置确定保存，然后点击下一步进行安装

![2011-01-09_015621](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300704693.gif)

稍等几分钟，即可安装成功。如果在安装过程中弹出提示框提示插入光盘，将Win2003的系统盘插入光驱即可，如果不是用光盘安装的系统，那么在Virtual PC中CD菜单中选择安装的ISO文件即可。

![2011-01-09_015951](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300704410.gif)

至此IIS及一些相关组件已经安装好了。下面链接中的博文继续介绍后继的安装。

## 相关文章

SharePoint2007安装图文详解一：安装IIS及相关组件
[SharePoint2007安装图文详解二：安装AD（活动目录）及DNS](http://blog.fwhyy.com/2011/01/installation-of-ad-and-dns/)
[SharePoint2007安装图文详解三：安装SqlServer2005](http://blog.fwhyy.com/2011/01/install-sqlserver2005/)
[SharePoint2007安装图文详解四：安装.NET Framework 3.0和SharePoint 2007](SharePoint2007安装图文详解四：安装.NET Framework 3.0和SharePoint 2007)

