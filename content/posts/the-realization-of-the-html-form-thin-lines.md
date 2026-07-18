---
title: Html细线表格的实现
date: 2008-01-10
categories: [技术]
tags: [HTML]
---

在网页制作中，我们常常会使用到表格，表格使得需要表达的信息更清楚，明了。

```
<table border="1" cellspacing="0" bordercolor="#000000" width = "80%">
    <tr>
        <td>1.1</td>
        <td>1.2</td>
    </tr>
    <tr>
        <td>2.1</td>
        <td>2.2</td>
    </tr>
<table>
```

这段代码定义了border = 1pix的表格，但实际上表格的实际边框宽度为2pix, 这是因为表格边框由：表格外边框和单元格边框两部分构成。那么如何定义一个细线表格(实际边宽为1pix) 呢？

### 使用 cellspacing和背景色技术:

```
<table border="0" cellspacing="1" bgcolor="#000000" width = "80%">
    <tr bgcolor="#ffffff">
        <td>1.1</td>
        <td>1.2</td>
    </tr>
    <tr bgcolor="#ffffff">
        <td>2.1</td>
        <td>2.2</td>
    </tr>
<table> 
```

### 使用border-collapse属性:

```
<table border="1" cellspacing="0" bordercolor="#000000" width = "80%"
           style="border-collapse:collapse;">
    <tr>
        <td>1.1</td>
        <td>1.2</td>
    </tr>
    <tr>
        <td>2.1</td>
        <td>2.2</td>
    </tr>
<table>
```

