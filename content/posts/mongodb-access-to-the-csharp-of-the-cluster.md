---
title: C#访问群集部署时的MongoDB
date: 2015-08-13
categories: [技术]
tags: [C#, MongoDB ]
---

普通的MongoDB部署有一台主、一台备，程序连接MongoDB时需要主服务器的地址以及端口，当群集部署的时候就会有多个服务器地址需要连接，MongoDB的C# API可以支持同时连接多台服务器。
<!--more-->
## 单台

```
MongoClient mc = new MongoClient("mongodb://oec2003:20720");
MongoServer ms = mc.GetServer();
MongoDatabase md = ms.GetDatabase("DBName");
```

### 群集

```
List<MongoServerAddress> list = new List<MongoServerAddress>();
list.Add(new MongoServerAddress("192.168.16.207", 40000));
list.Add(new MongoServerAddress("192.168.16.208", 40000));
list.Add(new MongoServerAddress("192.168.16.209", 40000));
MongoClientSettings mcs = new MongoClientSettings();
mcs.Servers = list;
MongoClient mc = new MongoClient(mcs);
MongoServer ms = mc.GetServer();

MongoDatabase md = ms.GetDatabase("DBName");
```

