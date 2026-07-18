---
title: SharePoint2007配置
date: 2011-01-12
categories: [技术]
tags: [SharePoint,MOSS]
---

在前面的文章中已经介绍了SharePoint2007的安装，本篇将详细介绍下SharePoint2007的配置。首先从程序中打开SharePoint2007的配置向导。

![2011-01-11_204240](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301943608.gif)

向导启动后的界面如下

![2011-01-11_204406](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301943157.gif)

点击“下一步”

![2011-01-11_204420](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301944914.gif)

上图中提示需要启动或重启几个相关服务，点击“是”

![2011-01-11_211055](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301944425.gif)

因为我们是在安装第一台SharePoint服务器，所以选择第二项“否，我希望创建新的服务器场”，点击“下一步”

![2011-01-11_221442](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301945489.gif)

“数据库服务器”填写安装的SqlServer2005的服务器名称

“数据库名称”默认为“SharePoint_Config   ”，不用做修改

“用户名为”AD域加上账户名称，如：fwhyy\administrator

“密码”为Win2003Server的密码

填写好后点击“下一步”

![2011-01-11_221850](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301945568.gif)

默认情况下系统会自动给分配一个端口号，在这里，我们指定一个特定的端口，勾选“指定端口号”，在后面的文本框中输入10000，“Web应用程序的验证提供程序”选择NTLM，点击“下一步”

![2011-01-11_222312](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301945543.gif)

所有的设置已经完成，点击“下一步”开始配置，请耐心等待

![2011-01-11_222430](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301945504.gif)

稍等几分钟后便可配置成功

![201101130943278918](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301945270.gif)

点击“完成”后SharePoint的配置就结束了。创建SharePoint站点等会在后面的文章中详细介绍。

