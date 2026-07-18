---
title: WordPress使用Markdown
date: 2015-06-22
categories: [成长]
tags: [Markdown, Wordprss,博客]
---

自从知道有Markdown这么个东西后，就彻底喜欢上了。期间也折腾过支持Markdown格式的博客系统，如：Octopress、hexo。之前也写过几篇关于Octopress的博文：[http://fwhyy.com/categories/Octopress/](http://fwhyy.com/categories/Octopress/)。对于hexo折腾一番后发布到了github上，可以通过[http://oec2003.github.io/](http://oec2003.github.io/)访问。

但自从用了独立博客以后，一直使用的是WordPress，去年又迁移到了Linode的VPS上，暂时还没找到好的方式在Linode上部署hexo，所以还是决定在WordPress中使用Markdown。
<!--more-->
## Markdown工具的选择

在WordPress中使用Markdown最直接的方式就是使用插件，WordPress中有不少Markdown的插件，我也试用过几个，效果都不怎么好。所以我的思路是使用Markdown编辑工具写好博客后转换成Html，然后将Html发布到WordPress。

在Windows平台下有很多的Markdown编辑工具：

* [https://www.zybuluo.com](https://www.zybuluo.com/)
* [https://stackedit.io](https://stackedit.io)
* [http://mahua.jser.me/](http://mahua.jser.me/)
* [Simple MarkPad](http://simple-markpad.qiniudn.com/)
* Sublime Text+Markdown插件，可以支持预览
* 为知笔记，支持Markdown，效果一般，不能所见即所得
* [MarkdownPad](http://markdownpad.com/)
* [马克飞象](http://maxiang.info/)，有Web版、有Chrome的插件，其实就是一个Windows客户端、还可以和印象笔记进行同步。

最终选择了马克飞象 ，原因有以下几点：

* 有Web版，有客户端，可以支持离线写作；
* 天生的可以和印象笔记同步，就可以支持多客户端浏览；
* 支持实时显示效果，展示的效果也不错。

## 使用马克飞象

目前这篇博文就是在马克飞象的Chrome插件中进行编写，在马克飞象中编写好后可以导出成Html格式，Html页面展示的效果全依赖下面这个CSS文件：

[https://dn-maxiang.qbox.me/res-min/themes/marxico.css](https://dn-maxiang.qbox.me/res-min/themes/marxico.css)

这个CSS文件特别大，大概有2万多行，我试过直接在Wordpress中引用会和现有的Wordpress的样式有冲突，所以解决方法就是在该CSS中摘出我需要的样式，我整理了些放在Gist中：

[https://gist.github.com/oec2003/ebe7e8c76a6d5397f838](https://gist.github.com/oec2003/ebe7e8c76a6d5397f838)

我在WordPress中使用的是我改造后的twentytwelve主题，将整理的CSS样式追加到主题的主CSS中，路径为：wp-content\themes\twentytwelve\style.css

## 写作流程

* 在马克飞象中用Markdown格式写好博客
* 导出成Html文件
* 将Html内容复制到Wordpress后台进行发布

