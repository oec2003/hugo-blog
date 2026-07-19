---
title: 从一个简单 API 的发布到组件化的架构思考
date: 2022-04-18T09:53:44+08:00
categories: [技术]
tags: [架构,API,华为云]
topic: arch
series_chapter: 第四章 架构实践
series_section: ""
series_order: 400
---

在 SaaS 版本的零代码平台中，高级用户希望能上传自己编写的 WebAPI ，来实现一些复杂场景下的业务。就需要添加可以通过上传程序包进行发布部署的功能。

<!--more-->

假设云服务器采用华为云，将一个自定义程序发布到华为云可以总结为三个步骤：

1、将自定义程序包构建成镜像推送到华为云的镜像仓库；

2、通过 API 的方式创建 Deploment （无状态负载）；

2、通过 API 的方式创建 Service ，并和 Deploment 关联；

下面看下简单实现这三个步骤需要怎么做。

在服务器上创建目录 pub ，目录中创建 Dockerfile 文件，内容如下：

```dockerfile
FROM swr.cn-north-4.myhuaweicloud.com/xxx/openjdk:latest
ENV PARAMS=""
ENV TZ=PRC
ADD auto-deploy-demo-0.0.1-SNAPSHOT.jar /auto-deploy-demo-0.0.1-SNAPSHOT.jar
ENTRYPOINT ["sh","-c","java -jar /auto-deploy-demo-0.0.1-SNAPSHOT.jar  $PARAMS"]
```

* From 后面的是在华为云上构建的基础 openjdk 镜像
* auto-deploy-demo-0.0.1-SNAPSHOT.jar 为上传的 jar 包名称

在 pub 目录中再创建一个 pub.sh 文件，用来构建镜像并将镜像推送到华为云镜像仓库，pub.sh 内容如下：

```shell
docker build -t deploy-test .

docker login -u cn-xxxxxx-4@QYL2XOIAQQLUNJQXU6C7 -p 6ba6cbe87d61045efc9505fcd463cfc1aeceb6 swr.cn-xxxxxx.myhuaweicloud.com

docker tag deploy-test:latest swr.cn-xxxxxx.myhuaweicloud.com/xxxxxx/deploy-test:v1.0

docker push swr.cn-xxxxxx.myhuaweicloud.com/xxxxxx/deploy-test:v1.0
```

* 首先构建本地镜像
* 登录华为云的镜像仓库
* 设置 tag 并推送镜像

上传 jar 包的代码这里就不放了，下面是连接服务器并执行 pub.sh  文件的代码：

```java
@GetMapping("/pushImage")
public String pushImage() throws IOException {
    SshClient sshClient = SshClientFactory.createSsh("root","xxxxxx","10.211.55.3",22);
    sshClient.exec("sh /root/pub/pub.sh", log -> {
    });

    return "ok";
}
```

可以看到，上面 jar 包的名称和镜像的名称都是写死的，真实场景中，会根据上传的包名和配置的镜像名来进行替换。

镜像有了，下一步就是创建 Deploment ，也就是华为云的无状态负载，使用接口的方式来进行创建。

调用华为云的接口，需要先获取 token ：

```java
private String getToken(){
    String url="https://iam.xxxxxx.myhuaweicloud.com/v3/auth/tokens";
    Map<String, String> headerMap = new HashMap<>(8);
    headerMap.put("Content-Type","application/json");
    String tokenBody="{\n" +
    "    \"auth\": {\n" +
    "        \"identity\": {\n" +
    "            \"methods\": [\n" +
    "                \"password\"\n" +
    "            ],\n" +
    "            \"password\": {\n" +
    "                \"user\": {\n" +
    "                    \"name\": \"tokenuser\",\n" +
    "                    \"password\": \"password\",\n" +
    "                    \"domain\": {\n" +
    "                        \"name\": \"domain\"\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "        },\n" +
    "        \"scope\": {\n" +
    "            \"project\": {\n" +
    "                \"name\": \"xxxxxx\"\n" +
    "            }\n" +
    "        }\n" +
    "    }\n" +
    "}";
    HttpResponse httpResponse= HttpUtil.doPost(url,tokenBody,headerMap);
    //String result = httpResponse.body();

    String token=httpResponse.header("X-Subject-Token");
    return token;
}
```

需要注意的是，获取 token 时入参中的用户名和密码，需要在「统一身份认证」模块中创建一个单独的用户。

创建的 Deploment 的代码如下：

```java
@GetMapping("/createDeploment")
public String createDeploment(){
    String token=getToken();
    String url="https://96284164-xxxx-11ec-a34d-0255ac1015f0.cce.cn-north-4.myhuaweicloud.com/apis/apps/v1/namespaces/default/deployments";
    Map<String, String> headerMap = new HashMap<>(8);
    headerMap.put("Content-Type","application/json");
    headerMap.put("X-Auth-Token",token);
    headerMap.put("X-Cluster-ID","96284164-xxxx-11ec-a34d-0255ac1015f0");
    String deploymentBody="{ \n" +
    "     \"apiVersion\": \"apps/v1\", \n" +
    "     \"kind\": \"Deployment\", \n" +
    "     \"metadata\": { \n" +
    "         \"labels\": { \n" +
    "             \"app\": \"deploy-test\" \n" +
    "         }, \n" +
    "         \"name\": \"deploy-test\" \n" +
    "     }, \n" +
    "     \"spec\": { \n" +
    "         \"replicas\": 1, \n" +
    "         \"selector\": { \n" +
    "             \"matchLabels\": { \n" +
    "                 \"app\": \"deploy-test\" \n" +
    "             } \n" +
    "         }, \n" +
    "         \"template\": { \n" +
    "             \"metadata\": { \n" +
    "                 \"labels\": { \n" +
    "                     \"app\": \"deploy-test\" \n" +
    "                 } \n" +
    "             }, \n" +
    "             \"spec\": { \n" +
    "                 \"containers\": [ \n" +
    "                     { \n" +
    "                         \"image\": \"swr.cn-xxxxxx.myhuaweicloud.com/xxxxxx/deploy-test:v1.0\", \n" +
    "                         \"imagePullPolicy\": \"IfNotPresent\", \n" +
    "                         \"name\": \"deploy-test\" \n" +
    "                     } \n" +
    "                 ], \n" +
    "                 \"imagePullSecrets\": [{ \n" +
    "                     \"name\": \"default-secret\" \n" +
    "                 }] \n" +
    "             } \n" +
    "         } \n" +
    "     } \n" +
    " }";

    HttpResponse httpResponse= HttpUtil.doPost(url,deploymentBody,headerMap);
    String result=httpResponse.body();

    return result;
}
```

* image：使用上面推送到华为云镜像仓库中的镜像名称
* 接口的入参是 json 格式，json 中的内容，可以参考已创建的无状态负载中 Yaml 配置的内容，当然建议还是深入学习 k8s 的知识，这些参数什么意思自然就清楚了

创建完 Deploment 后，还需要创建 Service 才能进行访问，下面是创建 Service 的代码：

```
@GetMapping("/createService")
public String createService() {
    String token=getToken();
    String url="https://96284164-xxxx-11ec-a34d-0255ac1015f0.cce.xxxxxx-4.myhuaweicloud.com/api/v1/namespaces/default/services";
    Map<String, String> headerMap = new HashMap<>(8);
    headerMap.put("Content-Type","application/json");
    headerMap.put("X-Auth-Token",token);
    headerMap.put("X-Cluster-ID","96284164-xxxx-11ec-a34d-0255ac1015f0");

    String serviceBody="{ \n" +
    "     \"kind\":\"Service\", \n" +
    "     \"apiVersion\":\"v1\", \n" +
    "     \"metadata\":{ \n" +
    "        \"name\":\"service-deploy-test\", \n" +
    "        \"creationTimestamp\":null, \n" +
    "        \"labels\":{ \n" +
    "           \"app\":\"deploy-test\" \n" +
    "        } \n" +
    "     }, \n" +
    "     \"spec\":{ \n" +
    "        \"ports\":[{ \n" +
    "           \"name\":\"http\", \n" +
    "           \"port\":8082,\n" +
    "         \"protocol\":\"TCP\",  \n" +
    "           \"targetPort\":8080 \n" +
    "        }], \n" +
    "        \"selector\":{ \n" +
    "        \"app\":\"deploy-test\" \n" +
    "        }, \n" +
    "               \"type\":\"ClusterIP\"\n" +
    "    }\n" +
    " }";

    HttpResponse httpResponse= HttpUtil.doPost(url,serviceBody,headerMap);
    String result=httpResponse.body();

    return result;
}
```

* name：service-deploy-test ，服务的名称，名称可以在界面中输入指定，最终会拼成访问的地址；
* app：设置为 deploy-test ，这个名称和 Deploment 的名称要对应上，否则就挂接不上
* type：设置为 ClusterIP ，表示集群内访问，集群内的容器之间可以访问，如果想要外网访问，需要设置为 NodePort ，如果使用了华为云的网关服务，则需要设置为 DNAT 
* port：8082 是访问时的端口
* targetPort：8080 是 jar 包程序中监听的端口

依次进行镜像构建、创建 Deploment 和 Service 后，在华为云的 cce 无状态负载中就可以看到 deploy-test 了：

![image-20220417080731704](https://img.fwhyy.com/2022/202205190755029.webp)

查看详情的访问方式：

![image-20220417080943533](https://img.fwhyy.com/2022/202205190755012.webp)

到这，依次调用三个接口就能进行自定义 API 到华为云 cce 的部署。

上面的三个步骤是一个简单的发布部署的过程，场景很单一，仅仅是将一个 WebAPI 发布到华为云、形式也很简单，只是写了几个简单的接口，那么在发布部署这个大的场景下，还会有下面一些情况：

* 部署环境可能是阿里云，也可能是自己的服务器
* 部署的程序可能是 WebAPI，也可能是后台服务程序
* 如果用户想要自己输入访问的端口，还需要进行端口的检查
* 在团队内部也有很多的部署的需求存在

通过上面的场景，可以将三个简单接口的发布流程演进为一个发布部署平台，架构图如下：

![image-20220417103759820](https://img.fwhyy.com/2022/202204172341843.webp)

1、将上面发布华为云 cce 的核心功能抽象到发布平台中；

2、发布平台和发布的使用方进行解耦，通过消息队列进行连接，因为使用方可能不止一个地方，比如有 SaaS 平台和内部的运维平台；

3、在发布平台中提供服务器管理、执行组件管理、检查组件管理、部署管理等；

* 服务器管理：管理服务器的连接，给执行组件使用
* 执行组件管理：前面提到的构建镜像、创建 Deploment 、创建 Service 可以封装成不同的执行组件
* 检查组件管理：对执行组件中的一些步骤进行检查，比如端口的重复校验
* 部署管理：一个部署中可以包含多个步骤，每个步骤中包含执行组件和检查组件

这样当有更多的场景需要满足的时候，只需要提供更多的执行组件就可以，执行组件可以在部署管理中进行任意的组合，这也满足了开放封闭原则。

更进一步，可以对执行组件和检查组件抽象出一套标准的规范和接口，只要按照要求就能编写出符合自己业务的执行组件，并对接到发布平台中，这样就更灵活了。如果在企业内部使用，不光是发布平台的开发人员来进行执行组件的编写，业务方的程序员也能根据规范编写自己的执行组件。

殊途同归，想要软件能满足变化、足够灵活，趋势就是组件化。在零代码平台中，这种思想也无处不在，表单是有各种不同的组件（文本框、数字框等）构成的、页面也是由各种组件（列表、图表等）构成的、业务规则也是有各种组件（分支控制、循环控制、赋值等）构成的、流程也是由各种组件（审批、消息等）构成的，一切皆组件。

周六在微信视频号看崔健的演唱会，中间和窦文涛的访谈环节中，老崔说：“现在都讲极少主义，但我认为极多也是很重要的，是必须经历的过程，有了这种阅历才能极少”，我觉得很有道理。

零代码产品中就是将复杂的、极多的东西放在了背后，让用户能够真正去感受那个极少，我们的目标就是要让产品既简单又强大。
