---
title: WCF中的ServiceHost初始化两种方式
date: 2010-07-13
categories: [技术]
tags: [WCF]
---

在宿主程序中初始化ServiceHost有直接写代码和使用配置文件两种方式。使用ServiceHost首先要引用System.ServiceModel 命名空间。

## 代码方式

```
using(ServiceHost host=new ServiceHost(typeof(HelloWordService)))
{
    host.AddServiceEndpoint(typeof(IHelloWordService),
        new BasicHttpBinding(), new Uri("http://localhost:10000/HelloWorldService"));
    host.AddServiceEndpoint(typeof(IHelloWordService),
        new NetTcpBinding(), new Uri("net.tcp://localhost:10001/HelloWorldService"));

    if (host.State != CommunicationState.Opening)
        host.Open();
}
```

## 配置文件方式

配置文件代码：

```
<services>
  <service behaviorConfiguration="serverBehavior" name="HelloWordService">
    <endpoint address="http://localhost:10000/HelloWorldService"
              binding="basicHttpBinding" contract="IHelloWordService"></endpoint>
    <endpoint address="net.tcp://localhost:10001/HelloWorldService"
              binding="netTcpBinding" contract="IHelloWorldService"></endpoint>
  </service>
</services>
```

当然也可以使用基地址的方式来配置

```
<services>
  <service behaviorConfiguration="serverBehavior" name="HelloWordService">
    <endpoint address="HelloWorldService"
              binding="basicHttpBinding" contract="IHelloWordService"></endpoint>
    <endpoint address="HelloWorldService"
              binding="netTcpBinding" contract="IHelloWorldService"></endpoint>
    <host>
      <baseAddresses>
        <add baseAddress="http://localhost:10000/"/>
        <add baseAddress="net.tcp://localhost:10001/"/>
      </baseAddresses>
    </host>
  </service>
</services>
```

配置好配置文件后就宿主程序中就很简单了，如下：

```
using(ServiceHost host=new ServiceHost(typeof(HelloWordService)))
{
    if (host.State != CommunicationState.Opening)
        host.Open();
}
```

