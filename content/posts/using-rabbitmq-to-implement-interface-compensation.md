---
title: 使用RabbitMQ实现接口补偿
date: 2019-10-11T06:32:37+08:00
categories: [技术]
tags: [RabbitMQ,接口补偿]
---

## 业务背景

在我们的日常开发中，经常需要调用第三方接口来进行数据传递，在调用接口的过程中，会因为各种原因导致调用的失败。这时我们希望能有一种机制实现对失败的接口的重复调用，并且能够实现人工干预。

<!--more-->

## 实现思路

1、当接口调用失败，记录相关数据到数据库，采用轮询的方式对数据库的记录进行扫描
2、接口调用失败时，记录相关数据到数据库，同时发送消息到 RabbitMQ ，利用 RabbitMQ 的 TTL(Time To Live) 和 DLX(Dead Letter Exchanges) 特性来实现对接口的重复调用

本文采用的方式是第二种，接口调用流程如下图：

![](https://img.fwhyy.com/2022/202201280641806.webp)

## RabbitMQ

RabbitMQ 可以通过 TTL(Time To Live)、DLX(Dead Letter Exchanges) 特性实现延迟队列。其原理是给消息设置过期时间，在消息队列上为过期消息指定转发器，这样消息过期后会转发到与指定转发器匹配的队列上，就实现了延时队列。消息流转如下图：

![](https://img.fwhyy.com/2022/202201280642093.webp)

### 生产者代码

```
static void Main(string[] args)
{
    var factory = new ConnectionFactory() { HostName = "127.0.0.1", UserName = "oec2003", Password = "123456" };
    using (var connection = factory.CreateConnection())
    while (Console.ReadLine() != null)
    {
        using (var channel = connection.CreateModel())
        {
            var arguments = new Dictionary<string, object>();
            arguments.Add("x-dead-letter-exchange", "exchange-2");
            arguments.Add("x-dead-letter-routing-key", "rk-2");

            channel.QueueDeclare("queue-1",true,false,false,arguments);
        
            channel.ExchangeDeclare("exchange-2", "direct");
            channel.QueueDeclare("queue-2", false, false, false, null);
            channel.QueueBind("queue-2", "exchange-2", "rk-2", null);

            var message = "Hello oec2003!";
            var body = Encoding.UTF8.GetBytes(message);

            var properties = channel.CreateBasicProperties();
            properties.Persistent = true;
            properties.Expiration = "5000";

            channel.BasicPublish("", "queue-1", properties, body);
            Console.WriteLine($"发送： {message}");
        }
    }
    Console.ReadKey();
}
```

### 消费者代码

```
static void Main(string[] args)
{
    var factory = new ConnectionFactory() { HostName = "127.0.0.1", UserName = "oec2003", Password = "123456" };
    using (var connection = factory.CreateConnection())
    using (var channel = connection.CreateModel())
    {
            channel.QueueDeclare("queue-2", false, false, false, null);
            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += (model, ea) =>
            {
                var body = ea.Body;
                var message = Encoding.UTF8.GetString(body); 
                Console.WriteLine("已接收： {0}", message);   
            };
            channel.BasicConsume("queue-2", false, consumer);
    }
    Console.ReadLine(); 
}
```

## 数据库

在数据库中需要存储接口调用的相关信息，有以下几个用途：

* 记录失败次数，作为消息发送时的依据
* 超过最大的重试次数，需要人工来进行手动重新调用

![](https://img.fwhyy.com/2022/202201280642350.webp)

上面表中只是基础的一些字段，在真实业务中可以根据实际情况进行字段的增加。

## 最后

本文提供一种很简单的实现接口补偿的方式，希望对您有所帮助，也欢迎私信讨论。

文中示例代码：[https://github.com/oec2003/StudySamples/tree/master/RabbitMQDLXDemo](https://github.com/oec2003/StudySamples/tree/master/RabbitMQDLXDemo)

