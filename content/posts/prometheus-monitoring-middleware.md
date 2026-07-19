---
title: 监控利器：普罗米修斯监控中间件(Nginx、Redis、MySql 等)
date: 2023-11-09T16:36:23+08:00
categories: [技术]
tags: [监控, Prometheus]
---

我们的产品目前使用到的中间件有 Nginx、Redis、RabbitMQ、MySql 等，本文介绍怎样使用 Promtheus 来监控这些中间件。
<!--more-->
在《监控利器：普罗米修斯介绍和安装》中有一张图，表明了 Prometheus 的数据走向，如下：

![](https://img.fwhyy.com/2023/202311081626495.webp)

从图中可以看出，监控中间件的第一步就是安装中间件的 exporter，安装有两种方式：下载安装文件进行安装和使用 Docker 进行安装，下面示例中使用的是后者。

## Nginx

1、我们产品的前端 Web 部署在 nginx 容器中，需要在容器的配置文件中进行 nginx_status 模块的设置，才能被 exporter 识别。 nginx 配置文件添加下面代码：

```shell
 location /nginx_status {
        stub_status on;
        access_log off;
        allow all;
       # deny all;
 }
```

* 为了测试方便直接设置为 allow all 了，实际可以根据需要进行开放和禁用。

2、修改配置后，重启 Web 容器，访问 http://ip:port/nginx_status  ,出现下图界面，说明配置生效：

![](https://img.fwhyy.com/2023/202311081627093.webp)

3、执行下面的命令进行 nginx-exporter 容器的安装：

```shell
docker pull nginx/nginx-prometheus-exporter
docker run -p 9113:9113 -d  --restart=always --name nginx-exporter nginx/nginx-prometheus-exporter -nginx.scrape-uri http://10.211.55.3:90/nginx_status
```

* http://192.168.3.78/nginx_status 为被监控的 nginx 服务器的地址。

容器运行后，访问 9113 端口，如下图：

![](https://img.fwhyy.com/2023/202311081627166.webp)

4、在 prometheus 的配置文件中进行绑定，执行`vi /usr/local/prometheus/prometheus.yml`，在文件的最下面添加  job 配置：

![](https://img.fwhyy.com/2023/202311081627140.webp)

```
  - job_name: 'nginx'
    static_configs:
      - targets: ['10.211.55.3:9113']
```

5、执行命令 `systemctl restart prometheus` 重启生效，可以访问 http://10.211.55.3:9090/targets 查看状态，如果为 UP 说明 job 设置成功：

![](https://img.fwhyy.com/2023/202311081627264.webp)

6、在 Grafana 中导入 12078 模板：

![](https://img.fwhyy.com/2023/202311081627752.webp)

7、最终展示效果如下：

![](https://img.fwhyy.com/2023/202311081627150.webp)

## Redis

1、首先需要安装 redis_exporter ，执行下面命令进行镜像的下载和安装：

```shell
docker pull oliver006/redis_exporter 
# 如果 redis 没有密码执行下面命令
docker run -d --name redis_exporter -p 9121:9121   --network s2v9_test_s2_net  oliver006/redis_exporter --redis.addr redis://172.66.9.9:6379 
# 如果 redis 有密码执行下面命令
docker run -d --name redis_exporter -p 9121:9121   --network s2v9_test_s2_net  oliver006/redis_exporter --redis.addr redis://172.66.9.9:6379 --redis.password '000000'
```

* 上面命令中 --network s2v9_test_s2_net 为 redis 容器所在的网络，因为我的 exporter 容器和 redis 容器在一台服务器，设置为同一网络后，--redis.addr 就可以使用容器的内部 IP 和端口。
* 如果是分开部署，不需要设置 --network ，使用服务器 IP 和端口即可。

2、容器运行成功后，浏览器访问界面如下：

![](https://img.fwhyy.com/2023/202311081627290.webp)

3、在 prometheus 的配置文件中进行绑定，执行`vi /usr/local/prometheus/prometheus.yml`，在文件的最下面添加 job 配置：

![](https://img.fwhyy.com/2023/202311081627986.webp)

```
  - job_name: 'reids'
    static_configs:
      - targets: ['10.211.55.3:9121']
```

4、执行命令 `systemctl restart prometheus` 重启生效，可以访问 http://10.211.55.3:9090/targets 查看状态，如果为 UP 说明 job 设置成功：

![](https://img.fwhyy.com/2023/202311081628046.webp)

5、在 Grafana 中导入 763 编号的模板：

![](https://img.fwhyy.com/2023/202311081629990.webp)

6、最终展示效果如下：

![](https://img.fwhyy.com/2023/202311081629359.webp)

## RabbitMQ

1、首先需要安装 redis_exporter ，执行下面命令进行镜像的下载和安装：

```shell
docker pull kbudde/rabbitmq-exporter:latest

docker run -d -p 9419:9419 --name rabbitmq-exporter --network s2v9_test_s2_net -e RABBIT_URL=http://172.66.9.8:15672 -e RABBIT_USER=Ican -e RABBIT_PASSWORD=000000 kbudde/rabbitmq-exporter

```

* -e RABBIT_URL=http://172.66.9.8:15672 ，这里设置的是 RabbitMQ 容器的内部 IP，所以必须设置在同一个网络中，否则需要将 15672 映射出去。
* -e RABBIT_USER、-e RABBIT_PASSWORD 为 RabbitMQ 的用户名和密码，默认为 guest，也可以自行设置。

2、容器运行成功后，浏览器访问界面如下：

![](https://img.fwhyy.com/2023/202311081629715.webp)

3、在 prometheus 的配置文件中进行绑定，执行`vi /usr/local/prometheus/prometheus.yml`，在文件的最下面添加 job 配置：

![](https://img.fwhyy.com/2023/202311081630361.webp)

```
  - job_name: 'rabbitmq'
    static_configs:
      - targets: ['10.211.55.3:9419']
```

4、执行命令 `systemctl restart prometheus` 重启生效，可以访问 http://10.211.55.3:9090/targets 查看状态，如果为 UP 说明 job 设置成功：

![](https://img.fwhyy.com/2023/202311081630040.webp)

5、在 Grafana 中导入 2121 编号的模板：

![](https://img.fwhyy.com/2023/202311081630941.webp)

6、最终展示效果如下：

![](https://img.fwhyy.com/2023/202311081630412.webp)

## MySql

1、在 mysql 数据库中创建 exporter 账户，并设置权限：

```
CREATE USER 'exporter'@'%' IDENTIFIED BY 'Aa123456';
GRANT PROCESS, REPLICATION CLIENT ON *.* TO 'exporter'@'%';
GRANT SELECT ON performance_schema.* TO 'exporter'@'%';
```

2、在目录 `/root/exporter/config/mysql` 中创建 .my.cnf 文件，文件内容如下：

```
[client]
host=172.66.9.2
port=3306
user=exporter
password=Aa123456
```

* host 配置为 mysql 数据库的容器 IP
* user 和 password 配置为新创建的账号和密码

3、执行下面命令安装 mysqld-exporter ：

```shell
docker pull prom/mysqld-exporter
docker run -d -p 9104:9104 --network s2v9_test_s2_net --restart="always" -v /root/exporter/config/mysql/.my.cnf:/.my.cnf prom/mysqld-exporter
```

如果没有 .my.cnf 文件的映射，会出现下面错误：

![](https://img.fwhyy.com/2023/202311081630032.webp)

4、容器运行成功后，浏览器访问界面如下：

![](https://img.fwhyy.com/2023/202311081630915.webp)

5、在 prometheus 的配置文件中进行绑定，执行`vi /usr/local/prometheus/prometheus.yml`，在文件的最下面添加 job 配置：

![](https://img.fwhyy.com/2023/202311081630009.webp)

```
  - job_name: 'mysql'
    static_configs:
      - targets: ['10.211.55.3:9104']
```

6、执行命令 `systemctl restart prometheus` 重启生效，可以访问 http://10.211.55.3:9090/targets 查看状态，如果为 UP 说明 job 设置成功：

![](https://img.fwhyy.com/2023/202311081630285.webp)

7、在 Grafana 中导入 7362 编号的模板：

![](https://img.fwhyy.com/2023/202311081630518.webp)

8、最终展示效果如下：

![](https://img.fwhyy.com/2023/202311081631867.webp)
