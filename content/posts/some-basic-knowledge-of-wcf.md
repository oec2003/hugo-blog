---
title: WCF的一些基本知识点
date: 2010-07-14
categories: [技术]
tags: [WCF]
---

Windows Communication Foundation (WCF)是Microsoft为构建面向服务的应用提供的分布式通信编程框架，是.NET Framework 3.5的重要组成部分。使用该框架，开发人员可以构建跨平台、安全、可靠和支持事务处理的企业级互联应用解决方案。

构建一个WCF程序通常分为三个部分：服务类（Server）、宿主（Host）、客户程序（Client）。有一个很重要的程序集（System.ServeiceModel）要引用，它包含WCF的核心功能。

贯穿整个WCF的程序会涉及到服务、契约、寄存、端点、地址、绑定、与数据、代理、通道、行为等概念，下面一一介绍下

## 服务

通常为一个类库项目，在实际开发中建议将服务类独立出来。服务类中封装业务功能并提供可以让外部访问的方法集接口。一些具体的操作通常抽像为接口然后由类来实现，并且接口上要用ServiceContractAtrribute来定义，接口中的方法要用OperationContractAttribute来定义，这样任何实现了该接口的类都是服务类型。当然也可以直接在类上来定义契约。

## 契约

契约定义了服务向外界发布的操作，以及WCF 服务与客户相互通讯时的消息格式。WCF 中有四种类型的契约。

* 服务契约: 定义一个接口，给接口附加[ServiceContract] ，给接口方法附加[OperationContract]
* 数据契约: 数据契约定义将在客户端与服务器端传送的各种数据类型。定义数据契约时需要使用[DataContract] 和[DataMember] 。
* 消息契约: 可以使用消息契约来定制WCF 服务与WCF 客户间相互通讯的SOAP 消息格式。
* 错误契约: 定义在服务中如何处理异常，以及这些异常又如何传送到客户端。

## 寄存

服务做好了后需要能够运行，因为客户在调用服务的时候服务必须是处在运行状态的，这就需要将服务寄存在一个地方，在一些Demo中会使用控制台程序来做宿主寄存服务，除此之外还可以是WinForm程序、WPF应用、Windows 服务、IIS、WAS等。

## 端点

端点的用处是方便客户程序调用服务的操作。端点定义了在什么地方可以访问服务、用什么方式访问以及有哪些操作可用，这就是端点的三要素（地址 绑定 契约）。端点可以在程序中设置也可以用配置文件的形式设置。

## 地址:

地址由模式、域、端口和路径组成。模式指所用的传输协议如TCP、命名管线、HTTP、MSMQ等，WCF中针对这些协议的模式为net.tcp 、net.pipe、 http 、net.msmq。看下面例子：

* net.tcp://localhost:10000
* net.pipe://oec2003  [oec2003为机器名]
* http://localhost:10000
* net.msmq://localhost:10000

_在ServerHost中加入多个端点时，需要为每个端点设置唯一的地址。_

## 绑定

绑定描述了某一端点的协议支持。

* HTTP协议：BasicHttpBinding 、 WSHttpBinding 和WSFederationHttpBinding 。
* 两个HTTP 通道实现双向通讯：WSDualHttpBinding。
* TCP协议：NetTcpBinding。
* P2P：NetPeerTcpBinding。
* 命名管道：NamedPipeBinding。
* 消息队列：NetMsmqBinding 和MsmqIntegrationBinding。

## 元数据

这里元数据指的是服务中暴露的接口和服务端点的信息，客户依据这些元数据来生成代理调用服务。元数据可以通过两种方式被调用：1 ServiceHost可以公开一个元数据交换端点（IMetadataExchange）以便客户访问元数据；2 将元数据生成一个WSDL文档来描述端点和服务支持的协议。

## 代理

客户端是使用代理和服务通信。一个代理就是一个类型高开服务契约中的操作，客户调用时，对客户隐藏实现细节。客户端可以使用ChannelFactory或通过引用Web服务的方式来创建代理。

## 通道

通道是为了方便WCF中客户端和服务的通信而建立的。熟悉Remoting的朋友一定不会感到陌生。ServiceHost会为每一个端点创建一个通道侦听器，用来侦听客户端发送的消息。客户段和服务的两种信道必须相互兼容才能保持通信。

## 行为

行为会影响服务对消息的处理方式，当服务和端点确定了核心的通信需求以及和客户端之间共享了元数据后，当行为穿过信道栈时会改变消息的处理方式。行为可以在配置文件中进行配置。

这些概念有的可能不太好理解，但在WCF的学习过程中会始终伴随着他们，也会随着我们不断的学习进而有较深入的理解。下面我就目前的理解对WCF的开发流程做个简单的总结：

* 创建服务，这个通常是个类库项目，可以选择创建一个空的类库项目或是WCF Service Library。如果是创建的空的类库项目，则需要引用程序集System.ServeiceModel。
* 在服务中创建服务契约和服务的操作，一般抽象为接口，ServiceContract和OperationContract标记定义在接口和接口中的方法上，然后创建类继承接口给出具体实现即可。
* 服务需要寄存，必要要有宿主环境，可以根据需要自己选择任意一种，比如控制台程序。需要引用服务的程序集和System.ServeiceModel。然后就是配置端点和绑定。可以用程序的方式或是配置文件的方式。
* 客户端可以是控制台程序、WinForm程序等。拿控制台程序来说吧，创建一个控制台程序，引用程序集System.ServeiceModel。在客户端可以使用ChannelFactory的方式或是通过添加服务引用的方式来创建代理。如果是使用ChannelFactory的方式创建代理，在客户端必须有服务契约的副本，可以将服务中的接口复制到客户端或是添加对服务的引用。创建代理时端点信息可以在程序中写也可以在配置文件中配置。

