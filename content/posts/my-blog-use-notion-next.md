---
title: 我的博客换成了 NotionNext
date: 2023-02-06T09:43:24+08:00
categories: [成长]
tags: [工具,博客,Notion]
---

在《程序员不可错过的一款Hexo博客主题》中介绍了我博客的主题 stellar ，还介绍了部署方式的调整：
<!--more-->
* 空间：使用 GitHub Page ,然后进行域名的绑定；
* 域名：需要修改 DNSPod 中的 DNS 解析；
* 图床：选用 GitHub 图床，配合 jsdelivr 做 CDN 加速；
* 写作工具：Typora；发布方式：GitHub Action 。

尽管这种方式有很大的改进，但因为使用的是 hexo ，每次发布博客文章的步骤：

* 使用 hexo 的命令创建一个 md 文件；
* 将写好的文章复制到改 md 文件中，并填写相关的头信息，分类、标签之类的；
* 本地运行预览下效果；
* 发布到服务器。

这种方式对程序员来说算是非常友好了，但每次修改文章上面的步骤几乎要重新来一遍。而且之前使用 stellar 主题也是因为这个主题有专栏，但试用之后发现专栏的功能没有达到我的预期（通过引用博文的方式来组织专栏）。

所以，决定换一个博客工具，春节期间，一番折腾后，发现了 NotionNext。

Notion 是我一直在使用的一款强大的笔记工具，NotionNext 将 Notion 笔记实时渲染成静态博客网站，就像下面这样，在 Notion 中维护笔记，稍等片刻，网站的内容就自动更新了。

![](https://img.fwhyy.com/2023/202306171745119.webp)

下面介绍我是怎样迁移到 NotionNext 的，大体有三个步骤：

1、将网站在 vercel 中运行起来；

2、绑定域名；

3、博客配置。

## 使用 vercel 托管

vercel 是一个用来部署前端应用的云平台，我们使用 vercel 来进行网站的托管。步骤如下：

1、NotionNext 的 Github 地址是：https://github.com/tangly1024/NotionNext ，将该项目 fork 到自己的仓库中；

2、在 https://vercel.com 网站中注册账号，成功注册后，在 vercel 中创建项目 notion-next；

3、在 vercel 创建项目时，导入上面 fork 的 Git 项目；

4、在环境变量中添加 Notion 的 Page ID ，这样就和 Notion 的数据库做了绑定；

Notion 的 Page ID 在 Notion 的页面点击 Share 后的地址中获取：

![](https://img.fwhyy.com/2023/202306171744983.webp)

5、vercel 默认会提供域名供我们访问，当然我们也能绑定自己的域名。

更多的介绍可以参考作者的博客：https://tangly1024.com/

## 域名绑定

1、我使用 Cloudflare 来做 DNS 解析，Cloudflare 是一家全球最著名的 CDN 加速服务商，提供了免费和付费的网站加速和保护服务;

2、在 Cloudflare 网站中注册账号，添加站点 fwhyy.com ;

3、在 Cloudflare 的 DNS 模块设置 A 记录和 CNAME，地址为 vercel 中的地址：

![](https://img.fwhyy.com/2023/202306171744380.webp)

4、在 godaddy 中将域名的 DNS 设置为 Cloudflare 的 DNS 服务器：

![](https://img.fwhyy.com/2023/202306171744868.webp)

5、在 vercel 中进行域名的添加，解析正常如下图：

![](https://img.fwhyy.com/2023/202306171744146.webp)

6、如果发现解析不正常，可以检查下 Cloudflare 中的配置，ssl 中是否设置的是完全：

![](https://img.fwhyy.com/2023/202306171744347.webp)

并且在「缓存/配置」中清除所有内容：

![](https://img.fwhyy.com/2023/202306171744861.webp)

## 配置

经过上面的步骤，就可以通过域名访问了。但博客的一些基本设置还需要修改源码。

将 fork 的项目下载到本地，主要修改根目录下的 blog.config.js 文件：

![](https://img.fwhyy.com/2023/202306171744046.webp)

配置中的项都有注释说明，也可以自行修改，然后执行 `yarn dev` 在本地运行看效果。调整完成后，将代码 push 到 Github 后，vercel 会自动进行编译和发布：


![](https://img.fwhyy.com/2023/202306171744716.webp)

## 最后

如果您在使用 Notion ，又正好想要玩玩博客，我觉得可以试下 NotionNext 。不过我理想中的博客还是能随意写博客文章，又能方便地将现有的博客文章组织成专栏。

