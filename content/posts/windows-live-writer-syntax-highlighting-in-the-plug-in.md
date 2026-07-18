---
title: Windows Live Writer中的语法高亮插件
date: 2009-09-22
categories: [技术]
tags: [语法高亮, 软件推荐]
---

## VSPaste
该插件的作用是可以将 VS、 DELPHI 、VS STUDIO 6 、 SharpDevelop、Zend Studio 等IDE中的代码原样复制到Live Writer中。可以点击[此处](http://files.cnblogs.com/oec2003/VSPaste.zip)下载，下载后解压，将dll文件复制到Live Writer安装目录中的Plugins目录中，如果是安装在C盘，路径如下：C:\Program Files\Windows Live\Writer\Plugins。

从IDE中复制了代码后点击下图中红色标记处就可以将代码复制到Live Writer中

![2010-12-29_160715](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290641313.gif)

## highlight4writer
该插件安装后可以在一个弹出的对话框中选择c c# xml sql 等十几种语言，可以点击此处下载，下载后同样是将解压的文件复制到Plugins目录下，然后打开Live Writer可以看到如下图所示

![2010-12-29_160911](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290641270.gif)

点击就会弹出输入代码的对话框，如下图

![2010-12-29_160950](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290641466.gif)

就我个人感觉而言，使用第一种比较好些，因为第二种会产生很多的html代码，而第一种的html相对简洁，并且代码在一个class为Code的div中，可以自己设置css来改变代码部分的样式。

下面是仿老赵的代码样式的css，打开博客园后台管理–》选项—》Configure ，在《通过css定制页面》下的文本框中加入下面的css样式

```
.Code{
  background: #F8F8EE;
  border-left:solid 3px #6CE26C;
  border-top:dashed 1px #BBBBBB;
  border-right:dashed 1px #BBBBBB;
  border-bottom:dashed 1px #BBBBBB;
  padding: 5px;
  margin: 0 5px 0 5px;
  font-family: Verdana,Helvetica, "微软雅黑" , Arial, "宋体";
}
```

然后在文章中添加的代码效果如下：

```
public class Test
{
}
```

