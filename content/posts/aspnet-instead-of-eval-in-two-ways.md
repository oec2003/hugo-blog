---
title: Asp.Net中替代Eval的两种方式
date: 2009-06-26
categories: [技术]
tags: [AspNet, Eval]
---

在asp.net中的数据绑定中，我们经常会用到Eval，不过大家都知道Eval绑定是通过反射来实现的， 而反射势必会对性能造成一定的影响。不过有两种替代的方式来实现绑定数据，对性能略有提高。

1 当数据源为DataTable时，用下面的方式:

后台代码

```
protected void Page_Load(object sender, EventArgs e)
{
    DataTable dt = new DataTable();
    dt.Columns.Add("Name", typeof(System.String));
    dt.Columns.Add("Age", typeof(System.Int32));
    for (int i = 0; i <= 20; i++)
    {
        DataRow dr = dt.NewRow();
        dr[0] = "oec2003_" + i.ToString();
        dr[1] = i + 20;
        dt.Rows.Add(dr);
    }

    rptUser.DataSource = dt;
    rptUser.DataBind();
}
```

前台代码

```
<asp:Repeater ID="rptUser" runat="server">
    <ItemTemplate>
        姓名：<%# ((DataRowView)(Container.DataItem))["Name"]  %>
                年龄：<%# ((DataRowView)(Container.DataItem))["Age"]%><br />
    </ItemTemplate>
</asp:Repeater>
```

2 当数据源为泛型类时，用下面的方式。

后台代码

```
protected void Page_Load(object sender, EventArgs e)
{
    List<User> user = new List<User>();
    for (int i = 0; i < 10; i++)
    {
        user.Add(new User(i, "oec2003"));
    }
    rptUser.DataSource = user;
    rptUser.DataBind();
}
```

前台代码

```
<asp:Repeater ID="rptUser" runat="server">
    <ItemTemplate>
        姓名：<%# (Container.DataItem as User).Name  %>
                年龄：<%# (Container.DataItem as User).Age%><br />
    </ItemTemplate>
</asp:Repeater>
```

经过测试在10w以上数据量的时候性能差别才比较明显，而我们平时做数据绑定的时候通常都是用的分页存储过程或其他的分页方式，每页最多几十条数据，所以我认为Eval在性能上的损耗并不构成性能瓶颈。

