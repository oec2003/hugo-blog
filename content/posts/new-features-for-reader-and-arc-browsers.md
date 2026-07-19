---
title: 效率工具：Reader和Arc浏览器新功能
date: 2024-04-24T08:37:08+08:00
categories: [成长]
tags: [效率工具, Reader, Arc浏览器]
---

Arc 浏览器和 Readwise Reader 是我在 Mac 上很喜欢的两款工具，这两款工具最近推出的一些功能能极大提升效率。哦不，功能推出有一阵子了，我最近才开始使用。

本文简单介绍下这些新功能。

<!--more-->

## Reader

1、在 Reader 中阅读文章时，右边栏会有 summary 对文章进行总结，不过之前的版本总结很差，几乎没法用，要么是英文、要么很简短。

![](https://img.fwhyy.com/2024/202404231733752.webp)

2、现在的版本中推出了一个 Ghostreader prompts 的功能，可以自定义提示语，点击下图 Customize 进行设置。

![](https://img.fwhyy.com/2024/202404231733339.webp)

3、点击下图中的 Edit prompt 进行提示词的编辑。

![](https://img.fwhyy.com/2024/202404231733763.webp)

4、编辑的内容如下：

```
{#- 简体中文摘要与重点提取 -#}

{#- 下面的 Prompt 会将文档缩减成一个 500 字内的摘要，并根据你的 highlight 进行重点摘要。-#}

请使用 500 字以内，以简体中文总结以下文本：

"""

标题：{{ document.title }}
作者：{{ document.author }} 
来源：{{ document.domain }}

另外，在阅读此文章时，我对以下部分进行了高亮，认为这些是文章的重点，给你学习参考：

{% for highlight in document.highlights %}
- {{ highlight.content }}
{% endfor %}

{#- 下面的 if-else 逻辑检查文档的长度。如果文档较长，它将使用关键句子以避免超出 GPT 提示窗口的限制。我们强烈建议除非您知道自己在做什么，否则不要更改此设置。-#}

{% if (document.content | count_tokens) > 2000 %}
{{ document.content | central_sentences | join('\n\n') }}
{% else %}
{{ document.content }}
{% endif %}

"""

重要提示：请不要超过 500 字。每句话应该简洁易读；关于中文的排版原则：在中文和英文或数字之间，要有一个半角空白，例如：Apple 手机；3 个 AI 工具。

另外，在文章总结下方换行后，基于本文重点，请创建 3 个有关问题及其答案。每个问题应能帮助深入理解文章的关键概念，并加强对重点的印象。请注意，在问题的这一行上，使用粗体的 markdown 格式，或者 <strong> 的 html 标签来更让文字显眼。

{#- 创建问答 -#}

**问题 1：{# 基于重点内容构建的问题 #}**

答案：{# 对应问题 1 的答案，应该包含对应的重点内容 #}

**问题 2：{# 同上 #}** 

答案：{# 对应问题 2 的答案，应该包含对应的重点内容 #}

**问题 3：{# 同上 #}**

答案：{# 对应问题 3 的答案，应该包含对应的重点内容 #}
```

上面的提示语可以达到以下三个效果：

* 根据文章内容生产 500 字以内的总结性文字。

* 可以将你在文章中划线部分进行重点参考。

* 针对文章内容提出 3 个问题，并给出答案。

5、默认情况下使用的是 GPT-3.5 Turbo ,如果想要使用 GPT-4 ，需要使用自己的 API key 。

![](https://img.fwhyy.com/2024/202404231733211.webp)

6、下面找一篇文章来看看效果。

![](https://img.fwhyy.com/2024/202404231733940.webp)

## Arc 浏览器

Arc 浏览器新退出的 AI 智能功能，只需要在设置中打开 Max 即可。

![](https://img.fwhyy.com/2024/202404231733491.webp)

下面逐一介绍这几个功能。

### Tidy Tabs

当开启了的页签数达到 6 个或以上时，上面会出现一个小扫帚的图标，点击这个图标，Arc 会根据网站的类型进行分类。

![](https://img.fwhyy.com/2024/202404231733059.webp)

下面是分类后的效果：

![](https://img.fwhyy.com/2024/202404231733883.webp)

### Instant Links 

这个功能很有用，在 Arc 浏览器中搜索时（输入网页地址的框），直接按 Shift + Enter ，Arc 会根据输入的内容智能找到一个唯一结果页面并且打开，省掉了在搜索引擎中手动去过滤结果的步骤。

比如：搜索「dotnet8下载页面」或者「冯威博客」，按下  Shift + Enter ，会出现下图的提示文本：Searching the web for you... ，稍等一下，就会以新页签打开搜索结果。

![](https://img.fwhyy.com/2024/202404231734963.webp)

### Ask on Page

我们使用 Arc 浏览网页一些文章时可以使用 Command+F 对网页进行提问：

![](https://img.fwhyy.com/2024/202404231734004.webp)

在回答中可以点击 Find on Page 找到原文的参考文本：

![](https://img.fwhyy.com/2024/202404231734619.webp)

这个功能可以大大提升浏览网页的效率。

### 5-Second Previews

在 google 中进行搜索时，鼠标悬停到搜索结果的链接上，会自动总结这个链接的内容，以卡片的形式进行展示，不用在一个一个链接点击去看了：

![](https://img.fwhyy.com/2024/202404231734981.webp)

### Tidy Tab Titles

当把页签从临时区拖到固定区时，会自动对页签的标题进行重命名，如果不满意也可以双击进行修改，下面是 .NET 下载页面的标题前后对比：

![](https://img.fwhyy.com/2024/202404231734754.webp)

### Tidy Downloads

在 Arc 浏览器中进行下载时，会自动重命名下载的文件名，让文件名更容易理解：

![](https://img.fwhyy.com/2024/202404231734566.webp)

### ChatGPT in the Command Bar

在地址栏输入「ChatGPT」，然后点击 Tab 键，会出现如下界面：

![](https://img.fwhyy.com/2024/202404231734234.webp)

输入问题：介绍下 vue 的基本使用，Arc 会进入到 ChatGPT 的回答页面：

![](https://img.fwhyy.com/2024/202404231734002.webp)

希望本文对您有所帮助！
