---
title: HTML解析组件HtmlAgilityPack使用
date: 2013-09-15
categories: [技术]
tags: [HtmlAgilityPack, HTML解析]
---

HtmlAgilityPack是一个开源的解析HTML元素的类库，最大的特点是可以通过XPath来解析HMTL，如果您以前用C#操作过XML，那么使用起HtmlAgilityPack也会得心应手。目前最新版本为1.4.6,下载地址如下：

[http://htmlagilitypack.codeplex.com/](http://htmlagilitypack.codeplex.com/)

## 使用介绍

下面以一个简单的例子来介绍下HtmlAgilityPack的使用，对于Asp.Net程序开发的网站要做模拟登录的时候，除了要知道用户名文本框和密码文本框的name属性值外，还需要知道页面的__VIEWSTATE、__EVENTVALIDATION这两个隐藏控件的值，以及提交按钮的name属性，下面看看怎样使用HtmlAgilityPack来获得这个额外的值。

1、在项目中添加对HtmlAgilityPack.dll的引用

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290704832.jpg)

2、在Aspx页面中放几个文本框控件和一个按钮控件

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290704038.jpg)

3、按钮的后台事件如下

```
protected void btnHtml_Click(object sender, EventArgs e)
{
    if (tbUrl.Text.Length > 0)
    {
        HtmlWeb htmlWeb = new HtmlWeb();
        HtmlDocument htmlDoc = htmlWeb.Load(this.tbUrl.Text);
        HtmlNode htmlNode = htmlDoc.DocumentNode.SelectSingleNode("//input[@id='__VIEWSTATE']");
        string viewStateValue = htmlNode.Attributes["value"].Value;
        htmlNode = htmlDoc.DocumentNode.SelectSingleNode("//input[@id='__EVENTVALIDATION']");
        string eventValidation = htmlNode.Attributes["value"].Value;
        htmlNode = htmlDoc.DocumentNode.SelectSingleNode("//input[@type='submit']");
        string submitName = htmlNode.Attributes["name"].Value;

        tbViewState.Text = viewStateValue;
        tbEventValidation.Text = eventValidation;
        tbSubmitName.Text = submitName;
    }
}
```

4、以博客园的登录界面为例，获取后的界面如下

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290705365.jpg)

[示例下载](http://pan.baidu.com/share/link?shareid=71500880&uk=2902808695)

