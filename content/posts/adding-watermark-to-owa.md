---
title: OWA实现添加水印
date: 2017-04-08T00:01:55+08:00
categories: [技术]
tags: [Office Web App, Web API]
---

`OWA`全称`Office Web App`，是用来做`Office`文档预览的一个很好的工具。现在客户有要求，需要在预览界面中添加水印。想起之前写的一篇文章[《Office Web APP预览去掉顶部菜单》](http://fwhyy.com/2015/06/office-web-app-preview-remove-top-menu/)，就是通过修改样式来控制`OWA`的预览界面的。

通过`F12`查看`OWA`预览`Word`的界面，发现`Word`的每一页会被渲染在一个`Img`中展示，如下图：

<!--more-->

![](https://img.fwhyy.com/2022/202201290836644.webp)

思路如下：

1、每一页是一个图片，是否能通过样式让一个`div`展示在图片上面？
2、如果可行，怎样在页面中添加`div`？

通过一通调试，结果如下：

1、通过`F12`编辑`html`代码，添加`div`，设置相关样式可以让`div`展示图片上面；
2、查看`OWA`服务器部署的目录，找到相应的页面，发现前端的页面展示是在服务器端渲染的，所以不是很好在页面中添加`div`；
3、不过从上图可以看出，在img上方有很多的空的`div`，这些`div`是否可以利用起来呢？事实证明是可以的。

实现：

1、做一张透明的文字图片，用来做水印；
2、编辑`OWA`的服务器的目录`C:\Program Files\Microsoft Office Web Apps\WebWordViewer\Resources\2052`中的`WordViewer`文件；
3、搜索`.FShadowBottomRightInner,.FShadowBottomInner,.FShadowBottomLeftInner`，在后面追加下面样式：

```
position: absolute;
    height: 80px;
    background-image: url(http://apiurl/api/file/my/pic/4a15860d-780e-4511-a558-9b857c1bf1f6/%E6%B0%B4%E5%8D%B0/00001.png);
    top: 300px;
    float: left;
    background-color: blue;
```

4、效果如下图：

![](https://img.fwhyy.com/2022/202201290837381.webp)

