---
title: 能更好集成容器的反向代理Traefik简单使用
date: 2024-03-29T08:13:56+08:00
categories: [技术]
tags: [Traefik, Docker, Kubernetes]
---

traefik 与 nginx  一样，也是一款优秀的反向代理工具，使用 go 语言开发，本文将介绍怎样用 traefik 来实现我的需求。

<!--more-->

## 需求

1、WebAPI 接口中有两大类业务，当然根据具体情况可以是若干类。例如：workflow 和 interface，分别代表流程平台和接口平台。

2、在集群部署模式下，可以根据不同的路由分配到不同的节点。例如：一共部署了 10 个节点，workflow 分布式到其中的 3 个节点，interface 分布式到其余的 7 个节点。

这种方式的好处就是对于只有单一技术栈的团队，在物理上可以将代码组织在一起，方便维护，但在逻辑上可以将不同的业务分开，实现动态扩展和弹性。

当然上面的需求使用 nginx 也可以很容易做到，但本文采用的是 Træfɪk ，先来看看 Træfɪk 和 nginx 的区别。

## Traefik 和 Nginx 的区别

Traefik 和 Nginx 都是反向代理工具，但它们在设计和使用场景上存在一些区别。下面简要比较一下这两者：

- Traefik 可以无须重启即可更新配置，Nginx 据说能做到（没有验证过）
- Traefik 可以自动的服务发现与负载均衡，Nginx 需要借助一些第三方工具
- Traefik 对  Docker、Kubernetes、Swarm 的支持更好
- Traefik 有漂亮的 dashboard 界面
- Traefik 在功能上没有 Nginx 丰富，网上资料、案例也比 Nginx 少
- Traefik 性能比 Nginx 要差，但具体差别多大，还未验证

## 环境

* Traefik：v3.0.0-rc2
* 操作系统：macOS13.0
* Docker：20.10.13

## Traefik 简单示例

1、Traefik 使用 docker-compose 进行部署，部署前先创建一个 docker 网络：

```shell
docker network create traefik-net
```

2、创建一个 traefik-demo 的目录，目录中创建 docker-compose.yml 文件，用来构建一个 Traefik 容器。

```yaml
version: "3"

services:
  traefik:
    image: traefik:v3.0.0-rc2
    restart: always
    ports:
      - 80:80
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: 
      - "--api=true"
      - "--api.dashboard=true"
      - "--api.insecure=true"
      - "--entrypoints.http.address=:80"
      - "--providers.docker=true"
    labels:
      - "traefik.http.routers.traefik-dashboard.entrypoints=http"
      - "traefik.http.routers.traefik-dashboard.rule=Host(`traefik.fw.com`)"
      - "traefik.http.routers.traefik-dashboard.service=dashboard@internal"
      - "traefik.http.routers.traefik-dashboard-api.entrypoints=http"
      - "traefik.http.routers.traefik-dashboard-api.rule=Host(`traefik.fw.com`) && PathPrefix(`/api`)"
      - "traefik.http.routers.traefik-dashboard-api.service=api@internal"
    networks:
      - traefik-net
      
networks:
  traefik-net:
    external: true
    name: traefik-net 
```

* /var/run/docker.sock:/var/run/docker.sock：允许 Traefik 访问 Docker 守护进程，用于自动发现 Docker 服务，允许 Traefik 订阅 Docker 服务事件，来动态的添加或删除要对用户暴露的网络服务

* --api=true：启用 Traefik API

* --api.dashboard=true：启用 Traefik 的 Web UI

* --api.insecure=true：允许不安全的 API 和 Web UI 访问

* --entrypoints.http.address=:80：设置 HTTP 入口点在容器的 80 端口

* --providers.docker=true：启用 Docker 作为服务提供者

通过在 Docker Labels 中添加了声明式的路由，分别将 Dashboard 的网页（路由名称  traefik-dashboard ）和 API （路由名称 traefik-dashboard-api ）注册在了我们创建的 http 网络入口上，用户就可以通过我们设置的域名来访问服务了。

* traefik.http.routers.traefik-dashboard.entrypoints=http: 为 Traefik dashboard 设置入口点

* traefik.http.routers.traefik-dashboard.rule=Host(traefik.fw.com)：设置访问 Traefik dashboard 的主机规则

* traefik.http.routers.traefik-dashboard.service=dashboard@internal：指定 Traefik dashboard 使用内部服务

* traefik.http.routers.traefik-dashboard-api.entrypoints=http：为 Traefik API 设置入口点

* traefik.http.routers.traefik-dashboard-api.rule=Host(traefik.fw.com) && PathPrefix(/api)：设置访问 Traefik API 的主机和路径前缀规则。

* traefik.http.routers.traefik-dashboard-api.service=api@internal：指定 Traefik API 使用内部服务。

3、上面的配置中有一个域名：traefik.fw.com ，这是我本地测试使用的域名，正式环境替换为真实域名即可。本地测试可以通过修改 hosts 文件的方式：

```shell
cd /etc/
sudo chmod 777 hosts
vi hosts
```

添加：

```
127.0.0.1 traefik.fw.com
```

4、在 traefik-demo 目中中执行 docker-compose up -d traefik 来构建 Traefik 服务，执行成功后，在浏览器中访问：traefik.fw.com ，可以看到如下界面：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202403281711102.webp)

可以看到 Services 有 10 个，其中包含了我本机上部署的其他的 docker 容器。

5、使用官方的测试容器来进行测试，修改 docker-compose.yml 文件，在下面添加如下内容：

```yaml
  whoami:
    image: containous/whoami    
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whoami.rule=Host(`whoami.fw.com`)"
      - "traefik.http.services.whoami.loadbalancer.server.port=80"
    networks:
      - traefik-net
```

6、执行 docker-compose up -d whoami 进行构建，构建成功后，命令行执行：curl -H Host:whoami.fw.com http://127.0.0.1

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202403281711020.webp)

7、现在使用命令：docker-compose up -d --scale whoami=2 对 whoami 服务进行扩容，创建成功后，再使用：curl -H Host:whoami.fw.com http://127.0.0.1 进行测试，会发现已经在两个容器间进行负载了：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202403281711861.webp)

## 使用 WebAPI 示例进行验证

1、使用 C# 编写 WebAPI 接口，创建两个 Controller 模拟两个不同的业务，InterfaceCenterController 和 WorkflowController ，代码如下：

```c#
    [ApiController]
    [Route("[controller]")]
    public class WorkflowController : ControllerBase
    {
        [HttpGet()]
        public string Test()
        {
            string ip = Request.HttpContext.Connection.LocalIpAddress.MapToIPv4().ToString() + ":" +
                         Request.HttpContext.Connection.LocalPort.ToString();

            return $"workflow server,{ip}";
        }
    }
    
    [ApiController]
    [Route("[controller]")]
    public class InterfaceCenterController : ControllerBase
    {
        [HttpGet()]
        public string Test()
        { 
            string ip = Request.HttpContext.Connection.LocalIpAddress.MapToIPv4().ToString() + ":" +
                      Request.HttpContext.Connection.LocalPort.ToString();
            return $"interfaceCenter server,{ip}";
        }
    }
```

2、代码写好后，进行发布，在发布目录中创建 Dockerfile 文件，内容如下：

```dockerfile
FROM mcr.microsoft.com/dotnet/core/aspnet:3.1
COPY . /app
WORKDIR /app
EXPOSE 80/tcp

ENTRYPOINT ["dotnet", "ApiDemo.dll"]
```

3、执行下面命令进行镜像构建：

```
docker build -t apidemo .
```

4、修改 traefik-demo 目录中的 docker-compose.yml 文件，在下面添加如下内容：

```yaml
  apidemo:
    image: apidemo 
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.apidemo.entrypoints=http"
      - "traefik.http.routers.apidemo.rule=Host(`apidemo.fw.com`)  && PathPrefix(`/workflow`)"
      - "traefik.http.services.apidemo.loadbalancer.server.port=80"
    networks:
      - traefik-net

  apidemo-1:
    image: apidemo 
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.apidemo-1.entrypoints=http"
      - "traefik.http.routers.apidemo-1.rule=Host(`apidemo.fw.com`) && PathPrefix(`/interfacecenter`)"
      - "traefik.http.services.apidemo-1.loadbalancer.server.port=80"
    networks:
      - traefik-net
```

* 在 apidemo 中配置了路由 PathPrefix(`/workflow`) 表示只接受工作流平台的业务
* 在 apidemo-1 中配置了路由 PathPrefix(`/interfacecenter`) 表示只接受接口平台的业务

5、在上面 labels 的路由配置中使用了 apidemo.fw.com 的域名，同样，这个域名也需要配置到 hosts 文件中：

```
127.0.0.1 traefik.fw.com apidemo.fw.com
```

6、执行下面的命令进行容器的构建：

```
docker-compose up -d apidemo
docker-compose up -d apidemo-1
```

7、使用 Postman 进行测试：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202403281711073.webp)
![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202403281710943.webp)

* 当访问 workflow 路由时，返回的容器 IP 一直都是 172.18.0.2
* 当访问 interfacecenter 路由时，返回的容器 IP 一直都是 172.18.0.4