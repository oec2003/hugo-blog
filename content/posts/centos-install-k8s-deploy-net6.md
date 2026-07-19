---
title: CentOS单机安装k8s并部署.NET 6程序
date: 2022-02-20T10:26:00+08:00
categories: [技术]
tags: [CenOS,K8s,.NET 6]
---

学习云原生，k8s 是一个基础，为了做一些实验，单机部署是最方便的，下面将介绍在 CentOS 中单机安装 k8s ，并将一个 .NET 6 的程序发布到 k8s 中。

<!--more-->

## 环境

* 宿主机：Mac 10.15.7
* CentOS
  * 版本：7.6
  * 内存：4gb
  * cpu：2核
* docker：20.10.12
* k8s：1.23.4

## 准备

1、创建一个 CentOS 虚拟机，配置如下：

* 版本：7.6
* cpu：2核
* 内存：4gb

2、执行下面命令更新 yum 源：

```
yum update
```

3、设置 iptables 检查桥接流量，编辑  /etc/sysctl.conf 文件，在文件中添加如下内容：

```sh
net.bridge.bridge-nf-call-iptables = 1
```

4、禁用 swap：

```
swapoff -a
```

修改 /etc/fstab 文件，将下图红框部分注释：

![iShot2022-02-18 10.53.46](https://img.fwhyy.com/2022/202203070539190.webp)

## 安装

1、安装 docker：

```sh
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

sudo yum-config-manager --enable docker-ce-edge

sudo yum install docker-ce

systemctl start docker
chkconfig docker on
```

2、在 /etc/yum.repos.d 下创建 k8s.repo, 并添加如下内容：

```shell
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
       http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
```

3、安装 kubelet、kubeadm 和 kubectl：

```sh
yum install -y kubelet kubeadm kubectl
systemctl enable kubelet  && systemctl start kubelet
```

4、在 root 目录下创建文件 k8s-images.sh ,内容如下：

```
for i in `kubeadm config images list`; do 
  imageName=${i#k8s.gcr.io/}
  docker pull registry.aliyuncs.com/google_containers/$imageName
  docker tag registry.aliyuncs.com/google_containers/$imageName k8s.gcr.io/$imageName
  docker rmi registry.aliyuncs.com/google_containers/$imageName
done;
```

5、执行 sh k8s-images.sh 命令来进行相关镜像的拉取，但最后会报一个错，coredns 镜像拉取失败，如果是科学上网就不存在问题，错误信息如下：

>Error response from daemon: pull access denied for registry.aliyuncs.com/google_containers/k8s.gcr.io/coredns/coredns, repository does not exist or may require 'docker login': denied: requested access to the resource is denied

可以手动拉取镜像来进行处理，依次执行下面命令：

```
docker pull coredns/coredns
docker tag coredns/coredns:latest k8s.gcr.io/coredns/coredns:v1.8.6
docker rmi coredns/coredns:latest
```

为什么上面 tag 的时候用的是 1.8.6 的版本，可以先执行 `kubeadm config images list`查看下镜像的版本，我这里执行后的镜像列表如下，而 coredns 就是 1.8.6：

>k8s.gcr.io/kube-apiserver:v1.23.4
>k8s.gcr.io/kube-controller-manager:v1.23.4
>k8s.gcr.io/kube-scheduler:v1.23.4
>k8s.gcr.io/kube-proxy:v1.23.4
>k8s.gcr.io/pause:3.6
>k8s.gcr.io/etcd:3.5.1-0
>k8s.gcr.io/coredns/coredns:v1.8.6

6、设置 cgroup ，在 /etc/docker/ 目录下添加 daemon.json 文件，内容如下：

```sh
{
    "exec-opts": ["native.cgroupdriver=systemd"]
}
```

执行下面命令让配置生效：

```sh
systemctl daemon-reload
systemctl restart docker
```

7、执行下面命令开放端口，如果还是碰到各种端口不能访问的问题，测试环境可以关闭防火墙：

```sh
# 6443 Kubernetes API服务器	所有组件
firewall-cmd --zone=public --add-port=6443/tcp --permanent && firewall-cmd --reload
# 10250 Kubelet APT	Kubelet自身，控制平面组件
firewall-cmd --zone=public --add-port=10250/tcp --permanent && firewall-cmd --reload
```

8、执行下面命令初始化 k8s ：

```
kubeadm init
```

初始化成功，会出现下图的日志：

![iShot2022-02-18 17.53.09](https://img.fwhyy.com/2022/202202192143761.webp)

如果中途有报错，进行了其他的设置后，需要执行 `kubeadm reset` 后再执行 `kubeadm init` 。

## 安装后的配置

1、根据上图的提示进行配置，依次执行下面命令：

```
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

3、因为是单机版，需要让 master 节点参与工作：

```
kubectl taint nodes --all node-role.kubernetes.io/master-
```

3、 安装网络插件：

```
kubectl apply -f "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')"
```

4、执行 `kubectl get nodes` ，如果 status 为 Ready ，说明安装配置完成，master 节点注册到了 k8s 中。

>NAME              STATUS   ROLES                  AGE     VERSION
>k8s-single-temp   Ready    control-plane,master   5m58s   v1.23.4



## 部署 .NET 6 程序

1、在命令行执行命令创建一个名为`k8s-netcore-demo`的项目：

```
dotnet new webApp -o k8s-netcore-demo --no-https
```

2、进入 k8s-netcore-demo 目录执行 dotnet publish ，将发布后的 publish 目录复制到上面的 CentOS 的 root 目录中。

3、进入 publish 目录，创建 Dockerfile 文件，内容如下：

```
FROM mcr.microsoft.com/dotnet/aspnet:6.0
COPY . /app
WORKDIR /app
EXPOSE 80/tcp
ENTRYPOINT ["dotnet", "k8s-netcore-demo.dll"]
```

4、在 publish 目录下执行下面命令，将程序构建成镜像：

```
docker build -t k8s-netcore-demo .
```

5、搭建私有仓库：

```
docker pull registry
docker run -d -p 8888:5000 --restart=always registry
```

6、编辑 /etc/docker/daemon.json 文件，添加下面内容：

```
{
   "exec-opts": ["native.cgroupdriver=systemd"],
   "insecure-registries":["10.211.55.10:8888"] # 新加的内容,IP 为宿主机的 IP
}
```

执行下面命令重启生效：

```
sudo systemctl daemon-reload
sudo systemctl restart docker
```

7、将构建的镜像推送到私有仓库：

```
docker tag k8s-netcore-demo 10.211.55.10:8888/k8s-netcore-demo
docker push 10.211.55.10:8888/k8s-netcore-demo
```

8、在 root 目录下创建文件 deploy.yaml 文件，内容如下：

```yaml
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
        image: 10.211.55.10:8888/k8s-netcore-demo
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

- 所有配置为 k8s-netcore-demo 的地方是构建的镜像的名称；
- image 的值为 10.211.55.10:8888/k8s-netcore-demo，这个是镜像发布到私有仓库中的地址；
- namespace 的值配置为创建的 namespace 的名称。

9、在 k8s 中创建 namespace ：

```
kubectl create namespace k8s-netcore
```

10、执行 `deploy.yaml` 文件：

```
kubectl create -f deploy.yaml --validate
#加上 --validate 参数，当yaml文件有错误时，会给出提示
```

11、使用 `kubectl get` 命令查看创建情况：

```
kubectl get deploy -n k8s-netcore
# 结果如下：
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
k8s-netcore-demo   2/2     2            2           8h
```

12、查看访问端口：

```
kubectl get svc -n k8s-netcore
# 结果如下：
NAME               TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
k8s-netcore-demo   NodePort   10.106.23.177   <none>        80:32230/TCP   8h
```

13、访问 http://10.211.55.10:32230 ,正常出现下图则部署成功：

![iShot2022-02-19 07.18.54](https://img.fwhyy.com/2022/202203070539920.webp)

## 总结

我按照上面的步骤可以顺利安装成功，但由于系统、环境、网络、版本的差异可能会出现问题，也不用担心，根据错误信息搜索能够解决。

有问题不可怕，不断地去解决问题，我们的能力才能提升。
