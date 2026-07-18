---
title: 在SharePoint2007中创建站点一：相关服务的启动
date: 2011-01-13
categories: [技术]
tags: [SharePoint,MOSS]
---

在程序中打开“SharePoint3.0管理中心”

![2011-01-11_225545](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301941047.gif)

点击“SharePoint3.0管理中心”会弹出要求输入用户名和密码的对话框

![2011-01-11_232210](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301941326.gif)

输入用户名和密码（注意用户名需要是域名加上用户名），点击“确定”

![2011-01-11_232432](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301941628.gif)

在上图中可以看出，服务器场配置未完成，所以先来配置服务器场。在“服务器场拓扑结构”下的“服务器”下点击服务器名称，上图中为“FENGWEI ”

![2011-01-11_233056](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301941460.gif)

单击“Office SharePoint Server搜索”后面的“启动”

![2011-01-11_233919](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301941413.gif)
![2011-01-11_234255](http://fwhyy.com/img/post/2011-01-11_234255.gif)

勾选“使用此服务器索引内容”和“使用此服务器提供搜索查询服务”

输入一个电子邮件地址

输入管理员的账户信息，需要注意的是用户名必须以“域\用户名”的格式，如上图

填写完毕后点击“开始”按钮来启动搜索服务

使用同样的方法启动“Windows SharePoint Services 搜索 ”服务

![2011-01-11_234904](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301941209.gif)

点击“Windows SharePoint Services 搜索”右边的“启动”

![2011-01-11_235051](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301941256.gif)

填写“服务账户”和“内容访问账户”，两个账户填写一致就可以，注意用户名为“域\用户名”的格式，只填写这个两个账户信息即可，其他的保持默认，填写完毕点击“开始”按钮来启动服务

![2011-01-11_235346](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301942453.gif)

数秒后服务便启动成功

现在点击“Excel Calculation Services ”右边的“启动”来启动“Excel Calculation Services  ”服务，启动该服务只需点击“启动”按钮即可，不需要做任何设置

![2011-01-11_235759](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301942826.gif)

到此服务已经启动完成，切换到“主页”选项卡，服务器场拓扑结构如下图

![2011-01-12_000124](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301942490.gif)

