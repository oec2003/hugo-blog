---
title: 将服务器控件在后台生成html
date: 2008-05-28
categories: [技术]
tags: [AspNet]
---

这个方法很有用，在做一些Ajax应用的时候，可以在后台将gridview 生成hmtl后回传到客户端，可以实现分页的功能。
<!--more-->

代码如下：

```
System.Text.StringBuilder strb = new System.Text.StringBuilder();
System.IO.StringWriter sw = new System.IO.StringWriter(strb);
System.Web.UI.HtmlTextWriter htw = new HtmlTextWriter(sw);
//执行控件的render并输出到HtmlTextWriter里
this.GridView.RenderControl(htw);
string s = strb.ToString();
```

