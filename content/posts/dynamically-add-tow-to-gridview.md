---
title: 动态添加GridView行
date: 2008-02-15
categories: [技术]
tags: [AspNet,GrdiView]
---

## C#代码:

```c#
using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Data.SqlClient;

public partial class _Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!this.IsPostBack)
        {
            BindGrid();
        }
    }

    private DataTable ReadGridView()
    {
        DataTable dt = new DataTable();
        DataRow dr;
        dt.Columns.Add(new DataColumn("ProductID", typeof(string)));
        dt.Columns.Add(new DataColumn("ProductName", typeof(string)));
        dt.Columns.Add(new DataColumn("CategoryID", typeof(string)));
        for (int i = 0; i < this.GridView1.Rows.Count; i++)
        {
            dr = dt.NewRow();
            dr[0] = this.GridView1.Rows[i].Cells[0].Text.Trim();
            dr[1] = this.GridView1.Rows[i].Cells[1].Text.Trim();
            dr[2] = this.GridView1.Rows[i].Cells[2].Text.Trim();
            dt.Rows.Add(dr);
        }
        return dt;
    }
    protected void Button1_Click(object sender, EventArgs e)
    {
        DataTable dt = ReadGridView();
        //this.GridView1.DataSource = dt;
        //this.GridView1.DataBind();
        DataRow row = dt.NewRow();
        row.ItemArray = new object[] { "oec2003", "oec2003", "oec2003" };
        dt.Rows.InsertAt(row, 0);
        dt.AcceptChanges();
        this.GridView1.DataSource = dt;
        this.GridView1.DataBind();
    }

    private void BindGrid()
    {
        string str = ConfigurationManager.ConnectionStrings["NorthwindConnectionString"].ToString();
        using (SqlConnection con = new SqlConnection(str))
        {
            SqlCommand cmd = new SqlCommand("SELECT top 1  [ProductID], [ProductName], [CategoryID] FROM [Products]", con);
            SqlDataAdapter sda = new SqlDataAdapter(cmd);
            DataSet ds = new DataSet();
            sda.Fill(ds);
            this.GridView1.DataSource = ds.Tables[0].DefaultView;
            this.GridView1.DataBind();
            sda.Dispose();
            ds.Dispose();
        }

    }
}
```

## Html代码

```html
<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" 、
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>无标题页</title>
</head>
<body>
    <form id="form2" runat="server">
    <div>
        <asp:Button ID="Button1" runat="server" OnClick="Button1_Click" Text="Button" />
        <asp:GridView ID="GridView2" runat="server" AutoGenerateColumns="False" DataKeyNames="ProductID">
            <Columns>
                <asp:BoundField DataField="ProductID" HeaderText="ProductID" InsertVisible="False"
                    ReadOnly="True" SortExpression="ProductID" />
                <asp:BoundField DataField="ProductName" HeaderText="ProductName" SortExpression="ProductName" />
                <asp:BoundField DataField="CategoryID" HeaderText="CategoryID" SortExpression="CategoryID" />
            </Columns>
        </asp:GridView>
    </div>
    </form>
</body>
</html>
```

## 数据库连接字串

```
<connectionStrings>
 <add name="NorthwindConnectionString"
      connectionString="Data Source=FENGWEI;Initial Catalog=Northwind;User ID=sa;Password=1234"
      providerName="System.Data.SqlClient"/>
</connectionStrings>
```

[AddRow.rar](http://files.cnblogs.com/oec2003/AddRow.rar)

