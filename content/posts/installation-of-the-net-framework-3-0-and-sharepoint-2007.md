---
title: SharePoint2007安装图文详解四：安装.NET Framework 3.0和SharePoint 2007
date: 2011-01-11
categories: [技术]
tags: [DotNet3.0, SharePoint,MOSS]
---

终于到了SharePoint2007安装的最后一步了，.NET Framework 3.0在官网可以下载，不过需要连接到网络才可以安装，SharePoint2007我下载的是官网的半年试用版，但安装的时候居然要求输入序列号，随便搜了一个顺利通过，嘿嘿！下面是下载链接地址和序列号

.NETFramework3.0：[http://www.microsoft.com/downloads/zh-cn/confirmation.aspx?familyId=10cc340b-f857-4a14-83f5-25634c3bf043&displayLang=zh-cn](http://www.microsoft.com/downloads/zh-cn/confirmation.aspx?familyId=10cc340b-f857-4a14-83f5-25634c3bf043&displayLang=zh-cn)

SharePoint2007：[http://www.microsoft.com/downloads/details.aspx?FamilyID=2e6e5a9c-ebf6-4f7f-8467-f4de6bd6b831&displayLang=zh-cn](http://www.microsoft.com/downloads/zh-cn/confirmation.aspx?familyId=10cc340b-f857-4a14-83f5-25634c3bf043&displayLang=zh-cn)

SharePoint 2007 序列号：F6YVR-4XY7K-RCVY4-37FBK-G44PY

安装.NET Framework 3.0

![2011-01-08_215420](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300714138.gif)

加载完后进入安装界面

![2011-01-08_215504](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300715807.gif)

可以看到文件大小有39MB，需要连接网络下载，点击“安装”

![2011-01-08_215730](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300715905.gif)

等待下载完成

![2011-01-08_220523](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300715941.gif)
![2011-01-08_220931](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300715126.gif)

.NET Framework 3.0 已安装成功

## 安装SharePoint 2007

双击下载下来的exe文件
![2011-01-09_001745](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300715143.gif)
![2011-01-09_002829](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300715762.gif)
![2011-01-09_002843](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300715130.gif)

输入上面给出的序列号，点击“继续”

![201101120951336913](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300716923.gif)

选中“我接受此协议的条款”，点击继续

![2011-01-09_002948](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300716524.gif)

点击“高级”

![2011-01-09_003240](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300716659.gif)

“服务器类型”选项卡中选中“完整…”，然后切换到“文件位置”选项卡

![2011-01-09_003313](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300716328.gif)

文件位置可以选择你想放的目录，此处是使用默认位置，然后切换到“反馈”选项卡

![2011-01-09_003327](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300716580.gif)

该处我选择的是“不参加”，点击“立即安装”

![2011-01-09_003350](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300716355.gif)

稍等片刻就安装完毕了

![2011-01-10_171910](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300717282.gif)

点击“关闭”会提示重启，重启电脑后SharePoint 2007 就成功安装了。

安装仅仅只是一个开始，配置乃至跟多的内容请关注我的后面的文章吧

## 相关文章

[SharePoint2007安装图文详解一：安装IIS及相关组件](http://blog.fwhyy.com/2011/01/iis-install/)
[SharePoint2007安装图文详解二：安装AD（活动目录）及DNS](http://blog.fwhyy.com/2011/01/installation-of-ad-and-dns/)
[SharePoint2007安装图文详解三：安装SqlServer2005](http://blog.fwhyy.com/2011/01/install-sqlserver2005/)
SharePoint2007安装图文详解四：安装.NET Framework 3.0和SharePoint 2007

