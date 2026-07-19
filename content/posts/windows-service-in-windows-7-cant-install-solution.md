---
title: Windows服务在Win7中不能安装的解决方法
date: 2011-05-24
categories: [技术]
tags: [C#, Win7, 错误解决]
---

用C#写的Windows服务在Win7中安装时出现如下错误：

![2011-05-24_102447](https://img.fwhyy.com/2022/202201290648137.webp)

解决方法：

1 安装服务的脚本写在bat文件中，一定要注意路径，如下

```
D:\Project\JXW\Code\WorkFlow\FlowServer\installutil.exe  D:\Project\JXW\Code\WorkFlow\FlowServer\FlowServer.exe

pause


net start ShineFlow.FlowServer
```

2 在bat文件上点击右键-》以管理员身份运行。

3 成功安装服务，如下：

![2011-05-24_102806](https://img.fwhyy.com/2022/202201290649864.webp)

