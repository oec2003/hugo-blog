---
title: 代码提交那点事
date: 2023-02-13T09:46:06+08:00
categories: [管理]
tags: [工具,效率,规范]
---

现在，代码的版本管理大多都在使用 git，常用的一些代码托管平台有：Github、码云、Gitlab 等，不管用的哪个平台，我们经常会做提交代码的操作，但很容易忽视 commit message 的写法。
<!--more-->
在一些工具中进行代码提交，提交信息是必填的，正因为是必填，就会出现很多随意的内容，例如：ok、update、test 等，这些毫无意义的信息内容会给后续工作带来很多麻烦。

所以，春节后上班第一件事就是在团队内强调提交信息的重要性，并制定统一规范。很多时候做不好，不是能力问题，而是态度问题。

在提交信息的规范上可以按照下面三个方面来做：

1、规范信息的写法；

2、提交信息的合并；

3、提交和任务关联。

## 规范信息的写法

commit message 通常包括两个部分：header、body ，如下：

```csharp
<type>: <subject>   //冒号使用西文
//空一行
<body>
```

### header

header 部分只有一行，包括两个字段：type（必须） 和 subject（必须），type  和 subject 之间使用西文冒号和一个空格隔开。

#### type

用于说明 commit 的类别，只允许使用下面 3 个类别。类别不宜弄的太多，太多了开发人员在提交代码时会带来负担。下面这三个类别我认为几乎可以包含所有情况了：

- feat：新功能（feature）
- fixed：修复 bug
- refactor：重构（即不是新增功能，也不是修改 bug 的代码修改）

#### subject

提交信息的标题，一句话总结提交的信息，尽量做到既简洁，又详细。

### body（非必填）

body 部分是对本次  commit 的详细描述，可以分成多行，**body 和 header 中间空一行。**body 为非必填内容，如果 subject 中能说明白了，body 就可以空着。

如果你觉得一次 commit 的内容中包含下面一些情况，就可以在 body 中写明：

* 有相关联影响点的；
* 内容相对较多，subject 不能完全描述的；
* 提交内容包含特殊的意图。

## 提交合并

有了标准的规范后，提交的信息统一了、可读性更强，但有时在开发一个特性或修改一个 Bug 时，会 commit 很多次代码，这些提交目的其实是一个，如果能将这些 commit 记录合并起来，整体的提交信息记录就更加清晰。

将多个 commit 提交进行合并，需要用到 git 的 rebase 功能，下面进行一个简单的演示来看看 rebase 怎么使用：

1、在 gitlab 上创建一个示例项目 rebase_test；

2、将项目拉到本地，添加 README.md 文件，并推送到 gitlab ；

3、分三次修改 README.md 文件，进行三次 commit ，使用 git log 查看看提交记录如下：

![](https://img.fwhyy.com/2023/202306180834558.webp)

4、将提交 push 到 gitlab ，在 gtilab 中显示如下：

![](https://img.fwhyy.com/2023/202306180834721.webp)

5、现在要将这三次提交合并为一次，在 git 命令行执行：

```
git rebase -i 740aa70a
```

* -i ：代表交互式操作；
* 740aa70a ：表示第一个提交的 commit id，取前几位就行。

6、按下图红框部分进行内容的修改，然后保存：

![](https://img.fwhyy.com/2023/202306180834859.webp)

7、将三次修改的提交信息进行合并：

![](https://img.fwhyy.com/2023/202306180834219.webp)

8、使用 git log 看提交信息的记录，会发现已经进行了合并：

![](https://img.fwhyy.com/2023/202306180834772.webp)

## 和任务关联

在 git 中的每次提交，都是跟具体的任务相关，正常的迭代任务、Bug 任务等，如果能将任务和代码提交记录进行关联，对于后续的问题排查和查找修改记录会有很大帮助。

起初的想法是将任务的编号写到提交信息的 header 部分：

```
<type>: <taskNumber> <subject> 
//空一行
<body>
```

后来发现在 pingcode 的应用市场中有一个 Gitlab 应用，可以到达提交和任务关联的目的。恰好，我们团队也正在使用 pingcode 。

Gialab 应用的介绍是这样的：

>GitLab 是由 GitLab Inc.开发的一款基于 Git 的完全集成的软件开发平台。GitLab在国内最广为人知的功能当属代码托管，这源于其基于Ruby on Rails的开源项目属性。GitLab App是由PingCode Labs开发的一款工具，它可以将GitLab的Commit、Branch、Merge Request关联到 PingCode 的工作项中。

详细的配置可以参考：

https://apps.pingcode.com/gitlab/configuration

最终任务关联后的效果如下：

![](https://img.fwhyy.com/2023/202306180834357.webp)

在 pingcode 的任务界面中可以看到代码的分支、提交记录和 pull reqeust 记录，点击提交记录可以直接跳转到 Gitlab 中对应的页面。
