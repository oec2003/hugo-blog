---
title: GitLab 服务器的迁移以及注意点
date: 2021-03-01T22:05:08+08:00
categories: [技术]
tags: [GitLab,迁移]
---

Git 已经是代码托管工具中的主流了，如果是自己搭建私有的 Git 服务器我们一般会使用 GitLab ，在《[在CentOS7中安装GitLab](http://mp.weixin.qq.com/s?__biz=MzU0NjgzNzQyMw==&mid=2247483693&idx=1&sn=c4e5ff320b4def07707387fc0b64794a&chksm=fb56c7edcc214efb5f0177d9b5fb0e368f2232f0086eb45f35efdce3011933d8bd9f712bde57&scene=21#wechat_redirect)》 一文中有介绍怎样在 CentOS7 中安装 GitLab 。文本主要介绍怎样迁移 GtiLab 。

<!--more-->

## 环境

- CentOS：7.4
- GitLab：10.6.4

## 新服务器安装 GitLab

安装方法可以按照上面文章中的步骤，但需要注意的是，新服务器上装的 GitLab 的版本和原服务器的 GtiLab 的版本保持一致。

通过下面的命令可以查看原服务器上的 GitLab 的版本：

```
cat /opt/gitlab/embedded/service/gitlab-rails/VERSION
```

安装指定版本的命令如下：

```
yum makecache   # 更新本地YUM缓存
yum install -y gitlab-ce-10.6.4  # 安装指定版本
```

## 备份

备份非常的简单，只需要执行下面的命令即可：

```
gitlab-rake gitlab:backup:create
```

备份文件存储在目录 `/var/opt/gitlab/backups` 中。

## 还原

将文件拷贝到新服务器的 /var/opt/gitlab/backups 目录，并执行下面命令给文件设置权限：

```
chmod 777 1502357536_2017_08_10_9.4.3_gitlab_backup.tar
```

执行下面的命令进行恢复：

```
gitlab-rake gitlab:backup:restore BACKUP=文件编号
```

比如备份文件的名称为 1615384704_2021_03_10_10.6.4_gitlab_backup.tar，那么文件编号为：1615384704_2021_03_10_10.6.4

中间会有两次这种交互式的提示，输入 yes 让其继续执行就可以还原成功。

![iShot2022-02-01 22.07.41](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012208870.jpg)

如果您的迁移和我一样是由外网服务器迁移到内网服务器，如下图：

![iShot2022-02-01 22.08.28](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012208731.jpg)

有两个地方需要注意：

1、在外网服务器上需要使用 nginx 进行代理访问，配置如下：

```
server {
    listen       9000;
    server_name  221.222.10.56;

   location / {
      proxy_pass http://10.15.10.133:9000;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrate";
   }

   error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

- listen：外网访问的端口
- server_name：外网服务器 ip
- proxy_pass：内网 GitLab 的访问地址

2、默认情况下，内网部署的 GitLab 初始化的访问地址也是内网的地址，在界面中看到仓库地址也是内网地址，如下图：

![iShot2022-02-01 22.09.03](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012209164.jpg)

需要修改 GitLab 的配置文件来进行解决，进入到内网的 GitLab 服务器，执行下面命令编辑配置文件:

```
vi /opt/gitlab/embedded/service/gitlab-rails/config/gitlab.yml
```

修改 host 和 port ，如下图：

![iShot2022-02-01 22.09.46](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012210740.jpg)

执行 `gitlab-ctl restart` 重启 GitLab 服务生效。

## 最后

最近有一些朋友在后台私有我，说一些思考总结类的文章挺好，挺有收获，但有些文章在网上可以搜索得到，为什么还会写。

像今天这篇就属于此类，我大概解答下：

我在做这些操作实践时是也是通过了大量的搜索，因为使用场景、软件版本等各方面的原因，往往不能一次性成功，还是需要不断尝试，所以我在写这类文章时在开头就会注明环境。总结成文章写出来后对自己也是一个备忘，同时也希望如果有朋友碰到跟我类似场景的，能够带来直接的帮助。
