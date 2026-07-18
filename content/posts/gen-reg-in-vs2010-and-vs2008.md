---
title: VS2010和VS2008使用不同编译方式在64位机器生成注册表对比
date: 2012-10-14
categories: [技术]
tags: [C#, DotNet, Regedit]
---

最近写一个小工具用到了使用C#来进行注册表的操作，使用C#来进行注册表的操作需要引入命名空间Microsoft.Win32，关于操作注册表的帮助类可以参考RegHelper.cs。下面分别使用VS2010和VS2008使用Any CPU、X64、X86和Itanium进行编译，运行在32位机器和64位机器进行对比。看下面一段代码：

```
string subkey = @"software\FW\UserInfo";
RegHelper reg = new RegHelper(subkey, RegDomain.LocalMachine);
reg.CreateSubKey(subkey);
Console.ReadLine();
```

上面代码的本意是在注册表中创建`HKEY_LOCAL_MACHINE\SOFTWARE\FW\UserInfo` 节点，在32位机器中没有什么问题，可以正常的生产节点，但在64位机器上，不同的VS版本，使用不同的编译模式，会产生不一样的结果。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300649603.jpg)

