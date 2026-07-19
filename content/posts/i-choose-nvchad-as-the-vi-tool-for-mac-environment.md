---
title: Mac环境下的vi工具，我选择NvChad
date: 2024-07-04T23:57:02+08:00
categories: [成长]
tags: [nvchad,nvim,vi,vim,mac]
---

在服务器中操作一些文本时，经常会用到 vi 工具，否则就得把文件拷贝到本地，修改完再传到服务器，非常麻烦。

那么在 Mac 中 vi 有什么用呢？我并不追求将每一种工具都打造成全能的 IDE 。尽管对于编写代码，我们有像 VS Code、Rider、IntelliJ IDEA 这样成熟且功能丰富的集成开发环境，但若只是为了查看代码，我发现 `vi` 依然是一个非常便利的选择。

<!--more-->

一折腾发现，vi 并不只是 vi，又有 Vim、Neovim、NvChad 等，下面先看看这些都是什么？有什么区别？

1、**vi**：是 Unix 和类 Unix 系统中最传统的文本编辑器之一，在 Mac 中也默认提供。由 Bill Joy 在 1970 年代末为 BSD Unix 开发。它是一个模式化的编辑器，具有多种模式，如普通模式、插入模式等。

2、**Vim**：代表 "Vi IMproved"，是一个由 Bram Moolenaar 开发的文本编辑器，它是 vi 的一个增强版。`vim` 增加了很多特性，比如语法高亮、标签页、窗口分割、宏录制、正则表达式支持等，使其成为程序员和开发者广泛使用的编辑器。

3、**Neovim**：是 Vim 的一个重构版本，致力于成为 Vim 的超集。Neovim 和 Vim 配置文件采用相同的语法，所以 Vim 的配置文件也可以用于 Neovim。Neovim 的第一个版本在2015年12月发行，并且能够完全兼容 Vim 的特性。

相比于 Vim，Neovim 的主要改进在于其支持异步加载插件。此外，Neovim 的插件可以用任意语言编写，而 Vim 的插件仅能使用 Vimscript 进行编写。

4、**NvChad**：是一个基于 `Neovim` 的配置，给我们提供一个开箱即用的、高度可定制的开发环境。它集成了许多插件和工具，以提供类似于 IDE 的功能，但仍然保持了 `Neovim` 的轻量级和灵活性。和 NvChad 同类的工具还有 LazyVim 、LunarVim 等，选择 NvChad 是因为 NvChad 的官网比较好看：https://nvchad.com/

简单来说，`Vim` 是 `vi` 的改进版，而 `Neovim` 是对 `Vim` 的现代化重构。`NvChad` 则是基于 `Neovim` 的一个配置，提供了一套丰富的插件和工具集，以增强用户体验。

下面就开始来安装了。

## NvChad 安装

### 1、安装 Neovim

因为 NvChad 是基于 Neovim，所以首先安装 Neovim，Neovim 的官网地址是：https://neovim.io/，安装方式也以后很多种，可以参考：https://github.com/neovim/neovim/blob/master/INSTALL.md 。

我是使用下面命令进行安装的：

```
brew install neovim
```

### 2、安装 Nerd Font

安装这个字体主要目的是显示一些图标，比如文件树中的文件夹图标和不同文件的类型图标等。在《Mac中的常用 shell工具》中也有介绍到。

* 官网：https://www.nerdfonts.com/
* Github地址：https://github.com/ryanoasis/nerd-fonts.git

我使用的是 Github 方式进行安装，首先将 git 代码拉到本地：

```
git clone https://github.com/ryanoasis/nerd-fonts.git --depth 1
```

进入 nerd-fonts 目录，执行 `./install.sh` 进行安装，安装完后，可以在 iTerm2 的设置中进行字体设置：

![](https://img.fwhyy.com/2024/202407040818604.webp)

### 3、安装 NvChad

使用下面命令进行安装：

````
git clone https://github.com/NvChad/starter ~/.config/nvim && nvim
````

参考：https://nvchad.com/docs/quickstart/install

![](https://img.fwhyy.com/2024/202407040818919.webp)

## NvChad 配置和使用

### 1、配置快捷方式

使用命令 `vi ~/.zshrc ` 编辑配置文件，在最后添加下面代码：

```
alias vi=nvim
```

保存后，执行 `source  ~/.zshrc` 生效。设置后，直接输入 vi filename 就是直接使用 Neovim 打开。效果如下：

![](https://img.fwhyy.com/2024/202407040822102.webp)

### 2、主题切换

首先切换到 vi 的普通模式，然后输入 `空格+th` 就会出现下图界面，可以鼠标上下移动看预览效果，选择喜欢的回车确认即可。

![](https://img.fwhyy.com/2024/202407040819367.webp)

### 3、呼出左侧文件树

切换到 vi 的普通模式，输入 `ctrl+n` ，就可以打开文件树，如下图：

![](https://img.fwhyy.com/2024/202407040819763.webp)

## vi 基本知识

之前使用 vi ，因为只是偶尔在服务器上进行文件编辑，是会一些简单的操作，例如：

* dd 删除一整行
* :q 退出
* :x 保存退出

但实际 vi 功能非常强大，如果能熟练使用，效率会大大提升。

### vi 的常见模式

1、**普通模式（Normal Mode）**：

- 这是 Vim 启动时的默认模式。在这个模式下，你可以移动光标、复制、粘贴、删除文本，但不能直接输入文本。
- 按下 `Esc` 键可以进入或返回普通模式。

2、**插入模式（Insert Mode）**：

- 在这个模式下，可以插入文本。
- 在普通模式下按 `i`、`I`、`a`、`A`、`o`、`O`等键可以进入插入模式。

3、**命令行模式（Command-line Mode）**：

- 用于输入命令，如查找、替换、保存文件等。
- 在普通模式下按 `: `进入命令行模式。

4、**可视模式（Visual Mode）**：

- 允许你选择文本块，然后对选中的文本执行操作，如复制、删除或替换。
- 快捷键：按下 `v` 进入可视模式，选择字符；`V `进入可视行模式；`Ctrl+V `进入可视块模式。

### Normal 模式操作

* hjkl：上下左右
* gg：调到第一行
* G：调到最后一行
* ctrl+u：往上翻一页
* ctrl+d：往下翻一页
* {lineno}+gg：跳转到指定行，lineno 为指定行的行号

从 Normal 进入 Insert 模式：

* i：表示 insert ，从当前光标之前开始输入
* a：表示 append，从当前光标之后开始输入
* o：下方插入新的一行，然后开始输入
* s：删除当前光标的字符，然后开始输入
* I：大写 i，在本行的开头开始输入
* A：在本行的末尾开始输入
* O：上方插入新的一行，然后开始输入
* S：删除当前行，然后开始输入

### Command 模式操作

在 Normal 模式下输入西文冒号进入 Command 模式

* :w：保存当前文件
* :q：退出
* :q!：放弃当前更改，然后退出
* :wq：保存当前更改，然后退出，还有一个简洁的命令 :x 也是相同的作用
* :h {command}：显示关于命令的帮助
* 按 Esc 回到 Normal 模式

### Visual 模式操作

在 Normal 模式下按 v 进入可视模式

* 进入可视模式后可以用 Normal 模式下的移动命令选择文本
* 可视模式下，x/y ：剪切/复制；回到 Normal 模式下按 p 进行粘贴
* Normal 模式下按 V 进入行可视模式，一次选中一整行
* 按 Esc 回到 Normal 模式

### 其他高效光标移动

在 Normal 模式下使用 hjkl 可以进行简单的光标移动，这种移动不太高效，下面介绍几种高效的移动：

* w：表示 word，跳转到下一处单词的开头
* b：表示 back，跳转到上一处单词的开头
* e：表示 end ，跳转到下一处单词的结尾
* ge：e 的反向版本，跳转到上一处单词的结尾

* ^/$ ：跳转到本行的开始/结尾
* %：跳转到匹配的配对符号（括号等），这个在浏览代码时很有用

### 几个 vim 学习的网站

https://vim.nauxscript.com/

https://dofy.gitbook.io/learn-vim/zh-cn

https://vim.is/#exercise

## 最后

Vim 的使用，如果一直都只用几个常用命令，那还不如去使用 vs code 或其他的编辑器，使用 Vim 就得深入用起来，强迫自己使用各种高效的操作方式，直到这些操作变成肌肉记忆。

