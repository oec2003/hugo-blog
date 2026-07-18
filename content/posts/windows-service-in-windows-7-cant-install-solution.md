---
title: Windows服务在Win7中不能安装的解决方法
date: 2011-05-24
categories: [技术]
tags: [C#, Win7, 错误解决]
---

用C#写的Windows服务在Win7中安装时出现如下错误：

![2011-05-24_102447](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290648137.png)

解决方法：

1 安装服务的脚本写在bat文件中，一定要注意路径，如下

```
D:\Project\JXW\Code\WorkFlow\FlowServer\installutil.exe  D:\Project\JXW\Code\WorkFlow\FlowServer\FlowServer.exe

pause


net start ShineFlow.FlowServer
```

2 在bat文件上点击右键-》以管理员身份运行。

3 成功安装服务，如下：

![2011-05-24_102806](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290649864.png)

