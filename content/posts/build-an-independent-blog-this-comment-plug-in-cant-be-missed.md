---
title: 搭建独立博客，这款评论插件不能错过
date: 2019-12-30T06:58:14+08:00
categories: [成长]
tags: [hexo,插件]
---

微信公众号因为申请的时间晚，一直到现在都无法开通评论功能，之前博客一直使用的多说作为评论系统，自从多说关闭后，好多年都处于无评论状态，最近发现 `gitalk` 还不错，所以在博客中进行了对 `gitalk` 的集成，特此记录。

<!--more-->

## 环境

* hexo: 3.9.0
* hexo-cli: 2.0.0
* theme：maupassant
* gitalk：1.1.4

## 使用原因

1、支持 `Markdown` 语法
2、采用 `github issue` 实现，比较清爽（无广告）
3、被墙的可能性较小

## 配置步骤

1、在 `github` 中添加评论项目
2、在 `github` 中设置认证
3、在 `hexo` 中安装 `gitalk`
4、对 `hexo` 的主题 `maupassant` 做相关设置
5、发布

## 在 github 中添加评论项目

在 `github` 中创建一个公开项目，例如，我创建了一个名为 `hexo-comments` 的公开项目，最后项目的访问地址为：`https://github.com/oec2003/hexo-comments`

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280646715.jpg)
（图1)

## github 设置认证

打开 `https://github.com/settings/applications/new` ,进行相关设置，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280646537.jpg)
（图2)

* Application name：随便取个名称
* Homepage URL：博客的地址
* Application description：描述
* Authorization callback URL：配置在 `github` 中创建的评论项目的地址

配置好后，点击 `Register application` 按钮即可。配置好后如果想要修改配置内容，可以在 `github` 中点击「右上角图标」->「Settings」->「Developer settings」->「OAuth Apps」

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280646318.jpg)
（图3)

点击右侧的 `hexo-comments` 可以查看相关的 `id` 和秘钥，在后面的配置中会用到该信息

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280647249.jpg)
（图4)

## 安装 Gitalk

在现有的hexo项目中安装 `gitalk`，执行命令 `cnpm i --save gitalk` 如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280647661.jpg)
（图5)

## hexo 主题设置

我的博客主题改自 `maupassant` 主题，当时的版本中并不支持对 `gitalk` 的支持，只需要进行下面的步骤就可以完成对 `gitalk` 的集成：

1、在 `maupassant` 主题下的 `_config.yml` 文件中添加 `gitalk` 相关配置

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280647849.jpg)
（图6)

```
gitalk:
  enable: true ## 设置true为开启gitalk
  owner:  oec2003 ## github的登录名
  repo:  hexo-comments ## 注意：此处设置为在github中创建的评论项目的名称，而非完全访问地址
  client_id:  xxx ## 见图4
  client_secret:  xxx ## 见图4
  admin:  oec2003 ## github的登录名
```

2、配置评论模板，在 `maupassant->layout->_partial->comments.jade` 文件中添加如下内容

```
if theme.gitalk.enable == true
    #container
    link(rel='stylesheet', type='text/css', href='//unpkg.com/gitalk/dist/gitalk.css?v=' + theme.version)
    script(type='text/javascript' src='//cdn.bootcss.com/blueimp-md5/2.10.0/js/md5.js?v=' + theme.version)
    script(type='text/javascript' src='//unpkg.com/gitalk/dist/gitalk.min.js?v=' + theme.version)
    script.
      var gitalk = new Gitalk({
        clientID: '#{theme.gitalk.client_id}',
        clientSecret: '#{theme.gitalk.client_secret}',
        repo: '#{theme.gitalk.repo}',
        owner: '#{theme.gitalk.owner}',
        admin: ['#{theme.gitalk.admin}'],
        id: md5(location.pathname),
        distractionFreeMode: false
      })
      gitalk.render('container')
```

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280648802.jpg)
(图7)

## 发布

执行下面命令进行构建和发布

```
hexo g
hexo d
```

效果如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201280648315.jpg)

希望微信公众号能早日开通评论。

