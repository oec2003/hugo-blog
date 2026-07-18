---
title: 推荐两款富文本编辑器：NicEdit和Kindeditor
date: 2010-09-05
categories: [技术]
tags: [CKEditor, CuteEditor, 文本编辑器]
---

做过Web开发的朋友相信都使用过富文本编辑器，比较出名的[CuteEditor](http://cuteeditor.51aspx.com/)和[CKEditor](http://ckeditor.com/)很多人应该已经使用过，在功能强大的同时需要加载的东西也变得很多。下面要推荐的两款富文本编辑器都是使用JS编写，使用简单，非常轻量级。

## NicEditor

NicEdit是一个轻量级，跨平台的Inline Content Editor。NicEdit能够让任何 element/div变成可编辑或者能够把标准的TextArea转换成富文本编辑器。

主页:[http://nicedit.com/](http://nicedit.com/)

下载:[http://nicedit.com/download.php](http://nicedit.com/download.php)

示例:[http://nicedit.com/demos.php](http://nicedit.com/demos.php)

NicEdit是我见过最轻量级的富文本编辑器，总共就一个JS文件和一张图片

![2010-09-05_102850](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301603918.png)

使用也非常简单，只需在页面中添加简单的JS代码就可以将TextBox或是TextArea控件转换成富文本编辑器，代码如下

```
<head runat="server">
    <title>title>
head>
<body>
    <form id="form1" runat="server">
        <script src="../JS/Eidtor/nicEdit.js" type="text/javascript">script>
        <script type="text/javascript">
            bkLib.onDomLoaded(function() {
                new nicEditor({ fullPanel: true }).panelInstance('txtContent');
            });
        script>
        <asp:TextBox runat="server" ID="txtContent"
            TextMode="MultiLine" Height="200px" Width="600px" >asp:TextBox>
    </form>
</body>
</html>
```

运行效果如下

![2010-09-05_104825](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301603551.png)

官网中的版本为英文版，而且字体设置也只能设置英文字体，我对英文版本做了简单的汉化，并且增加了几种中文字体，如下图

![2010-09-05_104528](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301604995.png)

[中文本下载](http://files.cnblogs.com/oec2003/NICEidtor.rar)

## KindEditor

KindEditor是一套开源的HTML可视化编辑器，主要用于让用户在网站上获得所见即所得编辑效果，兼容IE、Firefox、Chrome、Safari、Opera等主流浏览器。 KindEditor使用JavaScript编写，可以无缝的与Java、.NET、PHP、ASP等程序接合。这个是官网上的介绍。

主页：[http://www.kindsoft.net/index.php](http://www.kindsoft.net/index.php)

下载：[http://www.kindsoft.net/down.php](http://www.kindsoft.net/down.php)

示例：[http://www.kindsoft.net/demo.php](http://www.kindsoft.net/demo.php)

KindEditor相比较NicEditor涉及的文件要多很多，不过大小也才几百K而已，下图为文件结构

![2010-09-05_102941](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301604810.png)

使用代码

```
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>title>
head>
<body>
    <form id="form1" runat="server">
    <script charset="utf-8" src="../JS/KindEditor/kindeditor-min.js" 
             type="text/javascript">script>
    <script type="text/javascript" charset="utf-8">
        KE.show({
            id: 'txtContent',
            resizeMode: 1,
            allowPreviewEmoticons: false,
            allowUpload: false,
        });
    script>
    <textarea cols="60" id="txtContent" style="width: 600px; height: 300px;" runat="server"
        readonly="readonly">textarea>
    </form>
</body>
</html>
```

运行效果如下

![2010-09-05_110505](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301604578.png)

