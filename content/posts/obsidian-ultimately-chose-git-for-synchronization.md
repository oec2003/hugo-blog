---
title: Obsidian 同步最终还是选择了Git
date: 2026-02-12T18:05:00+08:00
categories: [技术]
tags: [obsidian,工具]
---
第一次使用 Obsidian 是在 2022 年，这是翻阅之前的文章 [[Obsidian 初体验]] 才知道的，这几年主要是在电脑上使用，移动端因为同步问题用的非常少。

<!-- more -->

之前也尝试过 Syncthing、坚果云等方案，但总有不好用的地方。一旦体验不佳，慢慢就不再使用，移动端也随之成了摆设，浪费了不少时间。

最近又折腾了下 Obsidian 的 Git 插件，虽然也有点麻烦，但它是适合我的。

下面介绍下怎么配置和使用。

## 环境

- PC 端：Mac
- 移动端：安卓

## 使用的插件和工具

1、PC 端 Git 插件

2、移动端：GitSync、Termux

## PC 端配置步骤

1、在 Gitee（也可以使用 GitHub） 上创建存放 Obsidian 的仓库

2、在 Obsidian 的根目录添加 .gitignore 文件，内容如下：

```
.obsidian/
.stfolder/
.stfolder.*

# 忽略系统文件
.DS_Store
Thumbs.db
desktop.ini

# 忽略备份文件
*.bak
*.tmp

# 特殊配置：保留核心插件配置（可选）
# Ignore Smart Environment folder
.smart-env
.trash/

node_modules/
.obsidian-git-log.txt
*.swp
.directory
```

3、PC 端的 Obsidian 安装 Git 插件

4、将笔记仓库推送到 Gitee，并在 Obsidian 中安装 Git 插件并进行配置，主要设置了打开仓库时自动拉取（pull）最新的笔记。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202602111746650.webp)

## 移动端配置步骤

1、移动端安装 Obsidian、Termux、GitSync。

2、在手机 documents 目录中创建 obsidian-mobile 目录。

3、在 Gitee 生成个人访问令牌，Gitee → 设置 → 私人令牌 → 生成新令牌，必须勾选 projects 权限（用于仓库操作）。令牌生成出来后需要及时复制保存，否则窗口关闭后就无法查看了。

4、有了令牌后笔记仓库的地址如下：

```
https://oauth2:令牌@gitee.com/xxxx/obsidian-sync.git
```

5、在 Termux 中进入到 obsidian-mobile 目录，执行以下命令拉取笔记仓库

```shell
git clone https://oauth2:令牌@gitee.com/xxxx/obsidian-sync.git
```

6、打开移动端的 Obsidian ，选择 obsidian-mobile/obsidian-sync 目录作为 vault 的目录，设置完后，就能看到笔记内容了。

7、因为安卓版本的 Obsidian 的 Git 插件不太好用，所以同步使用 GitSync 这个工具。在 GitSync 中设置仓库目录和远程地址。

- 仓库目录：documents/obsidian-mobile/obsidian-sync
- 远程地址：https://oauth2:令牌@gitee.com/xxxx/obsidian-sync.git

## 操作模式

1、在 PC 端完成一轮笔记修改后，或者要长时间离开电脑时，顺手使用 Git 插件将修改内容推送到服务端。

2、在手机上使用时，先打开 GitSync 同步，再打开 Obsidian；修改完成后，再次使用 GitSync 同步即可。

3、看似有点麻烦，但这是程序员的日常常规操作。

4、尽量不要在没有提交推送的情况下同时在 PC 端和移动端修改同一个文件，否则会出现冲突。解决冲突的方式和写代码时完全一致。比如下图就是出现冲突时的显示，将冲突部分修改为最终版本提交推送即可。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202602121110236.webp)

5、之所以最终还是选择了使用 Git 的方式，主要还是因为它熟悉且可控。

## 最后

同步方式有很多种，选择自己喜欢的就好。