---
title: Office Web APP预览去掉顶部菜单
date: 2015-06-19
categories: [技术]
tags: [C#, Office Web App]
---

Office Web APP应该是用来做Office文档预览最好的方式，原生的预览页面中的顶部会有Microsoft的相关文字以及一些功能按钮，比如文件,查找（如下图）。如果仅仅是预览没有什么问题，但系统中如果预览和下载两个工能的权限是分开的，在预览时文件按钮中的 打印功能可以将文件导出成PDF，这样就分不开这两种功能权限了。下面就介绍怎样将顶部的Microsoft相关文字和功能按钮隐藏掉。

![3cefded1gw1et90cjtya1j20h3056dg4](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301602055.jpg)

## 解决方法

在Office Web APP的预览会涉及4中类型的文 件：Word、Excel、PowerPoint、PDF，不同的类型在预览时调用的文件是不一样的，其中Word和 PDF调用的是同一个文件。每个预览的页面都有对应的CSS文件，如下：

### PowerPoint

```
C:\Program Files\Microsoft Office Web Apps\WebPPTViewer\pptresources\2052\styleread.css
```

### Word

```
C:\Program Files\Microsoft Office Web Apps\WebWordViewer\Resources\2052\WordViewer.css
```

### Excel

```
C:\Program Files\Microsoft Office Web Apps\ExcelServicesWfe\_layouts\styles\excelribbon.css
```

在上面的三个css文件中找到cui-ribbonTopBars，在css样式中追加display:none。下面是修改后的预览效果：

![3cefded1gw1et90ck1vftj20h405j0t4](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301602716.jpg)

