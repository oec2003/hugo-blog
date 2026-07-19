---
title: 华为云服务器部署初探
date: 2022-01-10T08:05:00+08:00
categories: [技术]
tags: [华为云,部署,运维]
---

最近玩了下华为云，遇到了一些坑，做下记录。

华为云有很多的服务，文中会涉及到：

- CCE
- ECS
- 弹性公网IP
- DevCloud

<!--more-->

## 创建自己的镜像

因为购买的服务器为鲲鹏服务器，而开源镜像中心的镜像都是 x86 的，所以直接通过镜像中心的镜像进行安装是无法正常运行的。有两种方式可以解决：

1、编辑 YAML 文件，将镜像修改为支持 arm 的镜像，比如：arm64v8/nginx ；

2、创建自己的镜像，然后推送到镜像仓库中。

第一种方式测试过，但没有成功。制作自己的镜像的步骤如下：

1、ssh 进入到 ECS 服务器；

2、执行下面命令进行操作：

```
docker pull arm64v8/nginx
## 登陆镜像仓库
docker login -u cn-north-4@89VUVGA2PF5XSHSM6YB4 -p 40d6f47154ef844717e9acc4cc3240e2dfeb900b149058e60a3f6fa598fb1 swr.cn-north-5.myhuaweicloud.com
docker tag arm64v8/nginx swr.cn-north-5.myhuaweicloud.com/xxx/s2-nginx:latest
docker push swr.cn-north-5.myhuaweicloud.com/xxx/s2-nginx:latest
```

推送成功后，在我的镜像中可以看到自制的镜像，如下图：

![iShot2022-02-04 17.24.47](https://img.fwhyy.com/2022/202202041725569.webp)

有了自己的镜像后，在 CCE 中创建无状态工作负载时，就能在我的镜像中进行选择了。

![iShot2022-02-04 17.26.08](https://img.fwhyy.com/2022/202202041726959.webp)

## 配置文件

运行前端 vue 的程序，需要 nginx 配置文件、运行 Redis ，需要 Redis 配置文件、运行 API 程序，可能也会有自定义的配置文件，这些配置文件需要进行外挂，方便修改。下面以 Redis 的配置文件为例。

在配置中心中创建 redis.conf 的配置项：

![iShot2022-02-04 17.27.30](https://img.fwhyy.com/2022/202202041727549.webp)

创建无状态工作负载，镜像选择 s2-redis ，在数据存储配置中，选择本地存储：

![iShot2022-02-04 17.27.58](https://img.fwhyy.com/2022/202202041728304.webp)

- 存储类型选择配置项，在下面的配置型可以选择在配置中心添加的配置项；
- 挂载路径设置为 /etc/redis

在启动命令中配置相关命令可以让 redis 以配置文件启动，如果需要设置密码，可以在参数中进行添加，如下：

![iShot2022-02-04 17.28.51](https://img.fwhyy.com/2022/202202041729464.webp)

## DevCloud 中的流水线

DevCloud 是一个开发平台，包含了代码托管、项目任务管理、构建、部署等。下面以一个 vue 的示例来介绍怎样从代码提交到部署到 CCE 中。

1、创建一个空白的 vue 项目 vue-demo ，并上传到 DevCloud 中；

2、项目的根目录中添加 Dockerfile 文件，内容如下：

```
FROM swr.cn-north-4.myhuaweicloud.com/xxx/s2-nginx:latest
COPY . /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

3、在编译构建中添加一个任务，任务中添加两个构建步骤，如下图：

![iShot2022-02-04 17.29.25](https://img.fwhyy.com/2022/202202041729206.webp)

在命令的最下面添加 `cp Dockerfile ./dist`

4、配置“制作镜像并推送到 SWR 仓库”：

![iShot2022-02-04 17.30.08](https://img.fwhyy.com/2022/202202041730307.webp)

工作目录：设置为 ./dist ,此目录是执行 docker build 的目录，所以上面的命令中需要将 Dockerfile 复制到 dist 目录中；

5、手动执行配置好的任务，顺利的话会在我的镜像中可以看到名为 vue-demo 的镜像；

6、在无工作负载中创建一个工作负载 nginx-test ，镜像选择 vue-demo ；

7、在部署中创建一个任务，添加一个部署步骤：Kubernates 部署，如下：

![iShot2022-02-04 17.31.07](https://img.fwhyy.com/2022/202202041731302.webp)

8、在流水线中两个步骤构建和部署，分别选择上面创建的构建任务和部署任务：

![iShot2022-02-04 17.32.22](https://img.fwhyy.com/2022/202202041732418.webp)

9、设置流水线中的执行计划：

![iShot2022-02-04 17.32.45](https://img.fwhyy.com/2022/202202041732279.webp)

代码提交时触发，并且设置为包含 master ，当有代码推送到 master 分支时就会触发流水线，进行构建和部署。

## 流水线参数

每次推送代码进行构建，然后制作镜像并推送到 SWR 仓库，镜像的版本期望能加 1 ，而且部署时使用最新的版本进行部署，这就需要使用流水线的参数了：

1、在流水线参数设置中进行参数的添加

![iShot2022-02-04 17.33.08](https://img.fwhyy.com/2022/202202041733277.webp)

- 参数名：tag
- 类型：自增长
- 默认值：随便定义，这里为 1.0.0
- 运行时设置：设置为开启

2、在构建任务的参数设置中添加参数

![iShot2022-02-04 17.34.16](https://img.fwhyy.com/2022/202202041734272.webp)

- 参数名：tag
- 类型：字符串
- 运行时设置：设置为开启

3、在部署任务的参数设置中添加参数

![iShot2022-02-04 17.35.03](https://img.fwhyy.com/2022/202202041735360.webp)

- 参数名：tag
- 类型：字符串
- 运行时设置：设置为开启

4、构建任务的”制作镜像并推送到 SWR 仓库“ 步骤中的镜像标签设置修改为 ${tag}

![iShot2022-02-04 17.35.37](https://img.fwhyy.com/2022/202202041735577.webp)

5、部署任务的 ”Kubernetes 部署“ 中的镜像版本也修改为 ${tag} ;

6、修改流水线的构建任务，tag 修改为 ${tag} ，如下图：

![iShot2022-02-04 17.36.17](https://img.fwhyy.com/2022/202202041736479.webp)

流水线的 tag 设置完后，当再进行代码推送就会自动构建并生成新的镜像版本，并部署到 CCE 的集群中。
