---
title: Asp.Net中 %= 与%# 的区别
date: 2008-04-03
categories: [技术]
tags: [AspNet]
---

<%= “oec2003” % >  相当于：Response.Write(“oec2003”);
<%# “oec2003” % >  相当于给变量赋值了oec2003

在gridview中将一个绑定列转换成模板列时会看到有如下代码：
<!--more-->

```
<ItemTemplate>
<asp:Label ID="Label1" runat="server" Text='<%# Bind("oec2003") %>'></asp:Label>
</ItemTemplate>
```

上面的语句就将oec2003 这个列的值赋给了Lable1
还可以直接这样写

```
<asp:Label ID="Label2" runat="server" Text='<%#  “Hello oec2003”) %>'></asp:Label>
```

这句相当于：

```
this.Label2.Text=”Hello oec2003″;
```

<%= “”%>是将内容在页面输出，如在页面写如下代码：

```
<html >
 <body >
 <%= "Hello oec2003 ,use =!" %>
 <%# "Hello oec2003  use #!" %>
 </body >
</html >
```

运行后会看到页面会显示：Hello oec2003 use =！ 说明<%= “Hello oec2003 ,use =!” %> 这句起了作用在页面输出了文本。因为 <%# “Hello oec2003  use #!” %>  是相当于赋值，在上面代码中没有接收值得变量，所以也就看不见运行效果。

