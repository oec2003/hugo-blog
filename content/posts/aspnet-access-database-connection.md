---
title: Asp.Net 连接Access数据库
date: 2009-01-10
categories: [技术]
tags: [AspNet,Access,数据库]
---

自学程序以来，一直使用的都是sqlserver数据库，最近帮一朋友做一个access的demo，发现在数据库的连接方面就存在很大差异，在web.config中配置好连接字符串，然后在后台取，在此我的做法是存两个值，将Provider和assess数据库文件的路径分开存，如下：
<!--more-->

```
<connectionStrings>
  <add name="access_con" connectionString="Provider=Microsoft.Jet.Oledb.4.0;data source="/>
  <add name="access_path" connectionString="~/App_Data/db.mdb"/>
</connectionStrings>
```

因为在配置文件中存放的为相对路径，所以在后台读取出来后要将其转换为绝对路径，如下:

```
private string con_str = ConfigurationManager.ConnectionStrings["access_con"].ConnectionString
+HttpContext.Current.Server.MapPath( ConfigurationManager.ConnectionStrings["access_path"].ConnectionString);
```

主要的区别就在连接字符串方面，其他的操作和sqlserver基本相同，将命名空间和类换成olddb的就行。在webconfig中写连接字符串时有一点需要注意：

```
<add name="access_con" connectionString="Provider=Microsoft.Jet.Oledb.4.0;data source="/>
```

上面代码中的data source 中间一定要有空格，不能写成了datasource ，否则在执行程序的时候就会报错，如下：

![2010-12-30_124238](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290829515.gif)

只要稍微细心点，这种错误就能够避免。

