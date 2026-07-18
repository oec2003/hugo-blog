---
title: Remoting 外网访问
date: 2016-09-06T22:01:52+08:00
categories: [技术]
tags: [DotNet,Remoting]
---

Remoting 是一种很古老的分布式技术，如果不清楚的可以参考下面三篇博客，写的非常详细：

[Microsoft .Net Remoting系列专题之一:.Net Remoting基础篇](http://www.cnblogs.com/wayfarer/archive/2004/07/30/28723.html)

[Microsoft .Net Remoting系列专题之二：Marshal、Disconnect与生命周期以及跟踪服务](http://www.cnblogs.com/wayfarer/archive/2004/08/05/30437.html)

[Microsoft .Net Remoting系列专题之三：Remoting事件处理全接触](http://www.cnblogs.com/wayfarer/articles/75213.html)

最近解决公司一个老平台的问题，该平台中使用了 Remoting 技术，现有的环境大致如下：

1、Remoting 服务和 Web 都是部署在局域网；
2、多台 Web 都是通过内网 IP 和端口来访问 Remoting 。
<!--more-->
Remoting 服务端的代码如下：

```
    int serverPort = 10000;
    TcpServerChannel Channel = new TcpServerChannel(serverPort);
    ChannelServices.RegisterChannel(Channel, false);
RemotingConfiguration.RegisterWellKnownServiceType(typeof(RemotingServer),"Server.RemotingServer",WellKnownObjectMode.Singleton);
    Console.ReadLine();
```

现在的问题是，Web 和 RemontingServer 都是部署在外网，有一个客户端程序需要通过 Remoting 来连接到外网到 RemotingServer ，这时需要将服务端的代码修改如下：

```
 string serverIP = "51.123.1.11"; //外网IP
    string serverPort = "10000";
    var properties = new Dictionary<string, string>();
    properties["machineName"] = serverIP;
    properties["port"] = serverPort;
    var sinkProvider = new BinaryServerFormatterSinkProvider();
    var Channel = new TcpServerChannel(properties, sinkProvider);

    ChannelServices.RegisterChannel(Channel, false);
    RemotingConfiguration.RegisterWellKnownServiceType
        (typeof(RemotingServer), 
        "Server.RemotingServer", 
        WellKnownObjectMode.Singleton);
    Console.ReadLine();
```

像上面这样修改后，本地客户端可以正常连接 RemotingServer ，但部署在外网的Web就不能访问 RemotingServer 了。如果将上面代码的 `serverIP` 修改成内网 IP ，外网 Web 可以访问，本地客户端又不能访问了。最后的解决方法是：

1、Remoting 服务端代码中的 `serverIP` 使用服务器的机器名，假设机器名为 RemotingServer ，代码如下：

```
 string serverIP = "RemotingServer"; //服务器机器名
    string serverPort = "10000";
    var properties = new Dictionary<string, string>();
    properties["machineName"] = serverIP;
    properties["port"] = serverPort;
    var sinkProvider = new BinaryServerFormatterSinkProvider();
    var Channel = new TcpServerChannel(properties, sinkProvider);

    ChannelServices.RegisterChannel(Channel, false);
    RemotingConfiguration.RegisterWellKnownServiceType
        (typeof(RemotingServer), 
        "Server.RemotingServer", 
        WellKnownObjectMode.Singleton);
    Console.ReadLine();
```

2、修改本地 hosts 文件，将外网 IP `51.123.1.11`映射为 RemotingServer 。

