---
title: WCF中绑定的简单介绍
date: 2010-08-29
categories: [技术]
tags: [WCF]
---

## 绑定基本概念

绑定就是一个从通用基础类型派生出来的运行时类型。绑定中描述了传输协议，消息编码格式和其他的一些用于通信的通信协议。

## 绑定的种类介绍

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302117082.jpg)

## 两种方式来配置端点以及相关联的绑定

绑定的配置可以使用配置文件的形式或是代码的形式，如下面的代码：

配置文件形式(服务端)

```
<endpoint address="HelloWorld" binding="basicHttpBinding"
          contract="Service.IHelloWorldService"></endpoint>
```

配置文件形式(客户端)

```
<endpoint address="http://localhost:10000/HelloWorld" binding="basicHttpBinding"
    bindingConfiguration="BasicHttpBinding_oec2003" contract="HelloWorld.oec2003"
    name="BasicHttpBinding_oec2003" />
```

代码形式

```
WSHttpBinding wsHttpBinding = new WSHttpBinding();
wsHttpBinding.Security.Mode = SecurityMode.Transport;
wsHttpBinding.ReliableSession.Enabled = true;
wsHttpBinding.TransactionFlow = true;
```

## 绑定的功能

每个绑定都必要要提供至少一个传输协议，一个消息编码格式和一个相关的消息版本，除此之外还有一些其他的功能，如安全性、双向通信、事务等。

传输协议：有Http、Https、Tcp、命名管线和MSMQ，这些都有专门的绑定类型与之对应。

消息编码：描述了消息是如何格式化的，可以使用Binary、Text或Mtom。

消息版本：不管消息的编码格式如何，消息总是表示为SOAP1.1或是SOAP1.2.

传输安全性：指在线传输证书、签名和加密的能力。一般使用SSL。

消息安全性：指独立于传输层的传输证书、签名和加密的能力。

双向通信：TCP和命名管线可以直接支持，但Http不支持。

这些绑定的功能都是通过配置绑定元素来进行激活看，下面就简单介绍下绑定元素。

每一种绑定都会有一个绑定元素的集合，像前面提到的传输协议、编码格式等都是绑定元素的一种。绑定元素在Net对应的类型都是继承自BindingElement类。在WCF中的每一种绑定必须有一个传输协议和一个消息编码格式。传输协议的通用绑定元素为TransportBindingElement，有下面一些子类继承TransportBindingElement，分别代表不同类型的传输协议。

* HttpTransportBindingElement
* HttpsTransportBindingElement
* MsmqTransportBindingElement

编码格式通用绑定元素为MessageEncodingBindingElement，一些子类如下：

* BinaryMessageEncodingBindingElement
* TextMessageEncodingBindingElement
* MtomMessageEncodingBindingElement

还有一些其他的不是必须但是在一些特定场合特别有用的绑定元素：

* 安全相关：SecurityBindingElement
* 混合双向通信：CompositeDuplexBindingElement   OneWayBindingElement
* 可靠通信：ReliableSessionBindingElement
* 事务：TransactionFlowBindingElement

使用上面的绑定元素必须引用命名空间System.ServiceModel.Channels

在WCF中使用绑定通常会在配置文件中来进行，尽管也可以用代码的方式实现，但在配置文件中更加灵活。可以在端点的bindingConfiguration来进行扩展。看下面代码：

```
<system.serviceModel>
  <services>
    <service name="Service.HelloWorldService" behaviorConfiguration="HelloWorldBebavior">
      <endpoint address="HelloWorld" binding="basicHttpBinding"
                bindingConfiguration="baseBinding_oec2003"
                contract="Service.IHelloWorldService"></endpoint>
      <endpoint address="mex" binding="mexHttpBinding" contract="IMetadataExchange" />
      <host>
        <baseAddresses>
          <add baseAddress="http://localhost:10000/"/>
        </baseAddresses>
      </host>
    </service>
  </services>
  <bindings>
    <basicHttpBinding>
      <binding name="baseBinding_oec2003" maxReceivedMessageSize="10000"
         transferMode="Buffered">
        <security mode="Transport"></security>
      </binding>
    </basicHttpBinding>
  </bindings>
  <behaviors>
    <serviceBehaviors>
      <behavior name="HelloWorldBebavior">
        <serviceMetadata httpGetEnabled="true" />
      </behavior>
    </serviceBehaviors>
  </behaviors>
</system.serviceModel>
```

本文只是简单介绍了下绑定的概念以及绑定的种类，以及使用了一些代码来说明绑定的运用，关于每种绑定的详细介绍及用法在后面的博文中介绍。

