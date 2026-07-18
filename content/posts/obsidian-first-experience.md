---
title: Obsidian 初体验
date: 2022-06-14T08:20:20+08:00
categories: [成长]
tags: [工具,效率]
---

我虽然不是工具控，但写作类的工具用过不少，其中 Notion 和 Typora 还专门写文章介绍过：
* 一款用了就不想走的工具
* 使用 Typora 进行写作

<!--more-->

Notion 和 Typora 这两个工具我都很喜欢，也用了挺长时间，但也有遇到了不少问题：

1、Notion 不支持离线，在线的情况下因服务器在国外，速度没那么快；

2、Notion 不支持本地存储,尽管支持导出 Markdown 格式；

3、Typora 没有移动端，有时没有 PC 的场景下，我会先把内容复制到 Notion 中，在 Notion 的移动端继续编辑，然后在 PC 上又拷贝回 Typora ，非常麻烦。

最近体验了下 Obsidian ，感觉还不错，可以完美解决我的问题。

Obsidian 是一款支持本地文件的笔记工具，我之前在 Typora 中创建的目录和文件，只需要在 Obsidian 中创建新库的时候指向该目录，就可以无缝切换了，没有迁移成本。

这也是支持本地文件的好处，现在越来越倾向使用支持本地文件的工具，至于多端同步有很多种方式，例如：iCloud、GitHub 等。

Obsidian 官方就支持简体中文，安装的时候可以选择，或者安装成功之后，在设置中进行切换，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206191600438.png)

如果不使用 Obsidian 的高级功能，Obsidian 就是一个支持本地存储的 Markdown 编辑器，甚至和 Typora 切换使用也是没问题的，因为指向的是同一个文件目录。要解决的首要问题就是在文章中插入图片的问题。

在 Typora 中结合 PicGo 可以很容易将粘贴的文件上传到 Github 的仓库中，然后通过 jsdelivr 进行加速。Obsidian 通过插件也能轻松实现，插件的下载地址如下：

https://github.com/renmu123/obsidian-image-auto-upload-plugin/releases/tag/2.1.0

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206180711667.png)

将下载 zip 包解压后放到 Obsidian 的插件目录，插件目录为 `库的根目录/.obsidian/plugin` ，插件设置界面如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206190731262.png)

需要注意的是如果插件设置中的第一项「粘贴自动上传」如果是开启的，那么粘贴图片后会直接上传，不会存储到本地目录，所以想要本地存一个备份，就要关闭这个开关。图片的本地存储目录设置如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206190748234.png)

上面提到 Typora 最大的问题就是没有移动端，而 Obsidian 是全平台支持的，现在需要解决的就是同步的问题，这里我使用的是 iCloud 。

我是先使用移动端，并创建了一个库，并设置了 Store in iCloud 。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206190809700.png)

如果是先在 PC 端创建库，将库的位置设置到 iCloud 云盘目录也是可以的。

Obsidian 还支持双链的功能，比 Notion 的好用不少，只需要连续输入两个中括号就能弹出智能提示框，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206190912497.png)

在添加了双链的文章可以直接点击标题进入到链接的文章，被链接的文章展开右侧面板中可以看到有哪些页面链接了此文章：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206190933307.png)

除此之外 Obsidian 还有链接的关系图谱可以查看，随着时间的积累，知识库内容越来越多，通过图谱可以很容易找到关联性进行回顾：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206190934888.png)

除了双链，Obsidian 还可以在文中使用井号打标签，而且支持多级标签，例如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206190934694.png)

在设置的核心插件中开启标签面板，就可以在右侧的标签面板中查看了：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206190934849.png)

标签展示如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206190933679.png)

正是由于双向链接和标签的加持，所以文章的目录我设置的非常简单，不用再纠结写文章时应该创建什么目录和放到哪个目录了。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206190933209.png)

作为一个纯 Markdown 文本编辑器来说，有些体验还是不如 Typora ，比如：没有专注模式、打字机模式，段落换行后的空行问题等。但因为同是本地存储，两边换着用也没有问题。

何况，除了纯 Markdown 文本编辑，Obsidian 还有各种基础配置、主题、插件等可以丰富软件本身，也能丰富我们的工作流程，下一篇再继续介绍吧。