---
title: Obsidian 一周使用心得（配置、主题和插件）
date: 2022-06-27T08:20:20+08:00
categories: [成长]
tags: [工具,效率]
---

在上一篇 Obsidian 初体验 中介绍了为什么要开始使用 Obsidian 和我的一些基本用法，本文将继续讲解近一个星期以来的使用心得，包括配置、外观和插件。

对于工具类的软件，我一直的方式是先进行基本设置，使用起来，在使用过程中再慢慢发现一些高级用法，就像 Obsidian 这个软件，目的是能方便进行写作，如果花大量精力去研究功能、插件等，就有点本末倒置了。

<!--more-->

## 配置

1、语言设置，在「设置->关于」中进行语言的切换：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206260916713.png)

2、删除文件设置，在「设置->文件与链接」中进行配置，我设置为移至软件回收站，这样删除的文件会在 Obsidian 的库目录下的一个隐藏目录中，如果发现误删还能找回来。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206260916965.png)

3、新建笔记目录设置，在「设置->文件与链接」中进行配置，设置后，新创建的文件就在设置的目录中。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206260916183.png)

4、图片目录设置，在「设置->文件与链接」中进行配置，设置后，在文章中粘贴的图片就会存储到设置的目录中。

不同的文章中粘贴的图片都会在这一个目录中，要是能像 Typora 根据文章名称生成子目录就更好了。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206260916804.png)

## 主题

在 Obsidian 中，每个库都可以单独进行设置，我现在使用的是 Primary 主题，因为色系我很喜欢，从上面的截图中可以看到。另外 Blue Topaz 主题也不错，里面有丰富的设置，而且是中文界面。

在「设置->外观->主题」界面点击「管理」按钮，在弹出的界面中选择使用喜欢的主题即可。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206260917689.png)

如果点击「管理」按钮，界面不能正常出来，可以尝试换下网络。

值得注意的是，网上很多教程中有写到主题的配置，但我在实际使用过程中却没有发现那些配置项，后来才发现需要安装 System Settings 插件，关于这个插件在下面的插件部分会讲到。

## 插件

在「设置->第三方插件」中进行插件的安装，点击「社区插件」后面的「浏览」按钮打开插件列表界面进行安装即可。安装插件前，需要先将安全模式的开关关闭。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206260917926.png)

如果有些插件在线安装失败，可以在 https://ob.pory.app/ 这个站点进行下载，进行手动安装，将下载的包解压后复制到目录：`库/.obsidian/plugins` 即可。

下面介绍几个我目前用到的插件：

**1、System Settings**

上面提到安装主题之后，需要配合 System Settings 插件才能使用，例如，如果安装的是 Blue Topaz 主题，设置界面如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206260919971.png)

基本上这里的设置就够用了，真满足不了，还能自定义 CSS ，这里就不详细说了。

**2、Calendar**

之前使用 Notion 的时候，用的是 Notion 中的日历，使用方式是在日历的每天中创建一个或多个 Page ，这样有几个问题：

- 页面层级深，想要找到当天的某个页面，需要先找到左边菜单的日历，然后找到当天，再打开对应的 Page ;
- Page 本身没有状态，需要到里面进行待办的添加，又多了一个层级，比较麻烦。

在 Obsidian 中默认就有日记的功能，在核心插件中开启就可以使用了：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206260923195.png)

通过 Calendar 组件，就能在右侧的面板中展示日历了，并且在 Calendar 组件设置中可以开启周显示：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206260923280.png)

右侧面板中显示如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206260919306.png)

设置好当天日记的快捷键，不管现在是在写那篇文章，一个快捷键就能立即回到当天的日记当中，非常方便。

日记和周记都能设置存放目录和模板，但设置的地方不一样，日记因为是内置插件，在核心插件中设置，周记则是在 Calendar 插件中进行设置。

我的日记和周记模板如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206260919427.png)

**3、rollover daily todos**

当天日记中的待办没处理完，第二天的日记中又要手动进行添加。

这个插件可以自动将前一天没有处理完的待办事项添加到新创建的日记中。还可以设置是否删除前一天没完成的事项。

**4、Image Auto Upload Plugin**

这个插件主要用来上传粘贴在文章中的图片，在上一篇《Obsidian 初体验》中有介绍。

**5、Obsidian Git**

现在我是使用 iCloud 来做 Obsidian 的备份和同步，但多一个备份源会更踏实，所以我在 GitHub 上创建了一个私有仓库，Obsidian Git 插件可以用来做自动备份 。

例如我设置 3 分钟同步一次：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206260918141.png)

自动同步后的效果如下：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206260917673.png)

使用这个插件不仅仅是有备份的作用，还可以追踪历史版本。

最后说一个使用过程中发现的小技巧，在使用 iCloud 进行 PC 和移动端同步的过程中，经常发现 PC 端新增了内容后，移动端没能及时同步。这时只需要打开 Finder ，就可以看到 iCloud 云盘右边有一个小圆圈在转动，只要这个圆圈转完，移动端便会立即更新。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202206260918139.png)

卢曼说过：不写作，就无法思考，所以工具只是辅助，多写，多思考才能不断提升。

希望本文对您有所帮助。
