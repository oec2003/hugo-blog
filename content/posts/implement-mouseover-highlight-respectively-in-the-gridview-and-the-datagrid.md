---
title: 实现鼠标悬停高亮显示—分别在gridview和datagrid中
date: 2007-05-07
categories: [技术]
tags: [AspNet,GrdiView,小技巧]
---

在datagrid中的ItemDataBound事件中写如下代码：

```
private void DataGrid1_ItemDataBound(object sender, System.Web.UI.WebControls.DataGridItemEventArgs e)
{
    if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
    {
        e.Item.Attributes.Add("onmouseover", "c=this.style.backgroundColor;this.style.backgroundColor='#66CCFF'");
        e.Item.Attributes.Add("onmouseout", "this.style.backgroundColor=c");
    }
}
```

在girdview中的RowDataBound事件中写下如下代码：

```
protected void GridView1_RowDataBound(object sender, GridViewRowEventArgs e)
{
    if (e.Row.RowType == DataControlRowType.DataRow)
    {
        e.Row.Attributes.Add("onmouseover", "currentcolor=this.style.backgroundColor;this.style.backgroundColor='#6699ff';");
        e.Row.Attributes.Add("onmouseout", "this.style.backgroundColor=currentcolor;");
    }
}
```

