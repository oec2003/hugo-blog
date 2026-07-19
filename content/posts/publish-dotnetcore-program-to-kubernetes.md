---
title: 发布dotNetCore程序到Kubernetes
date: 2019-05-12T11:02:54+08:00
categories: [技术]
tags: [Kubernetes, Docker, dotNetCore]
---

上一篇《[Mac中搭建Kubernetes](http://fwhyy.com/2019/05/building-kubernetes-in-mac/)》介绍了怎样在Mac中搭建单节点的`Kubernetes`，本文将编写一个`dotNetCore`的示例程序，并发布到`Kubernetes`中。

<!--more-->

## 环境
* Mac：10.13.6
* Docker：2.0.0.3 (31259)
* Kubernetes：1.10.11
* netCore：2.1

## 基本步骤

1. 创建`dotnetCore`示例项目；
2. 本地搭建私有`registry`，或者使用`DockerHub`，本文采用搭建私有仓库的方式；
3. 将`dotnetCore`示例项目发布到私有仓库中；
4. 发布私有仓库镜像到`Kubernetes`

## 创建示例项目

1、在命令行执行命令创建一个名为`k8s-netcore-demo`的项目

```
dotnet new webApp -o k8s-netcore-demo --no-https
```

* webApp:创建一个webApp类型的项目
* -o:创建项目到指定目录
* --no-https:不启用https

2、将示例程序运行起来

```
cd k8s-netcore-demo
dotnet run
```

运行正常的话，访问`http://localhost:5000`会出现下图界面

![](https://img.fwhyy.com/2022/202201301608586.webp)

## 搭建私有仓库

```
docker pull registry
docker run -d -p 8888:5000 --restart=always registry
```

## 发布netcore程序到私有仓库

1、发布`netcore`程序

```
dotnet publish
```
![](https://img.fwhyy.com/2022/202201301608232.webp)

2、在`publish`目录中创建`Dockfile`文件，文件内容如下：

```
FROM microsoft/dotnet:2.1-aspnetcore-runtime
COPY . /app
WORKDIR /app
EXPOSE 80/tcp
ENTRYPOINT ["dotnet", "k8s-netcore-demo.dll"]
```

3、将netcore程序编译成Docker镜像

```
docker build -t k8s-netcore-demo .
```

4、将镜像发布到私有仓库

```
docker tag k8s-netcore-demo localhost:8888/k8s-netcore-demo
docker push localhost:8888/k8s-netcore-demo
```

默认情况下，你执行`docker push`时会出现下面错误
![](https://img.fwhyy.com/2022/202201301609307.webp)

在`Mac`中的`Docker`中做如下设置即可解决



设置好重启`Docker`之后，再次执行`docker push`，可以正常将镜像推送到私有仓库中。

![](https://img.fwhyy.com/2022/202201301610179.webp)

推送完成后，浏览器中访问`http://localhost:8888/v2/_catalog`，如果如下图所示，说明推送成功了。

![](https://img.fwhyy.com/2022/202201301610522.webp)

## 发布镜像到Kubernetes

1、创建`Kubernetes`的部署文件`deploy.yaml`，部署文件为`yaml`文件格式。文件内容如下：

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: k8s-netcore-demo
  namespace: k8s-netcore
  labels:
    k8s-app: k8s-netcore-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      k8s-app: k8s-netcore-demo
  template:
    metadata:
      labels:
        k8s-app: k8s-netcore-demo
    spec:
      containers:
      - name: k8s-netcore-demo
        image: localhost:8888/k8s-netcore-demo
        ports:
        - containerPort: 80  
---
# ------------------- Service ------------------- #
kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: k8s-netcore-demo
  name: k8s-netcore-demo
  namespace: k8s-netcore
spec:
  type: NodePort
  ports:
    - port: 80
      targetPort: 80
  selector:
    k8s-app: k8s-netcore-demo
```

上面配置文件中属性的含义不用先去弄清楚，保证程序能够正常跑起来是关键。

* 所有配置为k8s-netcore-demo的地方是构建的镜像的名称
* image的值为localhost:8888/k8s-netcore-demo，这个是镜像发布到本地仓库中的地址；
* namespace的值配置为创建的namespace的名称。

2、因为在`deploy.yaml`文件中指定了`namespace`，所以先创建一个名为`k8s-netcore的namespace`

```
kubectl create namespace k8s-netcore
```

3、执行`deploy.yaml`文件

```
kubectl create -f deploy.yaml --validate
#加上 --validate 参数，当yaml文件有错误时，会给出提示
```

4、使用`kubectl get`命令查看创建情况

```
kubectl get deploy -n k8s-netcore
```
![](https://img.fwhyy.com/2022/202201301610056.webp)

5、查看资源情况

```
kubectl get svc -n k8s-netcore
```
![](https://img.fwhyy.com/2022/202201301611237.webp)

上图中可以看出，暴露出来的端口为`32527`，浏览器中访问`http://localhost:32527`，如下图

![](https://img.fwhyy.com/2022/202201301611820.webp)

6、启动代理，在`Dashboard`中查看运行情况

```
kubectl proxy
```
怎样访问`Dashboard`，可以查看《[Mac中搭建Kubernetes](http://fwhyy.com/2019/05/building-kubernetes-in-mac/)》中相关介绍。
![](https://img.fwhyy.com/2022/202201301612649.webp)


## 本文中用到的命令

```
#创建dotNetCore项目
dotnet new webApp -o k8s-netcore-demo --no-https
#将dotNetCore程序构建为镜像
docker build -t k8s-netcore-demo .
#创建namespace
kubectl create namespace k8s-netcore
#部署Kubernetes
kubectl create -f deploy.yaml --validate
#查看指定命名空间的部署情况
kubectl get deploy -n k8s-netcore
#查看指定命名空间的资源情况
kubectl get svc -n k8s-netcore
```

## 总结

1. 命令不用刻意去记，练习多了自然就记住了；
2. 部署程序`Kubernetes`中，先需要将镜像发布到仓库中，自己部署到私有仓库和公有云仓库都可以；
3. 通过本文的操作步骤，可以将程序发布到`Kubernetes`中运行起来，这样可以对`Kubernetes`有一个主观的认识，接下来就可以循序渐进的对`Kubernetes`进行深入的学习。

