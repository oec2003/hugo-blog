---
title: C#中实现小米推送
date: 2017-09-02T09:35:44+08:00
categories: [技术]
tags: [C#, MIPush]
---

移动端的消息推送有很多互联网产品可以用，例如：极光、个推、小米推送等。对于安卓手机，推送需要做各种适配，开始我们使用的是极光，发现在小米手机上，当App退出到后台，就经常不能收到消息，所以决定将小米推送集成到App中。

遗憾的是小米推送官方并不支持C#，所以需要很对Java版本的实现用IKVM来做一些转化。转换后在Net程序中一共需要引用7个Dll文件，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300725027.jpg)

相关Dll文件和示例代码已经放在Github上了

```
[https://github.com/oec2003/MIPushCSharpSample](https://github.com/oec2003/MIPushCSharpSample)
```

## 服务器证书问题解决

在测试阶段，推送一直没什么问题，当部署到客户服务器上后，就推送失败，错误日志如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300725876.jpg)

从错误信息可以得知是在验证证书时出的问题，网上查到很多都是Java版本的解决方式，思路就是忽略SSL的验证，找了下C#的相关代码，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300725838.jpg)

上面代码加上后，发现推送就正常了。上面红框代码如下：

```
ServicePointManager.ServerCertificateValidationCallback += (sender, certificate, chain, sslPolicyErrors) => true;
```

