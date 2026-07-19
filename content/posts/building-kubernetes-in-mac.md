---
title: Mac中搭建Kubernetes
date: 2019-05-03T22:33:22+08:00
categories: [技术]
tags: [Kubernetes, Docker]
---

`Kubernetes`是`Google`和`RadHat`公司共同主导的开源容器编排项目，功能非常强大，也非常的火热和流行，但同时里面也有很多的概念和名词需要我们去学习和理解。学习任何一个技术先需要把基础环境搭建起来，本篇就介绍怎样在`Mac`中启动单节点的`Kubernetes`。

<!--more-->

## 环境

* Mac：10.13.6
* Docker：2.0.0.3 (31259)
* Kubernetes：1.10.11

## 启用Kubernetes

在`Mac`中安装了`Docker`之后，会自动安装了`Kubernetes`，正常情况下，我们只需要在`Docker`的`Preferrences->Kubernetes`中勾选`Enable Kubernetes`，然后点击`Apply`按钮即可。但由于伟大的墙的存在，这么一个简单的启动也会变得一波三折。

如果您是直接在`Docker`中启用`Kubernetes`，`Kubernetes`的状态会一直都是`kubernetes is starting...`，原因是有一些`Kubernetes`依赖的镜像不能正常的下载。

`Github`上有个开源项目可以帮我们手动拉取镜像，执行下面命令拉去改项目代码到本地

```
git clone https://github.com/maguowei/k8s-docker-for-mac
```

在`Docker`中修改镜像地址为国内，如下图：
![](https://img.fwhyy.com/2022/202201280603450.webp)

在命令行进入到`k8s-docker-for-mac`目录，执行`sh load_images.sh`就可以拉去镜像了。

且慢，如果您直接执行了上面拉取镜像的命令，还是不能正常启用`Kubernetes`，因为有些镜像的版本没对应上。修改`k8s-docker-for-mac`目录中的`images`文件，将所有的`v1.13.0`修改为`v1.10.11`，因为我本机的`Kubernetes`版本为`1.10.11`。

修改完保存后，再执行`sh load_images.sh`拉去镜像即可。

镜像拉取完成后，勾选`Enable Kubernetes`，点击`Apply`按钮，等待几分钟，出现下图的状态表示启用成功。

![](https://img.fwhyy.com/2022/202201280604592.webp)

## 运行dashboard

`Kubernetes dashboard`是一个`Web`界面的管理工具，如果您习惯使用命令行可以可以忽略。执行下面命令：

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v1.10.1/src/deploy/recommended/kubernetes-dashboard.yaml

kubectl proxy #默认情况下代理的是8001端口，如果要指定端口用下面命令
kubectl proxy --port=8080
```

执行上面命令后，会监听本机的`8001`的端口，这时访问[http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/#!/login](http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/#!/login)，可以进入登录界面，如下图：

![](https://img.fwhyy.com/2022/202201280604959.webp)

我们采用令牌的方式进行登录，首先创建管理员角色，新建一个名为`k8s-admin.yaml`的文件，内容如下：

```
apiVersion: v1
kind: ServiceAccount
metadata:
  name: dashboard-admin
  namespace: kube-system
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  name: dashboard-admin
subjects:
  - kind: ServiceAccount
    name: dashboard-admin
    namespace: kube-system
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io
```

在命令行中进入到`k8s-admin.yaml`文件所在目录，执行下面命令添加管理员角色

```
kubectl create -f k8s-admin.yaml
```

获取管理员角色的`secret`名称

```
kubectl get secret -n kube-system
```

![](https://img.fwhyy.com/2022/202201280604367.webp)

获取`token`值

```
kubectl describe secret dashboard-admin-token-tc5wk -n kube-system
```

`secret`后面名称就是上图中红框的名称

![](https://img.fwhyy.com/2022/202201280604005.webp)

将登陆界面切换到令牌的模式，上图中的`token`值粘贴到令牌输入框中，点击登录可以进入到管理界面，如下图：

![](https://img.fwhyy.com/2022/202201280605591.webp)

## 总结

学习任何一个新的知识领域，即便是很简单的一些操作流程，也会遇到各种各样的问题，解决这些问题的过程就是学习和成长。

`Kubernetes`的功能非常强大，不急于在一开始就弄懂所有的概念和操作命令，关键在于要动手去尝试，在一次次的尝试中积累的经验才能让你理解的更深入。

所以，接下来就要尝试将`dotNetCore`程序部署到`Kubernetes`中了。

