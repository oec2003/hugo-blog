---
title: JS中的Replace方法
date: 2012-04-16
categories: [技术]
tags: [javascript]
---

最近查一个bug，原因是JS中的Replace方法造成的，当将一个字符串中有处需要替换时，一般会用到JS中的Replace方法，Replace方法的第一个参数如果是传的字符串，只会替换第一处。代码如下：

```
var str = "0CEA65D5-DB8E-4876-A6F8-C88AC7F0E185,E846C244-8A19-4374-879B-0B1DC08D1747,6CB3EBA4-1E22-4E4D-8800-AE31130B6F5D";
alert(str.replace(",","','"));
```

上面的代码本意是将用逗号隔开的GUID的逗号替换成’,’，但实际结果只将第一个逗号替换了。

![2012-04-16_230940](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302116081.jpg)

解决这个问题只需将replace的第一个参数使用正则的方式即可，代码如下:

```
var reg = new RegExp(",","g");
var str = "0CEA65D5-DB8E-4876-A6F8-C88AC7F0E185,E846C244-8A19-4374-879B-0B1DC08D1747,6CB3EBA4-1E22-4E4D-8800-AE31130B6F5D";
alert(str.replace(reg,"','"));
```

结果如下：

![2012-04-16_231320](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302116958.jpg)

