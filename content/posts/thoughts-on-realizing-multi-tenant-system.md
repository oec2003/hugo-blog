---
title: 实现多租户系统的一点思考
date: 2021-05-17T08:05:00+08:00
categories: [思考]
tags: [多租户]
---

2020年突发的新冠疫情，让在线协同办公在疫情期间成为了刚需。我们也从 2020 年的 2月3 日开始在家远程办公，直到四月份。协同办公软件一下子火爆了起来，钉钉、企业微信、特别是腾讯会议等都在疫情期间表现突出，呈现出井喷式的发展。

目前大部分的企业信息化都是私有化部署，局限于企业的内部网络，无法实现远程协同办公，所以越来越多的 To B 企业逐步转向 SaaS（Software-as-a-Service，软件即服务），SaaS 最早是美国Salesforce公司（1999年创立）创造的新软件服务模式。这家公司的市值在 2019 年已经超过1000亿美元，国内现在还处在发展中阶段，前景还是十分广阔的。

要将传统的私有化部署的软件重构成支持 SaaS 模式，多租户是一个迈不过去的坎，首先需要将系统改造成多租户模式，然后再逐步实现计费、系统监控、用户行为分析等功能。

我觉得多租户的设计应该分为三个层面来进行讨论，应用、数据库和中间件。

## 应用

现在的项目或产品开发几乎都是前后端分离的开发模式，应用层主要指的是 WebAPI ，WebAPI 的改造有两种方式：

1、每个租户部署一套 WebAPI、上层通过域名或 Url 地址的解析进行路由，当有新租户注册的时候就动态进行对应的 WebAPI 的部署，这种方式改造成本低，但运维成本高，不建议使用，如果时间紧，可以当过度阶段的临时方案。

![iShot2022-02-02 07.35.55](https://img.fwhyy.com/2022/202202020736143.webp)

2、所有的租户共用一套 WebAPI ，在 WebAPI 中需要获取到租户信息（域名、Url参数、请求头信息、Cookie 等），然后进行租户信息配置的切换。有新租户创建的时候无需进行新的 WebAPI 的创建，只需要初始化租户基本信息即可。

![iShot2022-02-02 07.36.31](https://img.fwhyy.com/2022/202202020736943.webp)

在这种方式下，如果 Cluster1 的负载超过限度了，也要能够进行动态切换，将其中的某些租户切换到其他的 Cluester 中，如上图。

在 WebAPI 的代码实现上，可以参考 Abp 框架中多租户的实现，这里给出一个简化版本：

TenantConfiguration：租户配置信息

```
[Serializable]
public class TenantConfiguration
{
    public Guid Id { get; set; }

    public string Code { get; set; }

    public string Name { get; set; }

    public TenantStatus TenantStatus { get; set; }

    public string DBConfig { get; set; }

    public string CacheConfig { get; set; }

    public string MQConfig { get; set; }

    public string MongoConfig { get; set; }

    public TenantConfiguration()
    {
        TenantStatus = TenantStatus.Enable;
    }

    public TenantConfiguration(Guid id, string name)
        : this()
    {
       
        Id = id;
        Name = name;
    }
}
```

TenantStore：从缓存或数据库中获取租户配置信息

```
public interface ITenantStore
{
    TenantConfiguration Find(string code);
}
public class TenantStore : ITenantStore
{
    public TenantConfiguration Find(string code)
    {
        //从缓存或数据库进行租户配置信息获取
        throw new NotImplementedException();
    }
}
```

CurrentTenant：当前租户类，用来存储当前租户信息，以及切换租户

```
public interface ICurrentTenant
{

    TenantConfiguration Config { get;}
    IDisposable Change(string code);
}
/// <summary>
/// 当前租户
/// </summary>
public class CurrentTenant:ICurrentTenant
{
    public ITenantStore _tenantStore;
    public CurrentTenant(ITenantStore tenantStore)
    {
        _tenantStore = tenantStore;
    }

    public TenantConfiguration _config;
    public TenantConfiguration Config => _config;

    /// <summary>
    /// 切换租户
    /// </summary>
    /// <param name="code"></param>
    /// <returns></returns>
    public IDisposable Change(string code)
    {
        TenantConfiguration tenantConfig= _tenantStore.Find(code);
        if (tenantConfig == null)
        {
            throw new Exception("Tenant not found");
        }

        if (tenantConfig.TenantStatus != TenantStatus.Enable)
        {
            throw new Exception("Tenant is disabled or deleted");
        }

        return new DisposeAction(() =>
        {
            _config = tenantConfig;
        });
    }
}
```

UrlTenantResolve：根据 Url 参数进行租户解析

```
public interface ITenantResolve
{
    string Resolve(HttpContext httpContext);
}
/// <summary>
/// 
/// </summary>
public class UrlTenantResolve:ITenantResolve
{

    public string Resolve(HttpContext httpContext)
    {
        return httpContext.Request.QueryString.HasValue
           ? httpContext.Request.Query["__tenant"].ToString()
           : null;
    }
}
```

MultiTenancyMiddleware：租户中间件，关于在 dotNET Core 中自定义中间件可以参考《[dotNET Core 3.X 请求处理管道和中间件的理解](http://mp.weixin.qq.com/s?__biz=MzU0NjgzNzQyMw==&mid=2247484111&idx=1&sn=5bc66c5de4561248f56df9b1960812b5&chksm=fb56c40fcc214d1983761efcba01e8c705c41123a7cf08de6b2b3308a4800988f95fb4102ab9&scene=21#wechat_redirect)》

```
public class MultiTenancyMiddleware: IMiddleware
{
    protected readonly ITenantResolve _tenantResolve;
    private readonly ICurrentTenant _currentTenant;

    public MultiTenancyMiddleware(
       ITenantResolve tenantResolve,
       ICurrentTenant currentTenant)
    {
        _tenantResolve = tenantResolve;
        _currentTenant = currentTenant;
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var tenantCode = _tenantResolve.Resolve(context);

        if (tenantCode != _currentTenant.Config.Code)
        {
            using (_currentTenant.Change(tenantCode))
            {
                await next(context);
            }
        }
        else
        {
            await next(context);
        }

        await next(context);
    }
}
```

## 数据库

数据库在这里指的是关系型数据库，用来存储业务数据，实现多租户，就要对数据进行隔离，通常的数据隔离方式有三种模式：

1、完全隔离，每个租户使用独立数据库；

2、部分共享，租户共享一个数据库，以 schema 或者 table 区分；

3、完全共享，租户共享相同的数据库表，以 tenant_id 进行区分

推荐使用第一种或第二种，隔离程度比较高，也比较容易做横向扩展，如果是第三种，需要处理数据的隔离问题，需要处理单表大数据的问题等，对技术要求比较高。

## 中间件

除了数据库，一个系统还需要依赖其他的一些中间件，比如缓存、消息队列、文件存储：

- 缓存：Redi
- 消息队列：RabbitMQ
- 文件存储：MongoDB 的 GridFS

### Redis

1、Redis 中使用数据库的方式进行租户隔离；

2、Redis 可以通过修改配置文件的方式进行数据库的扩展，默认为 16 个；3、通过 Redis 分片集群的方式进行部署，可以进行横向扩展；3、在 Redis 集群中，官方推荐节点数量不超过 1000 个，这个对于多租户系统的前期来说应该是够用了，如果到了租户数量的爆发期，再进行架构的扩展，比如，不同的租户路由到不同的 Redis 集群中。

### RabbitMQ

在 Rabbitmq 有 vhost 机制，可以一个租户创建一个vhost，通过 vhost 来进行租户的隔离，目前还没查询到 vhost 是否有上限，需要做进一步验证。

### MongoDB

MongoDB 中主要使用 GridFS 来进行非结构化数据的存储，通过创建数据库的方式来进行租户的隔离，而且 MongoDB 支持分片的集群部署方式，可以进行扩展横扩展，在前期，一个 MongoDB 集群应该就够用了。

## 最后

技术方案和架构没有最好的，只有最适合的，符合当下的业务场景、团队的技术能力就可以，然后要做的就是做 MVP （最小可行性产品），进而进行系统的改造。

希望本文对您有所帮助！
