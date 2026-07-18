---
title: Net4.0—数据绑定控件（GridView ListView…）中的ClientIDRowSuffix属性
date: 2010-07-30
categories: [技术]
tags: [AspNet, DotNet4]
---

在AspNet4中的数据绑定控件（GridView ListView…）中新增了一个ClientIDRowSuffix属性，ClientIDRowSuffix属性可以影响数据绑定控件内部控件的ID，ClientIDRowSuffix控件的值可以设置为数据绑定控件的数据源的任何一列。值得注意的是ClientIDRowSuffix属性是和ClientIDMode属性配合使用的。ClientIDMode有四种属性值，这个在[Net4.0—对HTML净化的处理](http://blog.fwhyy.com/?p=18)一文中有提到，下面介绍如何在数据绑定控件中使用ClientIDRowSuffix：

1 在页面中放一个GridView控件，在控件添加一个模板列，模板列中添加一个Lable控件，ID设置为lblId，代码如下：

```
<asp:GridView ID="GridView1" runat="server"
    ClientIDRowSuffix="UserId" ClientIDMode="Predictable" >
    <Columns>
        <asp:TemplateField>
            <ItemTemplate>
                <asp:Label ID="lblId" runat="server"></asp:Label>
            </ItemTemplate>
        </asp:TemplateField>
    </Columns>
</asp:GridView>
```

2 进入后台代码视图，添加一个User类做数据源用，在PageLoad事件中绑定GridView，代码如下：

```
public partial class WebForm1 : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        List<User> list = new List<User>
        {
            new User{UserId=10,UserName="oec2003"},
            new User{UserId=20,UserName="oec2004"}
        };
        if (!Page.IsPostBack)
        {
            this.GridView1.DataSource = list;
            this.GridView1.DataBind();
        }
    }
}
public class User
{
    public int UserId { get; set; }
    public string UserName { get; set; }
}
```

3 设置GridView的属性ClientIDMode为不同值，运行程序查看源码，观察Lable控件的ID，如下图：

AutoID

![2010-07-30_112500](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300731399.png)

Inherit

![2010-07-30_112644](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300731940.png)

Predictable

![2010-07-30_112747_thumb](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300731460.png)


Static

![2010-07-30_112954](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300732906.png)

## 总结

* 1 根据上图看以看出当ClientIDMode值为Predictable和Inherit时，ClientIDRowSuffix的设置才起了作用，将ClientIDRowSuffix设置的UserId字段的值拼接到了Lable控件的ID属性后。
* 2 在网上的一些资料表明ClientIDRowSuffix属性要和ClientIDMode属性一起使用，并且ClientIDMode属性的值要设置成Predictable，但我将GridView中的ClientIDMode属性去掉后运行，看到的源码和设置ClientIDMode为Predictable得到的源码一致。也就是说只设置GrieView的ClientIDRowSuffix就可以得到想要的结果。
* 3 ClientIDRowSuffix属性还可以设置对应多个字段，如ClientIDRowSuffix=”UserId,UserName”，这样得到的控件的ID是多个字段值的拼接。
* 4 在AspNet4的数据绑定控件中，只有GridView和ListView有ClientIDRowSuffix属性。

