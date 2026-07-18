---
title: 插件开发：实现Obsidian同步到墨问笔记
date: 2025-05-30T16:47:00+08:00
categories: [技术]
tags: [插件,obsidian,墨问]
---
墨问笔记是微信的一个小程序，功能越来越强大，最近发布了 OpenAPI 和 MCP ，本文简单介绍下怎么写一个插件将 Obsidian 中的内容发布到墨问笔记中。

<!-- more -->

主要功能如下：

1、将 Obsidian 中的选中的文本或完整文章发布到墨问。

2、可以通过右键菜单或者命令进行笔记的发布。

3、点击发布后会弹出界面输入标题和标签。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202505301748099.webp)

插件开发的步骤如下：

1、开发工具使用字节出的 Trae 国际版，模型使用 Claude-4-sonnet，付费用户不用排队，首月只需要 3 刀，值得一试。

2、在墨问后台获取 API Key 。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202505301749670.webp)

点击获取 API Key ，留着备用。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202505301749534.webp)

3、在 Trae 中选择 Builder 模式，一定得是 Builder 模式，否则不会自动创建文件，对话框中输入下面内容。

> 我现在要开发一个obsidian插件，这个插件的作用如下：1、选择一段文本，点击右键，点击publish to mowen ，可以弹出界面让我输入标题和tag，确定后调用api发布到墨问笔记；2、点击右上角三个点，在展开的菜单中点击 publish to mowen 可以将当前文章发布到墨问笔记，弹出的窗口中自动带出当前文章的标题，可以允许修改。 墨问笔记创建的接口文档地址如下： https://mowen.apifox.cn/295621359e0

4、等待几分钟，会自动生成所有项目文件，并且会提示需要执行下面的命令，点击接受即可。

```shell
npm install
npm run build
```

5、执行过 `npm run build` 后会产生打包后的文件，最终将下面红框中的三个文件复制到 Obsidian 的插件目录中。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202505301749642.webp)

6、在 Obsidian 中，进入插件的设置界面，将获取的 API Key 输入到对应的文本框中。API URL 检查是否正确。正确应该为：https://open.mowen.cn/api/open/api/v1/note/create

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202505301749200.webp)

7、需要注意的是，如果重新覆盖了 main.js 文件后，需要重新加载插件（禁用后重新启用）才能生效。

8、现在可以验证下功能是否正常，选择一段文本点击右键，在弹出的菜单中选择“
publish to mowen” 。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202505301749244.webp)

9、点击 “Publish” 按钮进行发布，如果出现成功提示，就去墨问笔记中查看是否创建了新的笔记。如果出现错误，将错误提示反馈给 Trae，Trae 会分析错误进行代码修复。

10、Trae 第一次生成的程序我就没有执行成功，原因是 body 内容格式不对，我就将 NoteAtom 的结构说明文档连接：https://mowen.apifox.cn/6682171m0 丢给了 Trae，就修改成功了。

插件代码地址：https://github.com/oec2003/obsidian-pub-to-mowen-plugin