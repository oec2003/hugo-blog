---
title: 华为云鲲鹏服务器部署Java踩坑记
date: 2022-01-20T08:05:00+08:00
categories: [技术]
tags: [华为云,部署,运维]
---

之前跟华为云的技术人员沟通，他们说在鲲鹏服务器上构建部署对微软的 dotNET 支持不是很好，建议使用 Java ，我们程序现在是混合模式 dotNET 和 Java 都有。让我没想到的是 dotNET 的构建部署很顺利，反倒是 Java 的部署遇到了些问题。

<!--more-->

现象是 CCE 中的工作负载提示异常，应用不能正常访问，查看了容器日志，如下图：

![iShot2022-02-04 18.08.34](https://img.fwhyy.com/2022/202202041809012.webp)

最终查出的原因是基础镜像使用错误，因之前跟华为技术人员沟通得知鲲鹏服务器只支持 openjdk ，并且鲲鹏服务器是 arm 芯片，所以就找到了 arm64v8/openjdk 的基础镜像， arm64v8 下只有一个 openjdk 的镜像，这个镜像中的 Java version 是 17 ，我们使用的 Java 的版本是 8 ，就导致了不兼容。

正确在华为云鲲鹏服务器构建一个 Java 的 Spring Boot 项目的步骤如下：

1、构建一个基础镜像推送到华为云的私有镜像仓库，ssh 进入任意一台 ECS 服务器，执行下面命令：

```
docker pull adoptopenjdk/openjdk8
## 登录镜像仓库
docker login -u cn-north-4@89VUVGA2PF5XSHSM6YB4 -p 40d6f47154ef844717e9acc4cc3240e2dfeb900b149058e60a3f6fa598fb1 swr.cn-north-5.myhuaweicloud.com
docker tag adoptopenjdk/openjdk8  swr.cn-north-5.myhuaweicloud.com/xxx/openjdk:latest
docker push swr.cn-north-5.myhuaweicloud.com/xxx/openjdk:latest
```

注意：docker pull 的镜像为 adoptopenjdk/openjdk8 ，这是 Java 8 的 openjdk 版本。值得一提的是这个镜像并非是 arm 的镜像，但依然可以用，只需要在创建构建任务的时候，指定是鲲鹏服务器就可以。

![iShot2022-02-04 18.11.56](https://img.fwhyy.com/2022/202202041814320.webp)

2、创建一个 Spring Boot 项目，根目录下创建 Dcokerfile 文件，内容如下：

```
FROM swr.cn-north-5.myhuaweicloud.com/xxx/openjdk:latest

ENV PARAMS=""

ENV TZ=PRC

ADD Java-Test-SNAPSHOT.jar /Java-Test-SNAPSHOT.jar

ENTRYPOINT ["sh","-c","java -jar /Java-Test-SNAPSHOT.jar  $PARAMS"]
```

3、创建构建任务，这一步骤可以参考《[华为云服务器初探二（完结）](http://mp.weixin.qq.com/s?__biz=MzU0NjgzNzQyMw==&mid=2247484844&idx=1&sn=595e9b8ac93b25ed0f116dd84a33cee2&chksm=fb56c36ccc214a7a979b256576ac56f0e9a5ca41627b9db2d0e4d28dc4596b266b985bcee41c&scene=21#wechat_redirect)》中的描述；

4、在 CCE 中创建无状态负载，需要手动添加环境变量 PARAMS ，如下图：

![iShot2022-02-04 18.14.20](https://img.fwhyy.com/2022/202202041814591.webp)

如果直接使用 docker run 命令创建容器，命令如下：

```
docker run -d -p 9214:9214 -e PARAMS='--spring.profiles.active=dev -server.port=9214' --name java-test  swr.cn-north-5.myhuaweicloud.com/xxx/openjdk:latest
```

可以看到上面 PARAMS 后面的值是加了单引号的，这个参数值在 CCE 的环境变量设置的时候需要去掉单引号，否则容器也不能正常启动。

5、工作负载搞定，剩下的构建、部署、流水线和前面文章中的类似。

最后的一点思考：

像我遇到的这种问题，为什么在官网文档中没有提及呢？我觉得一个重要的原因是，写文档的人存在知识的诅咒，会认为很多基础知识大家应该都会。出发点是自己的角度，而不是从用户的角度。

我这篇文档也是一样，因为是踩坑记录，所以已经假设你在使用华为云鲲鹏服务器，并且能较熟练操作，否则可能也是一头雾水。

但如果是写一些基础文档或教程，还是要站在读者（用户）的角度去想，把他们当成是小白，写出的东西用处会更大。

相关阅读：

[华为云服务器部署初探二（完结）](http://mp.weixin.qq.com/s?__biz=MzU0NjgzNzQyMw==&mid=2247484844&idx=1&sn=595e9b8ac93b25ed0f116dd84a33cee2&chksm=fb56c36ccc214a7a979b256576ac56f0e9a5ca41627b9db2d0e4d28dc4596b266b985bcee41c&scene=21#wechat_redirect)

[华为云服务器部署初探](http://mp.weixin.qq.com/s?__biz=MzU0NjgzNzQyMw==&mid=2247484822&idx=1&sn=9712c1cc0a7efa7e5938021c7c088c6a&chksm=fb56c356cc214a406ee70fa7ae6908822871892855c1602db1ccc2cd8119f54f7f5dc30acb17&scene=21#wechat_redirect)
