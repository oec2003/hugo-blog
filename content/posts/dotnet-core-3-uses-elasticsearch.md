---
title: dotNet Core 3.1 使用 Elasticsearch
date: 2021-01-25T09:36:06+08:00
categories: [技术]
tags: [dotNET Core,Elasticsearch]
---

Elasticsearch 是基于 Lucene 的搜索引擎。可以非常方便地实现分布式的全文搜索，本文介绍在 dotNet Core 3.1 中怎样使用  Elasticsearch 。

<!--more-->

## 版本

- dotnet Core ：3.1
- Elasticsearch：7.6.1
- Kibana：7.6.1
- NEST：7.10.1
- Docker：19.03.13

## Docker 安装 Elasticsearch

为了方便，我们以 Docker 的方式来进行安装，这里使用的版本为 7.6.1，首先执行下面命令进行镜像的拉取：

```bash
docker pull elasticsearch:7.6.1
```

注意：这里需要指定相关版本，版本可以在 dockerhub 上进行查询 ，否则拉镜像的时候可能出现 下面错误：

```bash
Error response from daemon: manifest for elasticsearch:latest not found: manifest unknown: manifest unknown
```

镜像成功拉取后，执行 docker run 命令构建容器，命令如下：

```bash
docker run -d --name myes -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" elasticsearch:7.6.1
```

为了更好地进行中文的搜索，需要安装中文分词插件，本文中安装的中文分词插件为 ik ，版本和 Elasticsearch 一致，安装方法如下：

进入容器后执行：

```bash
./bin/elasticsearch-plugin install [https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.6.1/elasticsearch-analysis-ik-7.6.1.zip](https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v6.5.4/elasticsearch-analysis-ik-6.5.4.zip)
```

安装成功后的如下图所示：

![](https://img.fwhyy.com/2022/202201300637152.webp)

## Docker 安装 Kibana

Kibana 是一个免费的用户界面，能够让您对 Elasticsearch 数据进行可视化，不是必须，但可以更好地查看数据。

执行下面命令进行镜像的拉取，版本和 Elasticsearch 一致：

```bash
docker pull kibana:7.6.1
```

在宿主机创建 /root/data/elk/ 目录并创建配置文件 kibana.yml ，内容如下：

```
# Default Kibana configuration for docker target
server.name: kibana
server.host: "0"
elasticsearch.hosts: [ "http://172.17.0.6:9200" ]
xpack.monitoring.ui.container.elasticsearch.enabled: true
```

elasticsearch.hosts 配置为 Elasticsearch 的访问地址。

执行下面命令进行容器的创建 

```bash
docker run -d --restart=always --log-driver json-file --log-opt max-size=100m --log-opt max-file=2 --name mykibana -p 5601:5601 -v /root/data/elk/kibana.yml:/usr/share/kibana/config/kibana.yml kibana:7.6.1
```

创建成功后，访问 5601 端口，出现如下界面说明创建成功：

![](https://img.fwhyy.com/2022/202201300637797.webp)

## Elasticsearch 的 API

Elasticsearch 提供 API 的方式来进行数据操作，非常方便，常用的三个接口：

- 插入数据
- 获取单条数据
- 查询数据

### 插入数据

[http://10.211.55.6:9200/index/oec2003/1](http://10.211.55.6/index/oec2003/1)  

![](https://img.fwhyy.com/2022/202201300638858.webp)

- index：我的理解是相当于数据库表的概念；
- oec2003：在 Elasticsearch 的 index 中有个 Type 的概念，相当于分组，当目前的 7.6.1 版本中一个 index  中只能有一个 Type ,所以相当于可以忽略；
- 1：单条记录的 id；
- 接口为 Post 方式，数据内容为 Json 格式，字段可以算变定义，而且每条数据的字段可以不相同。

### 获取单条数据

[http://10.211.55.6:9200/index/oec2003/1](http://10.211.55.6/index/oec2003/1)  

![](https://img.fwhyy.com/2022/202201300638510.webp)

### 搜索数据

[http://10.211.55.6:9200/index/oec2003/](http://10.211.55.6/index/oec2003/1)_search

![](https://img.fwhyy.com/2022/202201300639271.webp)

- 查询接口为 Post 方式；
- 查询表达式也是 Json 格式，如果熟悉 MongoDB 的 Document ，应该会感觉很熟悉。

## 在 dotNet Core 3.1 中使用

1、在 VS 2019 中创建 dotNet Core 3.1  的 WebAPI 项目 ElasticsearchWebAPIDemo ；

2、引用 Nuget 包 NEST；

3、创建一个 Elasticsearch 的客户端连接接口和类，代码如下：

```csharp
class ESClientProvider : IESClientProvider
{
    private ElasticClient _client;
    public ESClientProvider()
    {
    }
    public ElasticClient GetClient()
    {
        if (_client != null)
            return _client;

        InitClient();
        return _client;
    }
    private void InitClient()
    {
        var node = new Uri("http://10.211.55.6:9200");
        _client = new ElasticClient(new ConnectionSettings(node).DefaultIndex("userinfo"));
    }
}
public interface IESClientProvider
{
    ElasticClient GetClient();
}
```

4、在 Startup 类的 ConfigureServices 方法中将 ESClientProvider 类注册为单例

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddSingleton<IESClientProvider, ESClientProvider>();
    services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
    });
    services.AddControllers();
}
```

5、创建 Article 实体类

```csharp

[ElasticsearchType(IdProperty = "Id")]
public class Article
{
    [Keyword]
    public string Id { get; set; }

    [Keyword]
    public string Title { get; set; }

	  [Keyword]
	  public string Auther { get; set; }

    [Keyword]
    public string SubTitle { get; set; }
} 
```

6、创建 ESController，添加创建 index 方法

```csharp
[HttpGet]
[Route("CreateIndex")]
public bool CreateIndex(string indexName)
{
    var res = _client.Indices.Create(indexName, c => c.Map<Article>(h => h.AutoMap().Properties(ps => ps
    .Text(s => s
         .Name(n => n.Title)
         .Analyzer("ik_smart")
         .SearchAnalyzer("ik_smart")
         )
    .Text(s => s
         .Name(n => n.SubTitle)
         .Analyzer("ik_smart")
         .SearchAnalyzer("ik_smart")
         )
    )
    ));
    return res.IsValid;
}
```

- 对什么字段进行索引需要进行指定
- 字段的分词器和搜索关键字的分词器建议使用相同，否则可能搜索不到数据，例如上面代码中都指定为 ik_smart

7、添加 AddArticles 的方法

```csharp
[HttpPost]
[Route("AddArticles")]
public bool AddArticles()
{
    // 获取数据批量进行插入
    List<Article> listArticle = GetArticles();
   
    return _client.IndexMany(listArticle).IsValid;
}
```

8、添加高亮搜索的方法 SearchHighlight

```csharp
[HttpPost]
[Route("SearchHighlight")]
public List<Article> SearchHighlight(string key, int pageIndex = 0, int pageSize = 10)
{
    var searchAll = _client.Search<Article>(s => s
      .From(pageIndex)
      .Size(pageSize)
      .Query(q => q
            .QueryString(qs => qs
            .Query(key)
            .DefaultOperator(Operator.Or)))
      .Highlight(h => h
            .PreTags("<span class='color:red;'>")
            .PostTags("</span>")
            .Encoder(HighlighterEncoder.Html)
            .Fields(
                fs => fs.Field(p => p.Title),
                fs => fs .Field(p => p.SubTitle)
            )
        )
      );

    foreach (var hit in searchAll.Hits)
    {
        foreach (var highlightField in hit.Highlight)
        {
            if (highlightField.Key == "title")
            {
                foreach (var highlight in highlightField.Value)
                {
                    hit.Source.Title = highlight.ToString();
                }
            }
            else if (highlightField.Key == "subTitle")
            {
                foreach (var highlight in highlightField.Value)
                {
                    hit.Source.SubTitle = highlight.ToString();
                }
            }
        }
    }

    return searchAll.Documents.ToList();
}
```

## 在 Kibana 中查看数据

Kibana 容器运行起来后，可以通过端口 5601 进行访问，进行简单配置就可以查看数据了，具体步骤如下：

1、进入 Management→ Index Management ，如下图：

![](https://img.fwhyy.com/2022/202201300639769.webp)

在改功能中可以维护所有的 idnex ，也可以看看我们创建的 index 有没有在里面显示：

![](https://img.fwhyy.com/2022/202201300640024.webp)

2、在 Index Patterns 中进行 index pattern 的添加，名字可以进行模糊匹配

![](https://img.fwhyy.com/2022/202201300640279.webp)

3、在 Discover 菜单中进行数据查看，在这里可以选择之前创建的 index pattern 

![](https://img.fwhyy.com/2022/202201300640522.webp)

## 总结

本文只是很简单的一个示例带你入门，有了基本概念后，深入学习更多的高级用户就很容易了，文章中部分代码来自团队中的王同学，在此感谢！

希望本文对您有所帮助！