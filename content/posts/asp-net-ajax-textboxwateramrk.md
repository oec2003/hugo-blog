---
title: Asp.Net Ajax—TextBoxWateramrk
date: 2007-08-23
categories: [技术]
tags: [Ajax,spNet]
---

## 简介

TextBoxWatermark控件是一个用于TextBox的水印控件,就是在文本框输入文字之前,文本框中有一些提示性的文字,并可以自定义css控制它的样式,实际用处我感觉不是很大,但给用户带来了操作上的方便,也有很好的视觉效果.
<!--more-->

## 重要属性

TargetControlID:要应用水印效果的文本框的ID
WatermarkText:水印效果的提示文本
WatermarkCssClass:水印效果所采用的CSS样式
示例

1 打开vs2005创建一个AjaxControlToolKit网站,命名为oec2003_TextBoxWatermark
2 打开默认的Default.aspx页,切换到设计视图
3 添加两个文本框和两个TextBoxWatermark控件,如下图

![2010-12-30_185000](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290827506.gif)

4 切换到代码视图,设置TextBoxWatermark控件的属性,代码如下

```
<ajaxtoolkit:textboxwatermarkextender id="TextBoxWatermarkExtender1" runat="server"
    targetcontrolid="TextBox2" watermarktext="请输入用户名" watermarkcssclass="water1">
    </ajaxtoolkit:textboxwatermarkextender>

<ajaxtoolkit:textboxwatermarkextender id="TextBoxWatermarkExtender2" runat="server"
    watermarktext="请输入密码" targetcontrolid="TextBox1" watermarkcssclass="water2">
    </ajaxtoolkit:textboxwatermarkextender>
```

5 添加css 如下

```
<style type="text/css">
 .water1
 {
     height:20px;
     width:150px;
     padding:2px 0 0 2px;
     border:1px solid #BEBEBE;
     background-color:#F0F8FF;
     color:red;
}

.water2
{
    height:20px;
    width:150px;
    border:1px none #ffffcc;
    background-color:#ccccff;
    color:green;
}
</style>
```

这儿只是简单地写了点css ,大家也可以通过css写出很漂亮的水印

保存设计,运行程序就能看到效果,当鼠标点击文本框时水印消失,文本框中出现光标,鼠标离开后,水印再次出现.

