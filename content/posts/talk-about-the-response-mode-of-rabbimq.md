---
title: 说说 RabbiMQ 的应答模式
date: 2021-01-11T08:08:40+08:00
categories: [技术]
tags: [RabbitMQ]
---

RabbiMQ 我们都很熟悉了，是很常用的一个开源消息队列。搞懂 RabbiMQ 的应答模式对我们排查错误很有帮助，也能避免一些坑。本文说说 RabbiMQ 的应答模式。

生产者发出一条消息给 RabbiMQ ，服务端将消息推送给消费者，消费者处理完消息后告诉 RabbiMQ，我已经接收到消息并处理了，RabbiMQ 收到通知后会将消息从队列中删除。 消费者通知 MQ 的这个过程就是消息的应答。在 RabbiMQ 中有两种应答模式：自动应答和手动应答。

<!--more-->

## 版本

- dotNET Core ：3.1
- RabbitMQ：3.8.2
- RabbitMQ.Client：6.2.1

## 自动应答

当 RabbiMQ 开启了消息的自动应答，一旦 RabbiMQ 将消息分发给了消费者，就会将消息从内存中删除。这种情况下，如果正在执行的消费者挂掉，就会丢失正在处理的消息。

### 生产者代码

```csharp
static void Main(string[] args)
{
    ConnectionFactory factory = new ConnectionFactory
    {
        UserName = "oec2003",
        Password = "000000",
        HostName = "10.211.55.6"
    };

    using (var connection = factory.CreateConnection())
    using (var channel = connection.CreateModel())
    {
        Console.WriteLine("RabbitMQ连接成功，请输入消息，输入exit退出");
        channel.QueueDeclare("oec2003", false, false, false, null);
        string input;
        do
        {
            input = Console.ReadLine();
            var body = Encoding.UTF8.GetBytes(input);
            channel.BasicPublish("", "oec2003", null, body);
        }
        while (input.Trim().ToLower() != "exit");
    }
}
```

### 消费者代码

```csharp
static void Main(string[] args)
{
    ConnectionFactory factory = new ConnectionFactory
    {
        UserName = "oec2003",
        Password = "000000",
        HostName = "10.211.55.6"
    };
    using (var connection = factory.CreateConnection())
    using (var channel = connection.CreateModel())
    {
        Console.WriteLine("消费者开始监听......");
        channel.QueueDeclare("oec2003", false, false, false, null);
        EventingBasicConsumer consumer = new EventingBasicConsumer(channel);
        consumer.Received += (ch, ea) =>
        {
            string message = Encoding.Default.GetString(ea.Body.ToArray());
            Console.WriteLine($"{DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")}：收到消息： {message}");
            System.Threading.Thread.Sleep(10000);
        };
        channel.BasicConsume("oec2003", true, consumer);
        Console.ReadKey();
    }
}
```

- `channel.BasicConsume` 方法的第二个参数设置为 true 表示自动应答；
- 开启自动应答后，消息是生产者发布后，当有消费者链接上后，所有的消息都会被自动确认，并且从内存中删除，这时如果消费者进程挂掉，没有处理的消息会丢失，正在处理中的消息也不会被重新投递；
- 自动应答的好处是消息队列不会处于堵塞状态，但代价有点大，生产环境中还是不能使用。

## 手动应答

手动应答，当消费者接收到消息处理完后，需要发送一个回执，告诉 RabbiMQ 服务端，这时 RabbiMQ 才会将该消息删除。

生产者的代码和上面的一样，消费者代码需要做相关调整，如下：

```csharp
static void Main(string[] args)
{
    ConnectionFactory factory = new ConnectionFactory
    {
        UserName = "oec2003",
        Password = "000000",
        HostName = "10.211.55.6"
    };
    using (var connection = factory.CreateConnection())
    using (var channel = connection.CreateModel())
    {
        Console.WriteLine("消费者开始监听......");
        EventingBasicConsumer consumer = new EventingBasicConsumer(channel);
        consumer.Received += (ch, ea) =>
        {
            string message = Encoding.Default.GetString(ea.Body.ToArray());
            Console.WriteLine($"{DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")}：收到消息： {message}");
           
            channel.BasicAck(ea.DeliveryTag, false);
        };
        channel.BasicConsume("oec2003", false, consumer);
        Console.ReadKey();
    }
}
```

- `channel.BasicConsume` 方法的第二个参数设置为 false ，表示手动应答模式；
- 在处理完消息后调用 `channel.BasicAck(ea.DeliveryTag, false);` 来进行应答，告诉 RabbiMQ 消息已经收到，RabbiMQ 收到这个回执后，才会删除消息。

## 可能遇到的问题

### 流量控制问题

在手动模式下，生产者发送消息后消息会从 Ready 进入到 Unacked 中，当消费者进行应答之后消息从 Unacked 中删除。

![](https://img.fwhyy.com/2022/202201302004116.webp)

如果消息的产生速度远远大于消费者的处理速度，这时消息就会都在消费者处进行积压了。我们会看到 Unacked 中的数量会越来越大，这样消费者的压力就会越来越大，这时就需要使用 Qos 来进行限流。

### Qos

在消费者中使用 `channel.BasicQos(0, 2, false);` 来进行 Qos 的设置，如下图：

![](https://img.fwhyy.com/2022/202201302005355.webp)

BasicQos 方法有三个参数：

- prefetchSize：批量取的消息的总大小，0为不限制；
- prefetchCount：每次处理消息的个数，比如 prefetchCount 设置为 2 ，那么处于 Unacked 状态的消息最多就 2 条，当其中一条进行了得到了应答后，才会从 Ready 中转入一条到 Unacked
- global：设置为 true 表示对 channel 进行控制，否则对每个消费者进行限制，一个 channel 可以有多个消费者

使用 Qos 的好处：

- 提高服务稳定性，因为有 prefetchCount 参数的控制，不会有海量的数据涌进来导致消费者服务挂掉；
- 提高吞吐量，当队列有多个消费者时，每个消费者的能力不一样，我们可以通过 prefetchCount 参数来合理安排每个消费者的处理能力，不会出现有的空闲，有的积压。

prefetchCount 是一个非常关键的参数，当消费数据时，出现一些异常情况，导致无法进行 Ack 应答，没有应答的数量大于等于 prefetchCount 时，队列就会发生堵塞。所以我们一定要确保消息的处理能够被异常捕获，并在 finally 中进行 Ack 应答，代码如下：

```csharp
try
{
    string message = Encoding.Default.GetString(ea.Body.ToArray());
    Console.WriteLine($"{DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")}：收到消息： {message}");
    if (message == "error")
    {
        throw new Exception("mq error");
    }
    else if (message == "sleep")
    {
        System.Threading.Thread.Sleep(60000);
    }
}
catch (Exception)
{
    //处理异常
}
finally
{
    channel.BasicAck(ea.DeliveryTag, false);
}
```

一旦队列堵塞了，一种处理方式就是断掉客户端，这样，处在 Unacked 中的消息会重新回到 Ready 中，会重新进行投递进行消费。

## 总结

1、自动应答模式需要慎用，特别是生产环境；

2、不开启 Qos ，消费者可能会面临很大压力，但消息不会堵塞（测试过 500 个未进行 Ack 没有造成堵塞），现在不确定在没有 Qos 的情况下，有没有默认的最大 prefetchCount ；

3、开启 Qos ，prefetchCount 的值很关键，并且需要做好异常处理，防止堵塞。

希望本文对您有所帮助！