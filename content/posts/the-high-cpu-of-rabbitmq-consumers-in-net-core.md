---
title: NET Core中的RabbitMQ消费者CPU高，竟然是这个原因
date: 2022-06-06T08:08:42+08:00
categories: [技术]
tags: [.NET,RabbitMQ]
---

在 RabbitMQ 中有一个 vhsot 机制，可以用来做租户隔离，当产品从单租户演化为多租户时，正好可以用到这个特性，不同 vhost 中的交换机、队列互不影响。

<!--more-->

起初在产品中引入 RabbitMQ 的时候，版本如下：

* RabbitMQ：3.7.2 （后来升级为 3.8.2）
* RabbitMQ Client：5.1.2
* .NET Core：3.1

通过一段时间的努力，产品终于支持多租户模式了，测试在做测试的时候发现了一个问题，随着租户数添加的越来越多，RabbitMQ 消费者的 CPU 占用也越来越高。

100 左右的租户数，每个租户队列大概 10 几个，这时 CPU 占用稳定在 50% 左右，即使系统没有任何人访问。

分析下可能的原因：

* 因产品比较复杂，可能是其代码影响到；
* 可能是 RabbitMQ 的参数问题；
* 可能是 .NET Core 中的驱动的问题，可以尝试下 Java 。

正式进入问题的排查。

## 简单示例

1、在 .NET Core 3.1 中编写一个简单的 RabbitMQ 示例：

```c#
public void Start()
{
    Console.WriteLine("App Start...");
    _defMqConfig = new MQConfig()
    {
        MQAutomaticRecoveryEnabled = true,
        MQHeartBeat = 5,
        MQNetworkRecoveryInterval = 5,
        MQVHost = "/",
        MQHostName = _mqHostName,
        MQUserName = _mqUserName,
        MQPassword = _mqPassword,
        MQPort = _mqPort,
        MQServerPort = string.IsNullOrEmpty(_mqServerPort) ? $"1{_mqPort}" : _mqServerPort
    };

    Console.WriteLine(" MQ vhost init Start...");
    string prefix = "testhost";
    for (int i = 0; i < 200; i++)
    {
        string vhost = $"{prefix}{i}";
        InitAllVhost(vhost);
        Console.WriteLine($"  初始化vhost：{vhost}...");
    }
    Console.WriteLine(" MQ vhost init Done...");
    Console.WriteLine("App Start Done...");
}
private void InitAllVhost(string vhost)
{
    string url = $"http://{_mqHostName}:{_mqServerPort}";
    _mqManager.AddVirtualHost(url, vhost, _mqUserName, _mqPassword);

    _defMqConfig.MQVHost = vhost;
    _mqManager.Subscribe(_defMqConfig);
}
```

2、监听的代码如下：

```c#
public void Subscribe(MQConfig engineConfig)
{
    var factory = new ConnectionFactory();
    factory.HostName = engineConfig.MQHostName;
    factory.UserName = engineConfig.MQUserName;
    factory.Password = engineConfig.MQPassword;
    factory.VirtualHost = engineConfig.MQVHost;

    factory.RequestedHeartbeat = (ushort) engineConfig.MQHeartBeat; 
    factory.AutomaticRecoveryEnabled = true;
    factory.NetworkRecoveryInterval = new TimeSpan(engineConfig.MQNetworkRecoveryInterval);

    var connection = factory.CreateConnection();
    var channel = connection.CreateModel();

    channel.QueueDeclare("TestQueue", false, false, false, null);
    channel.ExchangeDeclare("TestQueueExchange", ExchangeType.Direct, false, false, null);

    var consumer = new EventingBasicConsumer(channel);
    channel.BasicConsume("TestQueue", false, consumer);
    channel.QueueBind("TestQueue", "TestQueueExchange", "TestQueueExchange");

    consumer.Received += (model, ea) =>
    {
        var body = ea.Body;
        var message = Encoding.UTF8.GetString(body);
        Console.WriteLine("已接收： {0}", message);
    };
}
```

3、上面代码创建了 200 个 vhost ，每个 vhost 中 1 个队列，程序运行后观察 cpu 如下图：

![image-20220604073115855](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206040731318.png)

4、在 Subscribe 方法中有创建 Connection 和 CreateModel 方法，如果使用 using 或在方法最后对其进行释放，CPU 会是一个正常的状态，但消息也就接收不到了。

## 调整参数

1、在 RabbitMQ 中有两个参数 MQHeartBeat、MQNetworkRecoveryInterval ：

* MQHeartBeat：心跳检测
* MQNetworkRecoveryInterval：掉线重连

2、不断调整这两个参数的值，进行尝试，发现 CPU 并没有明显改善。

## 尝试 Java

当没有什么头绪的时候，就会采用各种方式进行尝试，来排除问题，所以决定用 Java 试试。

在 Java 程序中，使用的 RabbitMQ 客户端为 rabbitmq-java-client ，版本为 5.14.2 ，因为之前在 .NET 程序验证时已经创建了 vhost ，所以在 Java 程序中只写了消费者进行监听。

当 Java 程序跑起来的时候，发现 CPU 占用是正常的，在遍历 vhost 监听的过程中 CPU 有所波动，遍历完后 ，CPU 占用比较稳定。

## 真正的原因

这时基本可以确定，是 .NET Core 的 RabbitMQ 客户端的问题，到这时才想起有可能是 .NET Core  RabbitMQ 客户端的版本问题，检查发现目前使用的版本是 5.1.2，而最新的版本为 6.3.0 。

升级 .NET Core RabbitMQ 到最新版本，升级后有两个地方不兼容：

* RequestedHeartbeat 类型变成了 TimeSpan；
* 接收的消息由 byte[] 变成了 ReadOnlyMemory<byte> 类型。

![image-20220604140600798](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206041406417.png)

修改这两处后，赶紧运行进行测试，CPU 终于正常了。

查看了下 RabbitMQ 客户端在 GitHub 上的更新记录，发现在版本 6.2.4 中有修复一个关于连接的 Bug：

![image-20220604142157185](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206041422540.png)

又继续将版本回退到 6.2.3 进行测试，问题又能重现了，就更加确定了这个问题是在 6.2.4 中解决了。

## 最后

现在无论是做项目还是做产品，都会使用很多的中间件，这些中间件和相关的库也是在不断地更新迭代的，当我们在不断地进行功能迭代的同时，也需要关注这些中间件的发展，在新的版本中有提供是什么新的特性，修复了什么问题，可以给我们是否升级提供依据。

