---
title: 在.NET中动态执行Nodejs代码的另一种方法
date: 2024-03-11T08:45:14+08:00
categories: [技术]
tags: [.NET,Nodejs]
---

在低代码平台中，通常有业务逻辑编排的能力，在业务逻辑编排中有很多不同类型的节点，例如：逻辑判断、接口调用、数据更新等，但为了方便开发人员使用，如果添加代码块的节点，将会极大增加开发效率。

<!--more-->

代码块节点可以使用 Node.js、Python 等解释型语言来处理逻辑，在《dotNet 5 中执行 Node.js》一文中，介绍了在 .NET 中通过 NodeServices 包来动态执行 Node.js 代码。但会有些局限。比如用户想要使用更多的 Node.js 包，就不太容易做到。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202403102016732.webp)

所以本文介绍另一种思路了，其实非常简单，主要分三步：

1、编写 Node.js 服务，执行 js 代码

2、编写 .NET API 接口，调用 Node.js 服务

3、使用 Docker 进行部署

## Node.js 服务

1、使用 Node.js 的 express 框架来实现一个 Node.js 服务，首先用 npm init 进行初始化一个项目，初始化后，会产生一个 package.json ，内容如下：

```json
{
  "name": "api-demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}
```

2、使用命令 `npm i express` 安装 express ，安装时可以会出现下面错误，这时可以切换不同的镜像源进行尝试：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202403102016213.webp)

使用下面命令可以切换镜像源：

```shell
npm config set registry https://npm.aliyun.com/
```

如果还是不成功，可以尝试几个不同的镜像源，我是换到中科大就迅速安装成功了：

```shell
腾讯:http://mirrors.cloud.tencent.com/npm/
华为：https://mirrors.huaweicloud.com/repository/npm/
中科大镜像:https://registry.npmjs.org/
淘宝镜像1：https://registry.npm.taobao.org
淘宝镜像2：https://registry.npmmirror.com
```

3、使用 VS Code 打开 package.json 所在目录，并且添加 api.js 文件，文件内容如下：

```js
const express = require('express');
const app = express();

app.use(express.json())

app.listen(3006, () => console.log('express 服务启动成功'));

app.post('/execute', (req, res) => {
    const data = req.body
    console.log(data)

    if(data && data.Code){
        var code=data.Code;
        try{
            var result=eval(code);
            res.json({result});
        }catch(e){
            res.json({error:e.message});
        }
    }else{
        res.json({error:'Invalid request body'});
    }
});
```

* 可以在命令行使用 `node api.js` 进行服务启动，启动后可以在浏览器用 3006 端口进行访问
* 上面代码中定义了一个路由为 execute 的 Post 接口
* 接口接受到需要执行的 js 代码，使用 eval 进行执行，然后返回结果

## .NET 调用

下面使用 .NET 8 的 Mini API ，创建一个接口来进行对 Node.js 服务的调用。

1、在 Rider 中创建一个 .NET 8 的 Web API 项目。

2、接口代码如下：

```c#
using System.Net.Http.Headers;
using Newtonsoft.Json;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddHttpClient();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();

app.MapPost("/run", async (IHttpClientFactory clientFactory,CodeBlockInfo codeBlockInfo) =>
{
    var client = clientFactory.CreateClient();
    string uri = "http://localhost:3006/execute";
    
    HttpContent context = new StringContent(JsonConvert.SerializeObject(codeBlockInfo));
    context.Headers.ContentType = new MediaTypeHeaderValue("application/json");

    var result = await client.PostAsync(uri,context);
    string resultContent = result.Content.ReadAsStringAsync().Result;
    return resultContent;
});

app.Run();

public class CodeBlockInfo
{
    public string Code { get; set; }
}

```

* 定义一个 CodeBlockInfo 实体用来传输需要执行的 js 代码
* 接口 run 中调用 Node.js 的服务，然后将执行的结果返回
* 关于使用 HttpClient 调用第三方接口，可以参考：https://learn.microsoft.com/zh-cn/dotnet/architecture/microservices/implement-resilient-applications/use-httpclientfactory-to-implement-resilient-http-requests

3、下面一段 js 代码是解析身份证号，从中提取出生日期和性别：

```js
var idcard = '420111202401011234';
var birthday = idcard.substr(6, 4) + '-' + idcard.substr(10, 2) + '-' + idcard.substr(12, 2);
var sex = '女';
if (idcard.substr(16, 1) % 2 == 1) { 
    sex = '男';
}; 
output={'生日':birthday,'性别':sex}
```

4、运行 .NET 程序，使用 Postman 进行测试，上面的代码就是入参：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202403102016851.webp)

## 部署

### Node.js

1、在目录中创建 Dockerfile 文件，内容如下：

```dockerfile
FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3006
CMD ["node", "api.js"]
```

2、执行下面命令进行镜像构建：

```shell
docker build -t node-execute-code-demo .
```

3、执行下面命令运行容器：

```shell
docker run -d -p 3106:3006 --name node-execute-code-demo --restart=always node-execute-code-demo
```

### .NET API

1、对 API 项目进行发布，发布后的内容在 `bin/Release/net8.0/publish/` 目录中。

2、在 publish 目录中添加 Dockerfile 文件，内容如下：

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
COPY . /app
WORKDIR /app
EXPOSE 5271/tcp
ENTRYPOINT ["dotnet", "Run-NodeJS-Demo.dll"]
```

3、执行下面命令进行镜像构建：

```
docker build -t net-run-nodejs-demo .
```

4、执行下面命令运行容器：

```
docker run -d -p 9090:8080 --name net-run-nodejs-demo --restart=always net-run-nodejs-demo
```

需要注意的是，上面的代码示例中将 Node.js 的访问地址写死在了接口方法中，并且使用的是 localhost，如果部署到容器中会导致不能正常访问，正式环境需要使用服务器的 IP，并使用配置的方式。

### 使用 Docker Compose

上面的两个步骤中已经创建了 Node.js 和 .NET API 的镜像，下面使用一个 Docker Compose 的方式来进行容器的管理。

1、创建一个 code-execute-demo 目录。

2、在目录中创建 docker-compose.yml 文件，文件内容如下：

```yaml
version: "3"

networks:
 fw_net:
  driver: bridge
  ipam:
   driver: default
   config:
    - subnet: 172.88.8.0/24

services:
 nodejs:
  restart: always
  image: node-execute-code-demo:latest
  ports:
    - "3106:3006"
  environment:
    - TZ=Asia/Shanghai
  networks:
   fw_net:
    ipv4_address: 172.88.8.2


 net-api:
  restart: always
  image: net-run-nodejs-demo
  ports:
    - "9090:8080"
  environment:
    - TZ=Asia/Shanghai
  networks:
   fw_net:
    ipv4_address: 172.88.8.3
```

3、命令执行 `docker-compose up -d` 进行容器的构建，构建完成可以使用 `docker-compose ps` 来查看容器是否正常：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202403102016692.webp)


