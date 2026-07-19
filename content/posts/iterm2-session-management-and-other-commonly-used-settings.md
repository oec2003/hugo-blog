---
title: iTerm2 会话管理以及其他常用设置
date: 2024-06-20T08:53:37+08:00
categories: [成长]
tags: [iTerm2, 配置, 技巧]
---

在《我在 Mac 中试过用的那些 shell 工具》中最后介绍 iTerm 的安装以及基本使用，但有一个很重要的功能没有介绍，那就是会话管理。

本文介绍 iTerm2 的会话管理以及一些其他配置。

<!--more-->

## 会话管理

iTerm2 的会话管理没有那么直观，但功能很强大。下面介绍两种方式的会话：直连和跳板机

### 直连

1、在 .ssh 目录中创建文件 iterm2login.sh ，内容如下：

```shell
#!/usr/bin/expect

set timeout 10

set ip "111.22.33.44"
set port "12345"
set username "root"
set password "abc\$123"

spawn ssh -p $port $username@$ip

expect {
  "yes/no" {send "yes\r";exp_continue;}
  "*password:*" { send "$password\r" }
}

interact
```

* 上面的 ip 、port、username、password 为定义的变量，并且赋值给了变量，这种方式是将这些值固定在脚本文件中，当然，也可以以接收参数的方式
* 使用变量的时候使用 $ 加上变量名，例如：$ip
* 正因为使用时前面加上了 $ 符号，如果用户名或密码中包含 $ 时，需要进行转义，例如：密码为 abc$123，设置时为 `set password "abc\$123"`

2、输入 `Command+,` 打开 iTerm2 的设置界面，如下图，点击加号添加一个新的 Profile ：

![](https://img.fwhyy.com/2024/202406191534177.webp)

3、进行配置：

![](https://img.fwhyy.com/2024/202406191534240.webp)

* Shortcut key 配置，可以配置一个快捷键，在需要的时候直接输入快捷键就能进入远程服务器
* Command 选择 Login Shell
* 因为上面的 iterm2login.sh 是没有参数的，所以 Send text as start 直接配置这个文件名即可

### 跳板机

有一种场景是一台外网服务器作为跳板机，先远程到外网服务器，再从外网服务器连接到内网服务器。通过配置可以实现，直接通过跳板机登录到内网。

1、在 .ssh 目录中创建文件 iterm2login_inner.sh ，内容如下：

```shell
 #!/usr/bin/expect

set timeout 10

set ip "111.22.33.44"
set port "12345"
set username "root"
set password "abc\$123"

# 从命令行参数获取内网服务器的IP、用户名和密码
set internal_ip [lindex $argv 0]
set internal_username [lindex $argv 1]
set internal_password [lindex $argv 2]

# 登录跳板机
spawn ssh -p $port $username@$ip

expect {
  "yes/no" {send "yes\r";exp_continue;}
  "*password:*" { send "$password\r" }
}

# 登录内网
expect "# " {send "ssh  $internal_username@$internal_ip\r"}
expect {
  "yes/no" {send "yes\r";exp_continue;}
  "*password:*" { send "$internal_password\r" }
}
interact

```

* 外网服务器的地址直接配置在文件中
* internal_ip、internal_username、internal_password 为三个命令行参数变量，有了变量，多个服务器就能复用一个模板，传递不同的参数就行

2、profile 的配置如下：

![](https://img.fwhyy.com/2024/202406191534028.webp)

* 在文件名后按照参数的顺序分别填 ip、username、password，以空格隔开
* 密码中如果有 $ 符号，需要进行转义

## 安装 bat

在 iTerm2 中查看一些文件的内容，会使用 cat 命令，如果是查看一些代码文件，如果没有语法高亮就不太方便阅读。

使用 bat 工具有三种功能：

* 语法高亮
* git 集成
* 输出看不见的符号

### 安装

在 iTerm2 中执行下面命令就可以安装，详细可以参考 Github 地址：https://github.com/sharkdp/bat

```
brew install bat
```

### 设置别名

执行下面命令进行别名设置，设置后使用熟悉的 cat 命令就可以了：

```shell
echo "alias cat='bat --paging=never'" >> ~/.zshrc
source ~/.zshrc
```

### 语法高亮

![](https://img.fwhyy.com/2024/202406191534621.webp)

### git 集成

![](https://img.fwhyy.com/2024/202406191534303.webp)

### 输出看不见的符号

使用命令 `cat main.js -A`就可以看到，空格、换行等都能显示，如果有中文还会转为 Unicode 编码：

![](https://img.fwhyy.com/2024/202406191535964.webp)

## 开启滚轮

之前使用 Termius ，使用 vi 打开一个文件时，可以使用触模板或者鼠标的滚轮进行快速浏览文件内容，但在 iTerm2 中默认是没有开启的，可以按照下面设置进行开启：

1、打开设置界面，切换到 Advanced 页签，然后在搜索框中输入 mouse 进行过滤：

![](https://img.fwhyy.com/2024/202406191535307.webp)

2、找到下图红框位置的配置项，分别配置为`/j` 和 `/k`

![](https://img.fwhyy.com/2024/202406191535709.webp)

## 常用快捷键

- `Cmd + ,` ：打开 iTerm2 的偏好设置
- `Cmd + T `：新建一个标签页
- `Cmd + W` ：关闭当前标签页
- `Cmd + Shift + [` ：切换到左侧的标签页
- `Cmd + Shift + ]` ：切换到右侧的标签页
- `Cmd + 1` 到 `Cmd + 9` ：直接切换到特定编号的标签页
- `Cmd + N` ：新建一个 iTerm2 窗口
- `Cmd + F` ：在当前标签页中打开查找框
- `Cmd + K` ：清除从光标位置到屏幕底部的所有内容
- `Cmd + D` ：垂直分屏
- `Cmd + Shift + D` ：水平分屏
- `Ctrl + Cmd + F` ：切换到全屏模式
- `Cmd + Q` ：退出 iTerm2

