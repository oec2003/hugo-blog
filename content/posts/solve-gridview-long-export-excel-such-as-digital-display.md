---
title: 解决AspNet中DataGrid GridView等列表控件导出Excel长数字显示成科学计数法的问题
date: 2011-01-23
categories: [技术]
tags: [AspNet, Excel]
---

大家都知道，在Excel中，当一个单元格中的值为一长串数字，而且该单元格又不是文本格式的时候，这一长串数字会以科学计数法的方式显示，这给我们的阅读带来了障碍。如果是直接在Excel中编辑数据，手动将格式改为“文本”即可，但要是用程序导出的Excel，手动去改就显得很麻烦了。简单的方法就是在程序中导出Excel的时候就设置列为“文本”格式。

AspNet中将DataGrid，GridView等列表控件导出Excel的代码通常如下：

```
DataSet ds = GetData();
this.GridView1.DataSource = ds;
GridView1.DataBind();

//导出Excel的方法
Export(GridView1, "mayfile.xls", "application/ms-excel");
```

现在只需在调用导出Excel方法前对GridView中的列进行设置即可，代码如下：

```
DataSet ds = GetData();
this.GridView1.DataSource = ds;
GridView1.DataBind();

for (int i = 0; i < GridView1.Rows.Count; i++)
{
    for (int j = 0; j < GridView1.Columns.Count; j++)
    {
        GridView1.Rows[i].Cells[j].Attributes.Add("style", "vnd.ms-excel.numberformat:@");
    }
}

//导出Excel的方法
Export(GridView1, "mayfile.xls", "application/ms-excel");
```

上面的代码是将GridView中所有的列都设置成了文本格式，你也可以根据需要对指定的几列进行设置。



