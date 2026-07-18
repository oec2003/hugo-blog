---
title: 插件开发：实现 Obsidian 同步到 hexo
date: 2025-02-13T08:37:00+08:00
categories: [技术]
tags: [obsidian,插件,hexo]
---
近两年一直使用 Obsidian 进行最终文字的输出，除了发公众号，还会同步发布到博客中，博客使用的 hexo，现在发布博客的步骤是：

<!-- more -->

1、将文章标题在翻译软件中翻译为英文，并以横线隔开每个单词，作为 hexo 的文件名。

2、vs code 打开 hexo 的代码，执行 `hexo n '英文的文件名'` 。

3、将 Obsidian 中的文章内容复制到新创建的 md 文件中。

4、修改内容最上方的 Front Matter 信息，例如：categories、tags、date 等。

5、执行下面命令完成构建和发布：

```
hexo g
hexo d
```

这个步骤还是有点繁琐，所以经常会忘记更新，忘记不是因为我懒，而是方式不是最优，最终影响到了执行。平时工作也是同样的道理，一件事情如果很繁琐，不顺利，就得停下来看看方法是不是用错了。

最近在尝试使用各类 AI 工具，就想着这个问题是可以写个 Obsidian 的插件来减少工作量的，于是花了一个晚上搞定了。

1、使用的工具是 Windsurf，模型还是用的 Cloude 3.5 sonnet ，之所以没用 DeepSeek，是因为通过这几天的试用，感觉 Windsurf 对 Cloude 3.5 sonnet 的调教更优一些（个人感觉）。

2、遵循一次性对话尽可能只让 AI 完成一件事的原则，我先让生成一个 Obsidian 插件的基础文件，核心逻辑在 main.ts 文件中：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502121650565.webp)

3、接着就按照我上面提到的步骤一步一步引导 Windsurf 来完成开发。

- 获取文章标题调用翻译 API 转换为英文，并添加横线隔开，翻译 API 一开始使用的腾讯，几轮下来还是存在问题，换成百度的翻译 API 就运行成功了
- 将文章内容复制到 hexo 的 `_posts`  目录，获取 Obsidian 文章中的 tag 和 categories，自动转换为 hexo 需要的 Front Matter 格式
- 过程中如果遇到错误，可以打开 Obsidian->View->Toggle Developer Tools （和网页的 F12 一样），将错误信息提供，几轮下来基本都能解决

4、代码写完，执行 `npm run build` 进行构建，构建完成后，会生成一个新的 main.js 文件，Obsidian 插件需要的是包含 main.js 在内的三个文件，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502121651563.webp)

5、怎么安装到 Obsidian，具体步骤也可以在 Windsurf 中询问：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502121651705.webp)

- 需要注意的是重新覆盖了 main.js 文件后，需要重新加载插件（禁用后重新启用）才能生效。

6、首次安装后，在 Obsidian 的第三方插件中就可以看到自己开发的插件了：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502121651842.webp)

7、因为使用了百度的翻译、又要将文章内容同步到 hexo 中，所以需要在插件的设置中配置相关参数：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502121651187.webp)

8、在文档中点击右键，菜单中选择「Publish to Hexo」就可以完成发布了。发布按钮可以放在以下位置，可以让 Windsurf 根据需要自行选择：

- 左侧按钮栏
- 页面菜单项（Page Menu，也就是右上角的三个点菜单）
- 编辑器菜单项（Editor Menu，右键菜单）
- 命令面板（原有的位置，可以通过 Ctrl/Cmd + P 调出）

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202502121651893.webp)

9、文章内容同步到 hexo 后，在 hexo 的根目录执行 `hexo g hexo d` 便可发布了。

插件代码已经上传到 Github，地址如下：

https://github.com/oec2003/obsidian-to-hexo-plugin