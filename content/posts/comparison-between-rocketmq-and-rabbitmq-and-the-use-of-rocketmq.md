---
title: RocketMQ 和 RabbitMQ 的比较以及 RocketMQ 的使用
date: 2025-01-02T18:28:00+08:00
categories: [技术]
tags: [RocketMQ,消息队列]
---
消息队列在项目中会经常用到，目前我们使用的是 RabbitMQ，但在 Java 技术栈下，RocketMQ 使用的比较多。下面比较下 RabbitMQ 和 RocketMQ。

<!-- more -->

## RabbitMQ 和 RocketMQ 对比

### 1、设计理念和架构

RabbitMQ： 

基于 AMQP（Advanced Message Queuing Protocol）协议，使用 Erlang 语言开发。Erlang 的天生高并发和容错性使得 RabbitMQ 在稳定性方面表现出色。RabbitMQ 的核心概念是 Exchange（交换机）和 Queue（队列），消息通过 Exchange 路由到 Queue，再由消费者消费。这种模型非常灵活，支持多种消息路由模式。

RocketMQ：

源于阿里巴巴，后捐献给 Apache 基金会，所以现在的官网是：https://rocketmq.apache.org/ 。使用 Java 语言开发，更贴近 Java 技术栈。RocketMQ 的核心概念是 Topic（主题），消息发送到 Topic，消费者订阅 Topic 进行消费。RocketMQ 的设计目标是高吞吐量、低延迟和高可靠性，适合大规模分布式系统。

RocketMQ 的设计理念更偏向于解决互联网场景下的具体问题，如海量消息处理、消息顺序性等。

### 2、性能

吞吐量：RocketMQ 在吞吐量方面通常优于 RabbitMQ，尤其是在高并发场景下。RocketMQ 的设计更偏向于高吞吐的消息传递，而 RabbitMQ 更注重消息的可靠性和灵活性。

延迟：两者在延迟方面都表现不错，但在极端高负载情况下，RocketMQ 的延迟可能更低一些。

不过在 ToB 的一些业务场景，RabbitMQ 是可以胜任的。

### 3、特性

消息路由：RabbitMQ 支持多种 Exchange 类型（Direct、Topic、Fanout、Headers），提供更丰富的消息路由策略。RocketMQ 主要使用 Topic 进行消息路由，相对简单。

消息过滤：RocketMQ 支持基于 Tag 和 SQL 的消息过滤，方便消费者按需订阅消息。RabbitMQ 的消息过滤相对较弱。

事务消息：RocketMQ 提供了分布式事务消息的支持，可以保证消息生产和本地事务的原子性。RabbitMQ 没有直接提供事务消息的支持，需要通过其他方式实现。

延迟消息：RocketMQ 支持延迟消息，可以实现定时任务等功能。RabbitMQ 通过插件可以实现类似功能。

监控和管理：RocketMQ 和 RabbitMQ 都提供了丰富的监控指标和管理工具，相比之下我更喜欢 RocketMQ 的管理工具。

### 4、创新点

RabbitMQ:

- 插件系统设计灵活，易于扩展
- 虚拟主机（vhost）概念，实现多租户隔离
- 内存和磁盘节点的混合部署方案

RocketMQ:

- 基于文件的消息存储系统，避免了缓存未刷盘导致的消息丢失
- Pull 模式和长轮询机制的结合，平衡了实时性和性能
- 消息过滤支持在 Broker 端完成，减少网络传输开销

### 5、Exchange 和 Topic 的区别

RabbitMQ的 Exchange 和 RocketMQ 的 Topic 在消息路由机制上有以下主要区别：

概念和角色

RabbitMQ Exchange 是一个路由组件，负责接收生产者发送的消息并将其路由到一个或多个队列，作为消息的"交换机"，它不存储消息，只负责消息的路由转发，需要通过 binding key 与 Queue 建立绑定关系。

RocketMQ Topic 是消息的逻辑分类，直接作为消息的存储和投递单元，包含多个消息队列（MessageQueue），用于存储消息，消费者直接订阅 Topic 即可接收消息。

RabbitMQ 的 key 绑定和 Exchange、队列的关系，一开始不太容易理解，相比之下 RocketMQ 的 Topic 和队列关系更清晰。

路由方式

RabbitMQ Exchange 支持四种路由策略，路由更加灵活，可以实现复杂的消息分发模式

* Direct：根据routing key精确匹配
* Topic：根据routing key的模式匹配
* Fanout：广播到所有绑定的队列
* Headers：根据消息属性匹配

RocketMQ Topic 采用发布/订阅模式，更加简单直接，通过Tag机制实现消息过滤。支持消息队列的负载均衡。

消息存储

RabbitMQ Exchange 不存储消息，消息存储在 Queue 中，消息一旦被路由到 Queue 就与Exchange 无关。

RocketMQ Topic 直接存储消息，每个 Topic 包含多个消息队列。消息存储在 CommitLog 中，通过 ConsumeQueue 建立索引。

## Docker-compose 部署 RocketMQ

同样是使用容器进行部署，RabbitMQ 一个容器搞定，RocketMQ 需要两个容器（NameServer 和 Broker），如果需要 web 管理工具，还需要再单独部署一个容器。

当进行集群模式部署时，RocketMQ 的下载包中有各种集群模式的示例配置文件，这对新手非常友好。

![](https://img.fwhyy.com/2025/202501011909246.webp)

下面是部署 RocketMQ 的 docker-comopose 文件的内容：

```yaml
version: '3'

# 定义自定义网络
networks:
  rmq_network:
    driver: bridge
    ipam:
      config:
        - subnet: 192.168.10.0/24

services:
  # RocketMQ Name Server
  namesrv:
    image: apache/rocketmq:5.1.4
    container_name: rmqnamesrv
    networks:
      rmq_network:
        ipv4_address: 192.168.10.2
    ports:
      - 9876:9876
    volumes:
      - ./data/namesrv/logs:/home/rocketmq/logs
    command: sh mqnamesrv
    environment:
      - JAVA_OPT_EXT=-server -Xms512m -Xmx512m

  # RocketMQ Broker
  broker:
    image: apache/rocketmq:5.3.1
    container_name: rmqbroker
    networks:
      rmq_network:
        ipv4_address: 192.168.10.3
    ports:
      - 10909:10909
      - 10911:10911
      - 10912:10912
    volumes:
      - ./data/broker/logs:/home/rocketmq/logs
      - ./data/broker/store:/home/rocketmq/store
      - ./conf/broker.conf:/home/rocketmq/conf/broker.conf
    command: sh mqbroker -c /home/rocketmq/conf/broker.conf
    environment:
      - JAVA_OPT_EXT=-server -Xms512m -Xmx512m
    depends_on:
      - namesrv

  # RocketMQ Dashboard 
  dashboard:
    image: apacherocketmq/rocketmq-dashboard:1.0.0
    container_name: rmqdashboard
    networks:
      rmq_network:
        ipv4_address: 192.168.10.4
    ports:
      - 19080:8080
    environment:
      - JAVA_OPTS=-Drocketmq.namesrv.addr=namesrv:9876
    depends_on:
      - namesrv

```

broker.conf 的内容如下：

```c
# broker集群名称
brokerClusterName = DefaultCluster
# broker名称
brokerName = broker-a
# broker编号，0表示master，大于0表示slave
brokerId = 0
# 删除过期文件时间点，默认是凌晨4点
deleteWhen = 04
# 文件保留时间，默认48小时
fileReservedTime = 48
# broker角色，ASYNC_MASTER=异步复制Master，SYNC_MASTER=同步双写Master，SLAVE=slave节点
brokerRole = ASYNC_MASTER
# 刷盘方式，ASYNC_FLUSH=异步刷盘，SYNC_FLUSH=同步刷盘
flushDiskType = ASYNC_FLUSH
# nameServer地址，分号分割
namesrvAddr = namesrv:9876
# 在发送消息时，自动创建服务器不存在的topic，默认创建的队列数
defaultTopicQueueNums = 4
# 是否允许 Broker 自动创建Topic，建议线下开启，线上关闭
autoCreateTopicEnable = true
# 是否允许 Broker 自动创建订阅组，建议线下开启，线上关闭
autoCreateSubscriptionGroup = true
# brokerIP1 注意：本地测试使用本机的宿主机的IP
brokerIP1=192.168.1.109
```

## 代码示例

对于消息队列，单播、广播、重试，这三种场景用的比较多。下面就看看这三个场景是怎么实现的。

1、创建生产者 Service 类来处理消息的发送：

```java

@Slf4j
@Service
public class MessageProducerService {

    // RocketMQ消息主题
    public static final String TOPIC_UNICAST = "topic-unicast";
    public static final String TOPIC_BROADCAST = "topic-broadcast";
    public static final String TOPIC_RETRY = "topic-retry";

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    /**
     * 发送单播消息（点对点）
     * 单播消息会被消费组中的某一个消费者消费
     */
    public void sendUnicastMessage(MessageEvent message) {
        rocketMQTemplate.convertAndSend(TOPIC_UNICAST, message);
        log.info("Unicast message sent: {}", message);
    }

    /**
     * 发送广播消息
     * 广播消息会被所有订阅该主题的消费者消费
     */
    public void sendBroadcastMessage(MessageEvent message) {
        rocketMQTemplate.convertAndSend(TOPIC_BROADCAST, message);
        log.info("Broadcast message sent: {}", message);
    }

    /**
     * 发送需要重试的消息
     * 使用异步发送方式，并在回调中处理发送结果
     */
    public void sendRetryMessage(MessageEvent message) {
        rocketMQTemplate.asyncSend(TOPIC_RETRY, message, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                log.info("Retry message sent successfully: {}, result: {}", message, sendResult);
            }

            @Override
            public void onException(Throwable throwable) {
                log.error("Failed to send retry message: {}, error: {}", message, throwable.getMessage());
            }
        });
    }
}

```

2、创建消费者 Service 类来处理消息的接收：

```java

@Slf4j
@Service
public class MessageConsumerService {

    // RocketMQ消息主题
    public static final String TOPIC_UNICAST = "topic-unicast";
    public static final String TOPIC_BROADCAST = "topic-broadcast";
    public static final String TOPIC_RETRY = "topic-retry";
    /**
     * 单播消息消费者
     * consumeMode默认为CONCURRENTLY（并发消费）
     */
    @Service
    @RocketMQMessageListener(
            topic = TOPIC_UNICAST,
            consumerGroup = "unicast-consumer-group"
    )
    public class UnicastMessageListener implements RocketMQListener<MessageEvent> {
        @Override
        public void onMessage(MessageEvent message) {

            log.info("Received unicast message: {}", message);
        }
    }

    /**
     * 广播消息消费者
     * messageModel设置为BROADCASTING表示广播模式
     */
    @Service
    @RocketMQMessageListener(
            topic = TOPIC_BROADCAST,
            consumerGroup = "broadcast-consumer-group",
            messageModel = MessageModel.BROADCASTING
    )
    public class BroadcastMessageListener implements RocketMQListener<MessageEvent> {
        @Override
        public void onMessage(MessageEvent message) {
            log.info("Received broadcast message: {}", message);
        }
    }

    /**
     * 重试消息消费者
     * 配置了重试次数和重试间隔
     */
    @Service
    @RocketMQMessageListener(
            topic = TOPIC_RETRY,
            consumerGroup = "retry-consumer-group",
            maxReconsumeTimes = 3,    // 最大重试次数
            delayLevelWhenNextConsume = 2  // 重试间隔级别
    )
    public class RetryMessageListener implements RocketMQListener<MessageEvent> {
        @Override
        public void onMessage(MessageEvent message) {
            try {
                // 模拟处理失败的情况
                if (message.getContent().contains("error")) {
                    throw new RuntimeException("Processing failed, will retry");
                }
                log.info("Received retry message: {}", message);
            } catch (Exception e) {
                log.error("Error processing message: {}, error: {}", message, e.getMessage());
                throw e; // 抛出异常触发重试机制
            }
        }
    }
}

```

3、创建 MessageController 来进行测试：

```java

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageProducerService producerService;

    @PostMapping("/unicast")
    public String sendUnicastMessage(@RequestParam String content) {
        MessageEvent message = new MessageEvent()
                .setId(UUID.randomUUID().toString())
                .setContent(content)
                .setTimestamp(System.currentTimeMillis());
        producerService.sendUnicastMessage(message);
        return "Unicast message sent successfully";
    }

    @PostMapping("/broadcast")
    public String sendBroadcastMessage(@RequestParam String content) {
        MessageEvent message = new MessageEvent()
                .setId(UUID.randomUUID().toString())
                .setContent(content)
                .setTimestamp(System.currentTimeMillis());
        producerService.sendBroadcastMessage(message);
        return "Broadcast message sent successfully";
    }

    @PostMapping("/retry")
    public String sendRetryMessage(@RequestParam String content) {
        MessageEvent message = new MessageEvent()
                .setId(UUID.randomUUID().toString())
                .setContent(content)
                .setTimestamp(System.currentTimeMillis());
        producerService.sendRetryMessage(message);
        return "Retry message sent successfully";
    }
}

```