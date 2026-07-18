---
title: WCF中客户端生成代理的两种方式
date: 2010-07-16
categories: [技术]
tags: [WCF]
---

WCF程序中客户端要生成代理才能调用服务，在客户端生成代理有多种方式，如用ChannelFactory和添加服务引用等。下面就分别来介绍下这两种生成代理的方式。

## 使用ChannelFactory

使用ChannelFactory创建代理需要的条件

* 服务端点的地址，即在宿主中用程序设置的或是配置文件中设置的。
* 服务端点的绑定协议。
* 服务契约的元数据，可以将服务契约复制一份到客户端或是在客户端添加对服务的引用。

下面的代码示例为通过ChannelFactory手动创建代理

```
EndpointAddress ea =
    new EndpointAddress("http://localhost:10000/Service/HelloWorldService");
IHelloWorldService proxy =
    ChannelFactory<IHelloWorldService>.CreateChannel(new BasicHttpBinding(),ea);
```

* EndpointAddress：端点地址，该类的实例作为CreateChannel方法的一个参数，实例化EndpointAddress时给的地址要和宿主中设置的地址一致。
* IHelloWorldService：这个是服务契约在客户端的一个副本，不包含具体的实现。
* ChannelFactory<T>：一个服务模型类型，可以产生客户代理和基础信道栈，使用该类的CreateChannel可以生成代理，有两个参数，绑定类型和端点地址，绑定类型和端点地址要和宿主中设置的一致。

## 添加服务引用的方式

1 在宿主的配置文件中配置元数据呢交换节点，并在行为中设置serviceMetadata，如下图：

![2010-07-16_163822](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290626408.png)

2 在客户端添加服务引用时必须启动宿主。

3 配置文件设置好后，启动宿主，然后再客户项目上右击选择“Add Service Reference  ”，在地址框中输入正确地址，如下图：

![2010-07-16_164810](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290627453.png)

Http://localhost:10000/mex：是配置文件中的基地址http://localhost:10000加上端点地址mex组合而成。

oec2003：为服务契约中设置的属性Name的值，如下图：

![2010-07-16_165418](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290627963.png)

HelloWorld：为自己定义的引用到客户端的名称。

4 添加服务引用后客户端的项目列表显示如下：

![2010-07-16_165914](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290627665.png)

5 在客户端添加如下代码：

```
class Program
{
    static void Main(string[] args)
    {
        HelloWorld.oec2003Client proxy = new Client.HelloWorld.oec2003Client();
        Console.WriteLine(proxy.SayHello());
        Console.ReadLine();
    }
}
```

6 先运行宿主，然后运行客户程序就可以看到调用服务返回的结果。

