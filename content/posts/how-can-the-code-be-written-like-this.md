---
title: 代码居然还能这样写
date: 2022-04-11T08:20:20+08:00
categories: [技术]
tags: [GitHub Copilot]
---

这篇文章要介绍的是 GitHub Copilot 。

微软去年推出的 GitHub Copilot  是一个基于 AI 的编程辅助工具，简单理解就是我们写点注释或者写个方法名，Copilot 就能理解了我们的意思，然后帮我们写一个相关的方法出来。

<!--more-->

使用 GitHub Copilot 很简单，只需要两步：

1、在 GitHub Copilot 网站上进行注册；

2、在各种 IDE 中安装插件后就可以使用。



在 https://copilot.github.com/  这个网站进行注册，注册成功后，会提示审核通过后会给你的 GitHub 账户中的主要邮箱发送邮件。

![image-20220407162355314](https://img.fwhyy.com/2022/202204102211579.webp)

我大概等待了一天多的时间就收到了邮件。

![image-20220408080124498](https://img.fwhyy.com/2022/202204102232454.webp)

我现在常用的 IDE是：

* Mac 上的 VS Code
* Mac 上的 Rider
* Mac 上的 IDEA
* 虚拟机中的 Visual Studio 2022

恰好，这几个 IDE 都有 GitHub Copilot 插件，下面就看看怎样来具体使用。

## IntelliJ IDEA

1、在 IDEA 的 中 Preferences 中进行插件的安装，搜索 GitHub Copilot 即可；

![image-20220408080748525](https://img.fwhyy.com/2022/202204102211657.webp)

2、安装成功之后，在底部状态栏有红色的小图标

![image-20220408081411509](https://img.fwhyy.com/2022/202204102211404.webp)

3、点击图标进行 Github 的登录，会弹出下面对话框：

![image-20220408081505658](https://img.fwhyy.com/2022/202204102212635.webp)

4、点击”Copy and Open“ ，会进入到网站，在框中粘贴 Code 后继续，出现下面界面：

![image-20220408081944959](https://img.fwhyy.com/2022/202204102212629.webp)

5、选择授权后，IDEA 中会出现下面弹窗，点击 Agree ：

![image-20220408082048388](https://img.fwhyy.com/2022/202204102212962.webp)

6、到这插件就已经安装成功，创建一个空白类 TestGitHubCopilot 类来试试效果，当输入注释 `//冒泡排序` 后回车，等一小会就会出现冒泡排序的代码，如下图：

![image-20220410083840340](https://img.fwhyy.com/2022/202204102212681.webp)

按下 Tab 键这个代码就会插入到类中了，是不是很方便。

## Rider

虽然 VS 也推出了 Mac 版，但在 Mac 中我还是习惯使用 Rider ，功能非常强大。以前在 Windows 中使用 VS 时会安装 Resharp 这个插件来提升效率，而 Rider 是在 Resharp 基础上开发出来的 C# IED。

GitHub Copilot 可以在所有  JetBrains 的工具中使用，Rider 也是其中一员，所以使用步骤和 IDEA 中基本一致。

也同样创建一个 TestGitHubCopilot 空白类来试用，除了写注释，还可以直接写方法名，比如想计算两个日期的天数，可以写方法名 CalculateDaysBetweenDates ，效果如下图：

![image-20220410090250285](https://img.fwhyy.com/2022/202204102212444.webp)

## Visual Studio Code

1、在 VS Code 的插件中搜索 Copilot ，进行安装即可。

![image-20220408101509172](https://img.fwhyy.com/2022/202204102213335.webp)

2、安装完后，需要登录 GitHub，如果错过了登录，将插件禁用再启用，重启 VS Code ，会再次弹出下面的对话框：

![image-20220410131418932](https://img.fwhyy.com/2022/202204102213286.webp)

3、创建一个 js 文件，写一个函数 yanzhengyouxiang ，使用汉语拼音居然也能识别，确实挺厉害的。

如果发现代码不能满足，还可以选择下一个，如果符合要求，按 Tab 键确认。

![image-20220410212453775](https://img.fwhyy.com/2022/202204102213312.webp)

## Visual Studio 2022

1、在 VS 中使用 GitHub Copilot 需要用 17.1.2 或以上版本，点击顶部菜单的扩展->管理扩展进行插件的安装。

不过不是很容易下载成功，试过正常网络和科学上网都是一样，总是下载到一半就提示错误，我运气比较好，尝试很多次后终于成功了。

![image-20220408101353270](https://img.fwhyy.com/2022/202204102213951.webp)

2、下载完成后，安装界面如下图：

![image-20220408101633448](https://img.fwhyy.com/2022/202204102214404.webp)

3、安装成功后，在编辑区域的下方点击小图标，在弹出的菜单中进行登录：

![image-20220410215351733](https://img.fwhyy.com/2022/202204102214184.webp)

4、登录的步骤和上面的一样，登录验证成功后，创建一个 TestGitHubCopilot 类进行测试，在类中输入方法名QuickSort ，立即就出现了提示代码，如下图：

![image-20220410220334549](https://img.fwhyy.com/2022/202204102214026.webp)

GitHub Copilot 虽然功能很强大，而且还在不断学习中，但只能起到帮我们去搜索代码的作用，不过可以畅想一下，虽然 AI 的越来越成熟，有没有可能在我们和客户聊完需求后，稍作整理，就能让 AI 编写出能运行并且符合业务的程序呢？
