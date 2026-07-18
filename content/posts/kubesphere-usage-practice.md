---
title: Kubesphere 使用实践
date: 2024-05-29T08:45:33+08:00
categories: [技术]
tags: [Kubesphere,Kubernetes,DevOps,CI/CD,K8S]
---

容器化部署，尤其是利用 Docker 技术，已成为现代软件部署的标配。我们可以通过简单的命令如 `run` 直接启动容器，或者使用编排工具如 `docker-compose` 和 **Kubernetes**（简称 **k8s**）等来简化操作。

<!--more-->

**Kubernetes** 是一个开源的容器编排平台，最初由 Google 设计开发，目前由 **Cloud Native Computing Foundation**（CNCF）维护。它旨在简化容器化应用的部署、扩展、管理和自动化，帮助用户更高效地构建、交付和运行应用程序。虽然 Kubernetes 功能强大，但其复杂性对一些用户来说是个挑战。

接下来，让我们引入本文的主角——**KubeSphere**。

### KubeSphere 介绍

**KubeSphere** 可以理解为 Kubernetes 的扩展和增强，它提供了更多功能和解决方案，以简化和优化 Kubernetes 的使用。KubeSphere 提供了丰富的工具和服务，包括 DevOps、多租户管理、服务网格、存储、日志监控等，帮助用户轻松构建、部署和管理云原生应用。

KubeSphere 能在 Kubernetes 基础上构建的更完整的云原生全栈解决方案，它进一步简化和增强了 Kubernetes 的功能，提供更广泛的支持和服务。

以下是 KubeSphere 官网对其的定义：

> KubeSphere 的愿景是打造一个以 Kubernetes 为内核的云原生分布式操作系统。它的架构支持第三方应用与云原生生态组件的即插即用（plug-and-play）集成，实现多云与多集群环境下云原生应用的统一分发和运维管理。

更多关于 KubeSphere 的信息，请访问其官方网站：[KubeSphere 官网](https://kubesphere.io/zh/)。

## 安装准备

对于刚接触 KubeSphere 并想快速上手该容器平台的用户，All-in-One 安装模式是最佳的选择，它能够帮助您零配置快速部署 KubeSphere 和 Kubernetes 。

### 环境准备

* CentOS：7.4.1708/7.9，8 GB 内存、4 核 CPU 
* Docker：23.0.5
* Kubernetes：1.22.12
* KubeSphere：3.4.0

### 节点要求

1、节点必须能够通过 SSH 连接。
2、节点上可以使用 sudo/cur1/openss1 命令。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281458084.webp)

### 安装  Docker

```shell
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

sudo yum-config-manager --enable docker-ce-edge

sudo yum -y install docker-ce

systemctl start docker
chkconfig docker on
```

安装完成  docker  后，需要对  docker  进行配置，执行下面命令：

```shell
tee /etc/docker/daemon.json <<-'EOF'
{
	"exec-opts": ["native.cgroupdriver=systemd"]
}
EOF
```

然后执行：systemctl restart docker ，重启  docker  让配置生效。

### 安装依赖项

Kubekey 是用 Go 语言开发的一款全新的安装工具，代替了以前基于 ansible 的安装程序。KubeKey 为用户提供了灵活的安装选择，可以分别安装 KubeSphere 和 Kubernetes 或二者同时安装，既方便又高效。

KubeKey 可以将 Kubernetes 和 KubeSphere 一同安装。针对不同的 Kubernetes 版本，需要安装的依赖项可能有所不同。

执行下面命令安装相关依赖：

```
yum -y install socat conntrack ebtables ipset
```

### 网络和 DNS 要求

1、请确保 /etc/resolv.conf 中的 DNS 地址可用，否则，可能会导致集群中的 DNS 出现问题。使用命令：cat /etc/resolv.conf 查看：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281459221.webp)

也可以使用命令  nslookup www.baidu.com 进行测试，出现下图说明正常：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281459706.webp)

2、关闭防火墙。

先用命令 firewall-cmd --state 查看防火墙的状态，如果是  running ，就使用下面命令进行关闭：

```shell
systemctl stop firewalld
systemctl disable firewalld
```

3、检查 SELinux 是否关闭，输入命令 sestatus 进行查看：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281459949.webp)

上图中是开启状态，编辑配置文件：vi /etc/selinux/config ：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281459501.webp)

修改完成后，重启服务器生效。

### 下载  kubekey

k8s 和 kubesphere 的安装是使用  kubekey  这个工具，所以先安装  kubekey 。不管你是否能访问 Github 和 Google ，先执行下面命令切换区域，会省去很多麻烦：

```shell
export KKZONE=cn
```

从 GitHub Release Page 下载 KubeKey 或直接使用以下命令。

```shell
curl -sfL https://get-kk.kubesphere.io | VERSION=v3.0.13 sh -
```

成功后如下图，并在当前目录中有一个绿色的  kk  目录：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281459590.webp)

如果  kk  目录的权限不够，需要使用下面命令进行授权：

```
chmod +x kk
```

## 安装 

1、在  root 目录中输入 ./kk ，可以看到一些常用的命令和不同的安装方式说明：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281459038.webp)

2、下面命令是同时安装  k8s  和 kubesphere，安装前会先进行环境的检查：

```
./kk create cluster --with-kubernetes v1.22.12 --with-kubesphere v3.4.0
```

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281500944.webp)

安装中：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281500256.webp)

最后的安装  kubesphere  要等待很久：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281500263.webp)

关键是等了很长的时间，也没有得到安装成功的提示，查询后得知可能是 CentOS 系统版本中的依赖跟 KubeKey 有冲突导致，我使用的是：CentOS Linux release 7.4.1708 (Core) ，**建议使用 CentOS 7.9 **。

3、创建新的虚拟机，安装 CentOS 7.9 系统，我是在 Mac 上使用 Parallels 进行虚拟机的安装，安装过程中出现下面问题：

* 红屏

* Not asking for VNC because we don't have a network 提示的错误信息

可以通过下面设置解决：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281500854.webp)

4、CentOS 7.9 安装好后，按照上面的步骤重新安装了一遍，这一次安装成功，kubesphere 的访问地址和用户名密码都会在安装成功的提示中输出：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281500157.webp)

5、登录后如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281501179.webp)

6、特别注意，虚拟机的配置至少 4 核、8gb 内存，我一开始只给了 2 核（默认），运行后，监控中的有些节点是不能正常启动的，当调整为 4 核后，就都正常了：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281505331.webp)

## KubeSphere 使用

### 常用命令

```

# 查看哪些 pod 启动了，使用 -A 参数表示获取所有命名空间下的 Pod
kubectl get pod -A 
# 详细描述指定命名空间中特定 Pod 的信息
kubectl describe pod pod名称 -n 命名空间
# 获取指定命名空间（这里是 kube-system 命名空间）中的所有 Pod 列表
kubectl get pods -n kube-system
# 获取 Kubernetes 集群中所有节点（Node）的列表
kubectl get nodes
```

### 创建工作负载

1、在工作负载中添加有状态副本集，填写基本信息：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281624747.webp)

2、进行容器设置，首先选择容器，可以直接输入 mysql 进行搜索，然后选择需要安装的数据库版本：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281624575.webp)

3、设置环境变量，时区、root 密码等：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281624605.webp)

4、配置存储挂载：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281625187.webp)

5、挂载配置文件：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281626873.webp)

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281626700.webp)

6、使用前需要创建服务，当我们创建一个有状态的副本集后，默认创建了一个服务：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281626894.webp)

默认是集群内部访问，在容器的控制台使用 DNS 名称，可以进行登录：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281626782.webp)

7、如果需要外部访问，需要创建一个服务，选择指定工作负载：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281627474.webp)

8、按照下图所示找到有状态副本集进行指定：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281628907.webp)

9、配置服务名称和端口：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281629934.webp)

10、设置访问模式：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281630531.webp)

11、外部访问，注意服务创建后，会生成一个外部访问的端口

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281630064.webp)

12、使用客户端工具连接：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202405281631262.webp)
