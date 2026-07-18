---
title: My97 使用的一点技巧
date: 2008-10-15
categories: [技术]
tags: [javascript,My97]
---

## 需求：

1.两个时间文本框，一个开始时间和一个结束时间，两个时间都是今天起以后的时间，并且开始时间不能大于结束时间。

这样的需求在很多地方都会应用到，比如有些网站提供一些服务的购买，用户需要选择要购买服务的时间域等等。

在My97的官网中有自定义时间的例子，我只是根据需要稍加了修改，代码如下:

```
<html>
<head><title></title>
<script type="text/javascript" src="WdatePicker.js"></script>
</head>
<body>
<input id="txtB" type="text"
onclick="WdatePicker({minDate:'%y-%M-#{%d}',maxDate:'#F{$dp.$D(\'txtE\',{d:-1})}'})"/>
<input id="txtE" type="text"
onFocus="WdatePicker({minDate:'#F{$dp.$D(\'txtB\',{d:1})||\'%y-%M-#{%d+2}\'}'})"/>

</body>

</html>
```



