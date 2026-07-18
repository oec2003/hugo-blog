---
title: Net4.0—AspNet中URL重写的改进
date: 2010-07-27
categories: [技术]
tags: [AspNet, DotNet4, URL重写]
---

URL重写有很多的好处，如有利于SEO、便于记忆、隐藏真实路径使安全性提高、便于更新等等。在AspNet4.0之前的版本中要实现URL重写比较复杂，有时还会借助第三方类库，而在AspNet4.0中可以很方面实现，下面就一步一步来讲解怎样在AspNet4.0中实现URL重写。

1 打开VS2010，创建一个AspNet项目命名为UrlRewriterDemo。

![2010-07-27_100812](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300727900.png)

可以看到AspNet4中的项目结构有点类似AspNet MVC ，加了很多现成的东西，只需稍加修改就可以变成一个简单的个人站点。

2 打开Global.asax文件，引用命名空间System.Web.Routing，System.Web.Routing命名空间在Net3.5中就已经存在，不过功能没有4.0中的强大。在该文件中添加如下方法:

```
void RegisterRoutes(RouteCollection routes)
{
    routes.MapPageRoute("productdetail",
        "products/{category}/{name}",
        "~/test.aspx", false,
        new RouteValueDictionary { { "category", "book" }, { "name", "aspnet" } });
}
```

MapPageRoute方法的参数解释：

* “productdetail”：路由名称，取一个和当前路由设置相匹配的名称即可。
* “products/{category}/{name}”：URL的重写规则。
* “~/test.aspx”：配置对应的物理文件。
* new RouteValueDictionary { { “category”, “book” }, { “name”, “aspnet” } }：配置默认值。

3 在Global.asax中的方法Application_Start中添加如下代码：

```
void Application_Start(object sender, EventArgs e)
{
    RegisterRoutes(RouteTable.Routes);
}
```

4 在项目中添加一个页面命名为test.aspx，如果命名为别的名称，在上面的MapPageRoute方法的配置物理文件的参数就应该设置为相应的名称。在test.aspx页面中添加如下内容：

```
<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
    <h1>Url Rewriter Test Page!</h1>
</asp:Content>
```

5 将该项目设置为固定端口，比如10000，按F5运行项目，将URL地址修改为http://localhost:10000/products，此处的products为URL重写规则中配置的名称。运行结果如下：

![2010-07-27_104717_thumb](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300727307.png)

6 我们在RegisterRoutes中配置了默认参数值category和name，如需要在页面中获取参数值，可以使用RouteData.Values，将test.aspx页面代码修改如下：

```
<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
    <h1>Url Rewriter Test Page!</h1><br />

    分类名为：<%= RouteData.Values["category"] %><br />
    产品名为：<%= RouteData.Values["name"] %>
</asp:Content>
```

7 刷新页面可以看到在RegisterRoutes中配置的默认值会呈现在页面上：

![2010-07-27_111408](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300728509.png)

8 将URL修改为http://localhost:10000/products/computer/thinkpad，再刷新页面可以看到页面中呈现的是URL中设置的分类名和产品名:

