---
title: Mac中的常用 shell工具
date: 2024-06-13T08:51:25+08:00
categories: [成长]
tags: [shell, mac]
---

很多时候我们需要使用命令行进行一些操作，在 Mac 中有自带的终端（Terminal）可以使用，但功能比较简单，其他的一些工具也使用过不少，下面就简单介绍下我在 Mac 中用过的一些命令行工具。

<!--more-->

## Termius

Termius 的功能很全面，支持SSH、SFTP、Telnet、Mossh、串行端口和远程桌面协议。使用也很方便，而且还支持中文，目前是我的主要 shell 工具，不过功能虽然强大我也只是用到了 ssh ，SFTP 我用的另一个工具 Transmit 。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121710914.webp)

## Tabby

Tabby 是一款开源的终端工具，Github地址是：https://github.com/Eugeny/tabby ，它提供了一个现代化的界面和丰富的功能集，颜值和功能非常不错，之前也用过一段时间，偶尔有卡顿，后来还是回到了 Termius 。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121710277.webp)

## Warp

Warp 是一款现代化的终端工具，以其智能命令行界面和丰富的功能获得用户青睐。它支持多种 Shell  环境，提供智能命令补全、历史命令搜索、多标签管理、内联图片和表情支持等特性。Warp 还集成了 AI 辅助功能（有次数限制）。同时支持协作功能，允许团队成员共享终端会话。刚用时很惊艳，但不太符合我的使用习惯。Warp 的 GitHub 地址为：https://github.com/warpdotdev/Warp 。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121710078.webp)

## iTerm2

iTerm2 是 Mac 中一款免费的 shell 工具，功能强大，可定制性高，刚安装看着很普通，和系统自带的终端没什么区别，但如果有一颗折腾的心，可以使 iTerm2 变得很惊艳。

端午节期间，研究了下 iTerm2 ，最终配置出了比较满意的效果：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121711460.webp)

### 1、安装 iTerm2 

```
brew install iTerm2  
```

可以使用命令进行安装，也可以直接在官网进行下载：https://iterm2.com/downloads.html

### 2、安装 On My Zsh

On My Zsh 为 zsh 提供很多增强功能，比如插件、主题等。On My Zsh 的 Github 地址为：https://github.com/ohmyzsh/ohmyzsh 。

输入下面命令进行安装：

```shell
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

### 3、zsh 设置

Mac 上默认有 zsh 工具，可以用下面的命令进行检查：

```
cat /etc/shells
```

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121712999.webp)

使用命令 `echo $SHELL` 可以查看 zsh 是不是默认环境，如果不是，可以使用下面命令进行切换：

```
chsh -s /bin/zsh
```

### 4、安装 NERD FONTS 字体

因为后面使用的主题中有的会有一些小图标，默认的字体可能会不支持，导致图标位置出现乱码：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121712916.webp)

安装 NERD FONTS 字体：

* 官网：https://www.nerdfonts.com/
* Github地址：https://github.com/ryanoasis/nerd-fonts.git

我使用的是 Github 方式进行安装，首先将 git 代码拉到本地：

```
git clone https://github.com/ryanoasis/nerd-fonts.git --depth 1
```

进入 nert-fonts 目录，执行 `./install.sh` 进行安装，安装完后，可以在 iTerm2 的设置中进行字体设置：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121712091.webp)

### 5、安装以及配置 Powerlevel10k

On My Zsh 安装之后，默认在 `~/.oh-my-zsh` 目录，进入这个目录进行 Powerlevel10k 的安装

```
cd ~/.oh-my-zsh/themes
git clone  https://github.com/romkatv/powerlevel10k.git
```

修改配置：

vi ~/.zshrc 设置如下内容 使用 p10k 主题 ZSH_THEME=“powerlevel10k/powerlevel10k”

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121712980.webp)

输入下面命令生效，第一次输入下面命令会直接弹出 Powerlevel10k 的配置向导，根据自己的喜好进行设置即可：

```
source ~/.zshrc
```

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121712304.webp)

如果你对配置不满意，可以输入下面命令重新进行配置：

```
p10k configure
```

### 6、安装插件

目前就安装了语法高亮和自动补全插件：

```
# 高亮
cd ~/.oh-my-zsh/custom/plugins/
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git
# 自动补全
cd ~/.oh-my-zsh/custom/plugins/
git clone https://github.com/zsh-users/zsh-autosuggestions
```

输入 vi ~/.zshrc 编辑配置，在 plugins 后面的括号中添加插件，插件之间空格隔开，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121712438.webp)

编辑完配置执行 `source ~/.zshrc` 生效。

### 7、安装 iTerm2 Color Schemes

iTerm2 Color Schemes 是 iTerm2 的一份宝贵资源，收集了大量的颜色主题，让你的命令行工作环境更加美观。

执行下面命令从 Github 拉取代码：

```
git clone https://github.com/mbadolato/iTerm2-Color-Schemes
```

在 iTerm2 的设置中进行导入，导入选择的目录为 iTerm2-Color-Schemes/schemes/：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121713891.webp)

导入完成后，就可以选择自己喜欢的配色方案了，我选择的是 Obsidian 。

### 8、设置状态栏

在 iTerm2 的设置中启动状态栏：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121713900.webp)

点击 Configure Status Bar 按钮进行设置：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121713656.webp)

### 9、设置背景

iTerm2 可以设置背景和窗口透明、毛玻璃效果，我尝试后决定只设置一个背景比较好看，背景选择的强风吹拂动漫的一张图。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121713741.webp)

### 10、关闭单击选框

iTerm2 更新 3.5.0 版本后，点击窗口出现紫色框，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121713061.webp)

因为我设置了背景，这样选中后就变得非常难看，可以在设置中进行关闭：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121713472.webp)

### 11、设置右键粘贴

选中复制，右键粘贴这是我使用 shell 时的个人习惯，当然在 iTerm2 中也可以进行右键粘贴的设置：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202406121714991.webp)

* 顶部页签选择 Pointer 后，下面的二级页签选择 Bindings
* 添加一个新的绑定，按照上图的配置即可
