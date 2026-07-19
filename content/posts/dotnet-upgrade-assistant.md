---
title: dotNET 升级利器：Upgrade Assistant
date: 2023-03-20T11:29:39+08:00
categories: [技术]
tags: [dotNET,工具]
---

.NET 发展很快, 现在 .NET 8 的预览版已经发布了，但我们现在还在使用 .NET Core 3.1，将 .NET 升级到 .NET 6 已经势在必行。
<!--more-->
记得之前从 .NET Core 2.1 升级到 .NET Core 3.1 的时候，虽然网上有很多的教程，也废了一番力气，各种配置的修改，引用的第三方的库的升级等。

现在，在 VS2022 的扩展中有一个升级的工具：.NET Upgrade Assistant ，用来做 .NET 框架的升级，非常方便。

下面来讲解下怎样使用：

1、在 VS 2022 中进行 .NET Upgrade Assistant 的安装。

![](https://img.fwhyy.com/2023/202306191131168.webp)

按照提示一路下一步即可：

![](https://img.fwhyy.com/2023/202306191131132.webp)

2、创建一个 .NET Core 3.1 的 WebAPI 项目，在项目上点击右键就会出现 Upgrade 按钮：

![](https://img.fwhyy.com/2023/202306191131938.webp)

3、在弹窗中选择升级方式，但也只有这一个选项啊：

![](https://img.fwhyy.com/2023/202306191134375.webp)

4、选择升级的目标版本，这里我选择 .NET 6 ,这是一个长线支持版本：

![](https://img.fwhyy.com/2023/202306191134478.webp)

5、选择需要更新的内容，默认全选，点击「Upgrade selection」进行升级：

![](https://img.fwhyy.com/2023/202306191134726.webp)

6、瞬间，升级就完成了。

![](https://img.fwhyy.com/2023/202306191132693.webp)

7、上面的示例升级非常简单，我便马上尝试了产品的代码，多年的积累，产品的代码还是比较复杂的，引用的第三方库也比较多。我是按照项目的依赖关系，从最下层依次到上次进行升级，升级的过程很顺利，没有出现错误，但在编译时出现了两个错误：

- Ionic.zip 组件出现问题；
- Swagger 相关的代码出现问题。

Ionic.zip的问题是因为这个软件包已经被弃用，换成了 DotNet.zip 就可以了。

![](https://img.fwhyy.com/2023/202306191132795.webp)

重新安装 Swashbuckle.AspNetCore 最新的包，并按照 .NET 6 的方式注册，就可以解决了。

8、编译终于没问题了，程序启动的时候又报错了，原因是 BinaryFormatter 有安全漏洞过，已经不再支持：

![](https://img.fwhyy.com/2023/202306191132237.webp)

有两种方式可以解决这个问题，第一种是直接停止在代码中使用 BinaryFormatter。可以使用 JsonSerializer 或 XmlSerializer  进行替代，具体可以参考：

https://learn.microsoft.com/zh-cn/dotnet/core/compatibility/core-libraries/5.0/binaryformatter-serialization-obsolete

当然，如果代码中对 BinaryFormatter 依赖比较重，修改起来比较麻烦，还可以用一种兼容的方式进行处理，这是一种临时方式，不推荐，毕竟有安全漏洞。操作如下：

将下面代码加入到 Web 项目中的项目文件中：

```
<EnableUnsafeBinaryFormatterSerialization>true</EnableUnsafeBinaryFormatterSerialization>
```

![](https://img.fwhyy.com/2023/202306191132611.webp)

上面代码添加后，便可忽略掉 BinaryFormatter 的安全性，让程序可以正常运行。

9、处理了上面几个编译好运行问题后，正常产品代码就从 .NET Core 3.1 升级到 .NET 6 了。