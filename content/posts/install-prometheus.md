---
title: 监控利器：普罗米修斯介绍和安装
date: 2023-11-01T08:29:51+08:00
categories: [技术]
tags: [监控, Prometheus]
---

我们的程序想要稳定的运行，或者说当出现问题时能第一时间知道，这就离不开监控，目前比较主流的就是 Prometheus（普罗米修斯）+ Grafana 的组合。
<!--more-->

准备用三篇文章来介绍怎么使用：

1、基本介绍和安装

2、和中间件的集成

3、在 dotNET Core 中的使用

本文是第一篇：基本介绍和安装。

## Prometheus 介绍

Prometheus 是一套开源的监控报警系统，由 SoundCloud公司开发，于 2012 年开源。已经广泛应用于 Kubernetes 和 ServiceMesh 等云原生环境中。

Prometheus 具有以下核心特征：

- 多维数据模型：Prometheus 采用时序数据库作为存储，可以灵活的存储多维度的数据。
- 灵活的查询语言：Prometheus 使用了功能强大的 PromQL 查询语言，可以实时查询和聚合时序数据。
- 拉取式采集：Prometheus 通过 HTTP 协议周期性抓取被监控组件状态，而不是通过端口接收推送数据。
- 服务发现：Prometheus 支持各种服务发现机制，可以自动发现监控目标，如果需要监控的服务比较少，也可以使用静态配置。
- 多种可视化组件：如 Grafana、PromDash 等，可以用来展示监控数据，本次系列文章中使用 Grafana 做可视化展示。
- 告警管理：通过 Alertmanager 负责实现报警功能，既可以使用邮件，也能通过 Webhook 自定义告警处理方式。

Prometheus 作为云原生应用监控的首选方案，其生态圈非常繁荣。它的出现极大地促进了新的监控思维模式的形成，为构建高可用自动化系统提供了重要保障。

## 数据流走向

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312036981.webp)

* 操作系统和中间件几乎不用做任何配置，目前用到的就发现 nginx 需要配置 nginx_status 模块。
* 不同的中间件用不同的 exporter，exporter 会和中间件之间进行连接，所以运行 exporter 的时候都需要指定中间件的地址和端口。
* 每个 exporter 运行后有对应的 http 地址。
* Prometheus 的配置文件中对 exporter 的 http 地址进行绑定，配置后重新启动 Prometheus 才能生效，如果监控的中间件比较多，就需要考虑使用服务发现了。
* Grafana 专门用来对 Prometheus 收集的数据进行可视化展示，需要在数据源中配置对 Prometheus 的连接，然后针对不同的中间件使用不同的面板就可以了。

## 步骤

1、安装 Prometheus 和 Grafana 。

2、安装部署中间件的 exporter ，本文只介绍 node_exporter 的安装，其他的中间件放到下一篇。

3、修改 Prometheus 的配置文件，添加 job 节点，并重启让其生效。

4、在 Grafana 中添加数据源 。

5、在 Grafana 中添加面板。

## 版本

- CentOS：7.8
- Grafana：10.1.5
- prometheus：2.47.2
- node_exporter：1.6.1

## 环境

* 服务器1：10.211.55.6 （部署 prometheus ）

* 服务器2：10.211.55.14（部署 Grafana、node_exporter ）

## 安装

### 安装 Prometheus

1、在  prometheus 官网下载页面下载相关的安装包，地址如下：

https://prometheus.io/download/

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312038344.webp)

2、在服务器上执行下面命令进行安装：

```shell
cd /root
mkdir prometheus
cd prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.47.2/prometheus-2.47.2.linux-amd64.tar.gz
tar -zxvf prometheus-2.47.2.linux-amd64.tar.gz
cp -R prometheus-2.47.2.linux-amd64 /usr/local/prometheus

```

*  如果使用 wget 下载有问题，就在官网中进行下载。

3、设置 prometheus 系统服务，执行命令创建服务文件 `vi /usr/lib/systemd/system/prometheus.service` ，文件内容如下：

```shell
[Unit]
Description=Prometheus
Documentation=https://prometheus.io/
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/usr/local/prometheus
ExecStart=/usr/local/prometheus/prometheus 
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

4、启动服务和设置开机自动启动：

```
systemctl daemon-reload
systemctl enable prometheus.service
systemctl start prometheus.service
```

5、启动后，可以使用 `systemctl status prometheus.service` 命令查看状态，出现下图界面，表示启动成功：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312038082.webp)

6、在浏览器访问地址：http://10.211.55.3:9090/targets?search= ，出现下图界面，说明 prometheus 已经安装成功了。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312038563.webp)

### 安装 Grafana

1、在  Grafana 官网下载页面下载相关的安装包，地址如下：
https://grafana.com/grafana/download

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312038046.webp)

2、在服务器上执行下面命令进行包的下载和安装

```shell
cd /root
mkdir Grafana
cd Grafana
wget https://dl.grafana.com/oss/release/grafana-10.1.5-1.x86_64.rpm
yum install -y grafana-8.0.6-1.x86_64.rpm
```

 3、启动：

```
systemctl enable grafana-server
systemctl start grafana-server
```

4、启动后，可以使用 `systemctl status grafana-server` 命令查看状态，出现下图界面，表示启动成功：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312129150.webp)

6、在浏览器访问地址：http://10.211.55.14:3000/，出现下图界面，说明 Grafana 已经安装成功了。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312039370.webp)

### 安装 node_exporter

node_exporter 是用来监控服务器的 exporter ，按照下面步骤进行安装：

1、在服务器上执行下面命令进行包的下载和安装

```shell
cd /root
mkdir node_exporter
cd node_exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar -zxvf node_exporter-1.6.1.linux-amd64.tar.gz
cp -R node_exporter-1.6.1.linux-amd64 /usr/local/node_exporter

```

2、设置 node_exporter 系统服务，执行命令创建服务文件 `vi /usr/lib/systemd/system/node_exporter.service` ，文件内容如下：

```shell
[Unit]
Description=node_exporter
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/node_exporter/node_exporter
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

3、设置开机自动启动：

```
systemctl daemon-reload
systemctl enable node_exporter.service
systemctl start node_exporter.service
```

4、访问地址：http://10.211.55.14:9100 ，出现下图界面，说明安装成功：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312039415.webp)

## 配置

1、修改 Prometheus 的配置文件，添加 node_exporter 的绑定，执行命令 `vi vi /usr/local/prometheus/prometheus.yml ` ：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312039622.webp)

```shell
  - job_name: 'centos-1'
    static_configs:
      - targets: ['10.211.55.14:9100']
```

* Job_name：随便取一个能表达意思的名称即可
* targets：node_exporter 安装后发布出来的地址

2、执行命令 `systemctl restart prometheus` 重启 Prometheus 。

3、在 Grafana 中添加数据源，登录 Grafana 后，在 Data Sources 模块中添加数据源：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312039666.webp)

4、选择 Prometheus 作为数据源并进行配置，将 Prometheus 的地址 http://10.211.55.3:9090 ，填写在 server url 中：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312039974.webp)

5、想要在 Grafana 中进行数据的展示，需要导入 dashborards  模板，这个地址中有各类模版可供选择：https://grafana.com/grafana/dashboards/ 。在 Grafana 的 Dashboards 模块中进行导入：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312039992.webp)

6、输入编号：11074，这是可以展示服务器监控信息的 dashborard 模板：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312039911.webp)

7、Load 后，进行导入：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312040107.webp)

8、该 dashborard 模板最终展示的数据效果如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202310312040846.webp)



