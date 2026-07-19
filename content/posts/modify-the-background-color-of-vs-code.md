---
title: 修改VS Code背景色
date: 2018-07-21T23:04:03+08:00
categories: [技术]
tags: [经验总结]
---

一直以来都是在`Windows`下进行开发，VS自定义的字体和背景色已经跟了我十来年了，最近已渐渐不使用`Mac`下的`Windows`虚拟机了，主力开发工具就变成了`VS Code For Mac`和`Visual Studio For Mac`。没有了之前的背景色还真不习惯，下面介绍怎样修改`Mac`下的`VS Code`和`VS`的背景色。

<!--more-->

## VS Code

1、打开VS Code的「首选项/设置」

![首选项/设置](https://img.fwhyy.com/2022/202201262140886.webp)


2、在用户设置中添加如下配置代码

```
    "workbench.colorCustomizations": {
        "editor.background": "#FFF6A2"
        //设置用户选中代码段的颜色 
        //"editor.selectionBackground": "#2f00ff",
        //搜索匹配的背景色
        //"editor.findMatchBackground": "#ff0000",
        //"editor.findMatchHighlightBackground": "#ff00ff",
        //"editor.findRangeHighlightBackground": "#ff9900"

    }
```

## VS For Mac

1、将`Windows`下的配置导出成`.vssettings`文件

2、在`VS For Mac`上打开「首选项/颜色主题」，点击添加选择导出的`vssettings`文件

![首选项/颜色主题](https://img.fwhyy.com/2022/202201262141815.webp)

